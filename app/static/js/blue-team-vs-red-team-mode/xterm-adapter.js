/**
 * BlueTeamXtermAdapter - xterm.js adapter for Blue Team vs Red Team mode
 * Provides terminal emulation for the defense command terminal
 */
export class BlueTeamXtermAdapter {
    constructor(container, gameController) {
        this.container = container;
        this.gameController = gameController;
        this.term = null;
        this.fitAddon = null;
        this.currentLine = '';
        this.cursorPosition = 0;
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.initialize();
    }
    
    initialize() {
        // Check if xterm.js is available
        if (typeof Terminal === 'undefined') {
            console.error('xterm.js is not loaded');
            return;
        }
        
        // Create terminal instance
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
                red: '#f87171',
                green: '#4ade80',
                yellow: '#facc15',
                blue: '#60a5fa',
                magenta: '#c084fc',
                cyan: '#22d3ee',
                white: '#e5e7eb',
                brightBlack: '#6b7280',
                brightRed: '#fca5a5',
                brightGreen: '#86efac',
                brightYellow: '#fde047',
                brightBlue: '#93c5fd',
                brightMagenta: '#d8b4fe',
                brightCyan: '#67e8f9',
                brightWhite: '#f9fafb'
            },
            rows: 20,
            scrollback: 1000,
            convertEol: true
        });
        
        // Load fit addon if available
        if (typeof FitAddon !== 'undefined') {
            this.fitAddon = new FitAddon.FitAddon();
            this.term.loadAddon(this.fitAddon);
        }
        
        // Open terminal
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
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (this.fitAddon) {
                this.fitAddon.fit();
            }
        });
    }
    
    setupEventHandlers() {
        this.term.onData(data => {
            this.handleInput(data);
        });
        
        this.term.onKey(({ key, domEvent }) => {
            this.handleKeyEvent(key, domEvent);
        });
    }
    
    showWelcomeMessage() {
        this.term.writeln('\x1b[32m$ Defense Command Terminal - Ready\x1b[0m');
        this.term.writeln('\x1b[32m$ Monitoring Project Sentinel Academy...\x1b[0m');
        this.term.writeln('\x1b[32m$ Type "help" for available commands\x1b[0m');
        this.term.writeln('');
    }
    
    showPrompt() {
        this.term.write('\x1b[32m$ \x1b[0m');
    }
    
    handleInput(data) {
        const code = data.charCodeAt(0);
        
        if (code === 13) { // Enter
            this.handleEnter();
        } else if (code === 127) { // Backspace
            this.handleBackspace();
        } else if (code === 3) { // Ctrl+C
            this.handleCtrlC();
        } else if (code >= 32) { // Printable characters
            this.handleCharacter(data);
        }
    }
    
    handleKeyEvent(key, domEvent) {
        const ev = domEvent;
        
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
        this.currentLine = 
            this.currentLine.slice(0, this.cursorPosition) +
            char +
            this.currentLine.slice(this.cursorPosition);
        this.cursorPosition++;
        
        this.term.write(char);
        
        if (this.cursorPosition < this.currentLine.length) {
            const rest = this.currentLine.slice(this.cursorPosition);
            this.term.write(rest);
            for (let i = 0; i < rest.length; i++) {
                this.term.write('\x1b[D');
            }
        }
    }
    
    handleBackspace() {
        if (this.cursorPosition > 0) {
            this.currentLine = 
                this.currentLine.slice(0, this.cursorPosition - 1) +
                this.currentLine.slice(this.cursorPosition);
            this.cursorPosition--;
            
            this.term.write('\x1b[D');
            this.term.write('\x1b[K');
            const rest = this.currentLine.slice(this.cursorPosition);
            this.term.write(rest);
            
            for (let i = 0; i < rest.length; i++) {
                this.term.write('\x1b[D');
            }
        }
    }
    
    handleEnter() {
        this.term.writeln('');
        
        const command = this.currentLine.trim();
        
        if (command) {
            // Add to history
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
            
            // Execute command
            this.gameController.handleTerminalCommand(command);
        } else {
            // Empty command, just show new prompt
            this.showPrompt();
        }
        
        // Reset line
        this.currentLine = '';
        this.cursorPosition = 0;
    }
    
    handleCtrlC() {
        this.term.writeln('^C');
        this.currentLine = '';
        this.cursorPosition = 0;
        this.showPrompt();
    }
    
    handleArrowUp() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.clearCurrentLine();
            this.currentLine = this.commandHistory[this.historyIndex];
            this.cursorPosition = this.currentLine.length;
            this.term.write(this.currentLine);
        }
    }
    
    handleArrowDown() {
        if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.clearCurrentLine();
            this.currentLine = this.commandHistory[this.historyIndex];
            this.cursorPosition = this.currentLine.length;
            this.term.write(this.currentLine);
        } else if (this.historyIndex === this.commandHistory.length - 1) {
            this.historyIndex++;
            this.clearCurrentLine();
            this.currentLine = '';
            this.cursorPosition = 0;
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
        for (let i = 0; i < this.cursorPosition; i++) {
            this.term.write('\x1b[D');
        }
        this.term.write('\x1b[K');
    }
    
    // Add output to terminal
    addOutput(text, type = 'normal') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : '$';
        
        let color = '\x1b[90m'; // gray for normal
        if (type === 'success') {
            color = '\x1b[32m'; // green
        } else if (type === 'error') {
            color = '\x1b[31m'; // red
        }
        
        this.term.writeln(`${color}[${timestamp}] ${prefix} ${text}\x1b[0m`);
        this.showPrompt();
    }
    
    // Clear terminal
    clear() {
        this.term.clear();
        this.term.writeln('\x1b[32m$ Defense Command Terminal - Ready\x1b[0m');
        this.showPrompt();
    }
    
    // Dispose terminal
    dispose() {
        if (this.term) {
            this.term.dispose();
        }
    }
}
