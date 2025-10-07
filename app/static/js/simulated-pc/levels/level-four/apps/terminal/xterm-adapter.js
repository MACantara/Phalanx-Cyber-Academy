/**
 * XtermAdapter - Adapter layer for xterm.js terminal emulation
 * Provides a bridge between xterm.js and the existing command processor
 */
export class XtermAdapter {
    constructor(container, commandProcessor, terminalApp) {
        this.container = container;
        this.commandProcessor = commandProcessor;
        this.terminalApp = terminalApp;
        this.term = null;
        this.fitAddon = null;
        this.currentLine = '';
        this.cursorPosition = 0;
        
        this.initialize();
    }
    
    initialize() {
        // Check if xterm.js is available
        if (typeof Terminal === 'undefined') {
            console.error('xterm.js is not loaded');
            return;
        }
        
        // Create terminal instance with configuration
        this.term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'block',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 14,
            theme: {
                background: '#000000',
                foreground: '#4ade80', // green-400
                cursor: '#4ade80',
                selection: 'rgba(74, 222, 128, 0.3)',
                black: '#000000',
                red: '#f87171', // red-400
                green: '#4ade80', // green-400
                yellow: '#facc15', // yellow-400
                blue: '#60a5fa', // blue-400
                magenta: '#c084fc', // purple-400
                cyan: '#22d3ee', // cyan-400
                white: '#e5e7eb', // gray-200
                brightBlack: '#6b7280', // gray-500
                brightRed: '#fca5a5',
                brightGreen: '#86efac',
                brightYellow: '#fde047',
                brightBlue: '#93c5fd',
                brightMagenta: '#d8b4fe',
                brightCyan: '#67e8f9',
                brightWhite: '#f9fafb'
            },
            rows: 24,
            scrollback: 1000,
            convertEol: true
        });
        
        // Create and load fit addon for responsive sizing
        if (typeof FitAddon !== 'undefined') {
            this.fitAddon = new FitAddon.FitAddon();
            this.term.loadAddon(this.fitAddon);
        }
        
        // Open terminal in container
        this.term.open(this.container);
        
        // Fit terminal to container
        if (this.fitAddon) {
            setTimeout(() => {
                this.fitAddon.fit();
            }, 100);
        }
        
        // Show welcome message
        this.showWelcomeMessage();
        
        // Show initial prompt
        this.showPrompt();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.fitAddon) {
                this.fitAddon.fit();
            }
        });
    }
    
    setupEventHandlers() {
        // Handle user input
        this.term.onData(data => {
            this.handleInput(data);
        });
        
        // Handle key events
        this.term.onKey(({ key, domEvent }) => {
            this.handleKeyEvent(key, domEvent);
        });
    }
    
    showWelcomeMessage() {
        this.term.writeln('\x1b[32mWelcome to The White Hat Test - Responsible Disclosure CTF\x1b[0m');
        this.term.writeln('\x1b[33mYour mission: Find 3 hidden flags and complete a responsible disclosure report\x1b[0m');
        this.term.writeln('\x1b[90mType \'help\' for available commands | Type \'submit-flag --challenges\' to see available challenges\x1b[0m');
        this.term.writeln('\x1b[34m💡 Use \'submit-flag WHT{flag-value}\' to submit captured flags for verification\x1b[0m');
        this.term.writeln('');
    }
    
    showPrompt() {
        const prompt = this.commandProcessor.getPrompt();
        this.term.write(prompt);
    }
    
    handleInput(data) {
        const code = data.charCodeAt(0);
        
        // Handle special keys
        if (code === 13) { // Enter
            this.handleEnter();
        } else if (code === 127) { // Backspace
            this.handleBackspace();
        } else if (code === 9) { // Tab
            this.handleTab();
        } else if (code === 3) { // Ctrl+C
            this.handleCtrlC();
        } else if (code === 27) { // Escape sequences (arrows, etc.)
            // These are handled in onKey
        } else if (code >= 32) { // Printable characters
            this.handleCharacter(data);
        }
    }
    
    handleKeyEvent(key, domEvent) {
        const ev = domEvent;
        
        // Handle arrow keys
        if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            this.handleArrowUp();
        } else if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            this.handleArrowDown();
        } else if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            this.handleArrowLeft();
        } else if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            this.handleArrowRight();
        }
    }
    
    handleCharacter(char) {
        // Insert character at cursor position
        this.currentLine = 
            this.currentLine.slice(0, this.cursorPosition) +
            char +
            this.currentLine.slice(this.cursorPosition);
        this.cursorPosition++;
        
        // Echo the character
        this.term.write(char);
        
        // If cursor is not at end, redraw rest of line
        if (this.cursorPosition < this.currentLine.length) {
            const rest = this.currentLine.slice(this.cursorPosition);
            this.term.write(rest);
            // Move cursor back
            for (let i = 0; i < rest.length; i++) {
                this.term.write('\x1b[D');
            }
        }
    }
    
    handleBackspace() {
        if (this.cursorPosition > 0) {
            // Remove character at cursor position
            this.currentLine = 
                this.currentLine.slice(0, this.cursorPosition - 1) +
                this.currentLine.slice(this.cursorPosition);
            this.cursorPosition--;
            
            // Move cursor back, clear to end of line, redraw
            this.term.write('\x1b[D'); // Move left
            this.term.write('\x1b[K'); // Clear to end of line
            const rest = this.currentLine.slice(this.cursorPosition);
            this.term.write(rest);
            
            // Move cursor back to position
            for (let i = 0; i < rest.length; i++) {
                this.term.write('\x1b[D');
            }
        }
    }
    
    async handleEnter() {
        this.term.writeln('');
        
        const command = this.currentLine.trim();
        
        if (command) {
            // Execute command through command processor
            try {
                await this.commandProcessor.executeCommand(command);
                
                // Emit events for system monitoring
                document.dispatchEvent(new CustomEvent('terminal-command', {
                    detail: { 
                        command: command,
                        user: 'researcher',
                        exitCode: 0
                    }
                }));
                
                // Check if security command
                if (this.isSecurityCommand(command)) {
                    document.dispatchEvent(new CustomEvent('security-command-executed', {
                        detail: { 
                            command: command,
                            result: 'success',
                            risk: this.getCommandRisk(command)
                        }
                    }));
                }
            } catch (error) {
                this.writeLine(`Error: ${error.message}`, 'error');
            }
            
            // Reset command history navigation
            this.commandProcessor.history.reset();
        }
        
        // Reset line
        this.currentLine = '';
        this.cursorPosition = 0;
        
        // Show new prompt
        this.showPrompt();
    }
    
    handleTab() {
        // Get tab completion
        const completion = this.commandProcessor.getTabCompletion(
            this.currentLine,
            this.cursorPosition
        );
        
        if (completion) {
            // Clear current line
            this.clearCurrentLine();
            
            // Write new text
            this.currentLine = completion.newText;
            this.cursorPosition = completion.newCursorPosition;
            this.term.write(this.currentLine);
            
            // Show suggestions if multiple matches
            if (completion.suggestions && completion.suggestions.length > 1) {
                this.term.writeln('');
                this.showTabSuggestions(completion.suggestions);
                this.showPrompt();
                this.term.write(this.currentLine);
            }
        }
    }
    
    handleCtrlC() {
        this.term.writeln('^C');
        this.currentLine = '';
        this.cursorPosition = 0;
        this.showPrompt();
    }
    
    handleArrowUp() {
        const prevCommand = this.commandProcessor.history.getPrevious();
        if (prevCommand !== null) {
            this.clearCurrentLine();
            this.currentLine = prevCommand;
            this.cursorPosition = this.currentLine.length;
            this.term.write(this.currentLine);
        }
    }
    
    handleArrowDown() {
        const nextCommand = this.commandProcessor.history.getNext();
        if (nextCommand !== null) {
            this.clearCurrentLine();
            this.currentLine = nextCommand;
            this.cursorPosition = this.currentLine.length;
            this.term.write(this.currentLine);
        }
    }
    
    handleArrowLeft() {
        if (this.cursorPosition > 0) {
            this.cursorPosition--;
            this.term.write('\x1b[D');
        }
    }
    
    handleArrowRight() {
        if (this.cursorPosition < this.currentLine.length) {
            this.cursorPosition++;
            this.term.write('\x1b[C');
        }
    }
    
    clearCurrentLine() {
        // Move to beginning of line
        for (let i = 0; i < this.cursorPosition; i++) {
            this.term.write('\x1b[D');
        }
        // Clear to end of line
        this.term.write('\x1b[K');
    }
    
    showTabSuggestions(suggestions) {
        // Categorize suggestions
        const commands = suggestions.filter(s => 
            !s.includes('/') && 
            !s.includes('.') && 
            !s.startsWith('-') &&
            this.commandProcessor.commandRegistry.hasCommand(s)
        );
        
        const flags = suggestions.filter(s => s.startsWith('-'));
        const directories = suggestions.filter(s => s.endsWith('/') && !s.startsWith('-'));
        const files = suggestions.filter(s => 
            !s.endsWith('/') && 
            (s.includes('.') || s.includes('/')) && 
            !s.startsWith('-') &&
            !commands.includes(s)
        );
        const other = suggestions.filter(s => 
            !commands.includes(s) && 
            !flags.includes(s) && 
            !directories.includes(s) &&
            !files.includes(s)
        );
        
        if (commands.length > 0) {
            this.term.writeln('\x1b[34mCommands: \x1b[0m' + commands.join('  '));
        }
        if (flags.length > 0) {
            this.term.writeln('\x1b[34mOptions: \x1b[0m' + flags.join('  '));
        }
        if (directories.length > 0) {
            this.term.writeln('\x1b[34mDirectories: \x1b[0m' + directories.join('  '));
        }
        if (files.length > 0) {
            this.term.writeln('\x1b[34mFiles: \x1b[0m' + files.join('  '));
        }
        if (other.length > 0) {
            this.term.writeln('\x1b[34mAvailable: \x1b[0m' + other.join('  '));
        }
        
        // If no categorization worked, just show all
        if (commands.length === 0 && flags.length === 0 && 
            directories.length === 0 && files.length === 0 && other.length === 0) {
            this.term.writeln(suggestions.join('  '));
        }
    }
    
    // Write output to terminal
    writeLine(text, className = '') {
        // Check for flag patterns
        this.checkForFlags(text);
        
        // Handle multi-line text
        const lines = text.split('\n');
        
        lines.forEach(line => {
            // Apply color based on className
            let color = '';
            switch (className) {
                case 'error':
                    color = '\x1b[31m'; // Red
                    break;
                case 'command':
                    color = '\x1b[37m'; // White
                    break;
                case 'directory':
                    color = '\x1b[34m'; // Blue
                    break;
                case 'suspicious-file':
                    color = '\x1b[31m'; // Red
                    break;
                case 'file':
                    color = '\x1b[32m'; // Green
                    break;
                case 'text-blue-400':
                    color = '\x1b[34m'; // Blue
                    break;
                case 'text-yellow-400':
                    color = '\x1b[33m'; // Yellow
                    break;
                case 'text-gray-400':
                    color = '\x1b[90m'; // Gray
                    break;
                default:
                    color = '';
            }
            
            if (color) {
                this.term.writeln(color + line + '\x1b[0m');
            } else {
                this.term.writeln(line);
            }
        });
    }
    
    // Clear terminal
    clear() {
        this.term.clear();
        this.term.writeln('Terminal cleared');
    }
    
    // Check for CTF flags
    checkForFlags(text) {
        const flagPattern = /WHT\{[^}]+\}/g;
        const matches = text.match(flagPattern);
        
        if (matches) {
            matches.forEach(flag => {
                console.log('[XtermAdapter] Flag discovered in output:', flag);
                
                try {
                    if (typeof window !== 'undefined' && window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('level4-flag-discovered', {
                            detail: {
                                flag: flag,
                                source: 'terminal',
                                timestamp: Date.now()
                            }
                        }));
                    }
                } catch (error) {
                    console.error('[XtermAdapter] Error dispatching flag discovery event:', error);
                }
            });
        }
    }
    
    isSecurityCommand(command) {
        const securityCommands = [
            'sudo', 'su', 'chmod', 'chown', 'passwd', 'ssh', 'scp',
            'netstat', 'ps', 'top', 'kill', 'nmap', 'scan',
            'iptables', 'ufw', 'ls', 'cat', 'grep', 'find'
        ];
        
        return securityCommands.some(cmd => command.trim().startsWith(cmd));
    }
    
    getCommandRisk(command) {
        const highRiskCommands = ['sudo', 'su', 'chmod 777', 'rm -rf', 'passwd'];
        const mediumRiskCommands = ['netstat', 'ps', 'kill', 'ssh'];
        
        if (highRiskCommands.some(cmd => command.includes(cmd))) {
            return 'high';
        } else if (mediumRiskCommands.some(cmd => command.includes(cmd))) {
            return 'medium';
        }
        return 'low';
    }
    
    // Dispose terminal
    dispose() {
        if (this.term) {
            this.term.dispose();
        }
    }
}
