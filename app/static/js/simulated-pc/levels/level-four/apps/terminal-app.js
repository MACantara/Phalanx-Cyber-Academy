import { WindowBase } from '/static/js/simulated-pc/desktop-components/window-base.js';
import { CommandProcessor } from './terminal/terminal-functions/command-processor.js';

export class TerminalApp extends WindowBase {
    constructor() {
        super('terminal', 'Terminal', {
            width: '70%',
            height: '60%'
        });
        
        this.commandProcessor = null;
    }

    createContent() {
        return `
            <div class="h-full bg-black text-green-400 font-mono text-sm p-3 flex flex-col" id="terminal-container">
                <div class="flex-1 overflow-y-auto mb-3 space-y-1 overflow-x-hidden" id="terminal-output">
                    <div class="text-green-400">Welcome to The White Hat Test - Responsible Disclosure CTF</div>
                    <div class="text-yellow-400">Your mission: Find 7 hidden flags and complete a responsible disclosure report</div>
                    <div class="text-gray-400">Type 'help' for available commands | Type 'cat mission_brief.txt' to read the full brief</div>
                    <div></div>
                </div>
                <div class="flex items-center" id="terminal-input-area">
                    <span class="text-green-400 mr-2" id="input-prompt">researcher@sandbox:~$ </span>
                    <input type="text" 
                           class="flex-1 bg-transparent border-none text-green-400 outline-none font-mono text-sm" 
                           placeholder="Type your command..." 
                           id="command-input"
                           autocomplete="off"
                           spellcheck="false">
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.commandProcessor = new CommandProcessor(this);
        this.bindEvents();
        this.focusInput();
        
        // Show initial prompt
        this.updatePrompt();
    }

    bindEvents() {
        const input = this.windowElement?.querySelector('#command-input');
        if (!input) return;

        input.addEventListener('keydown', async (e) => {
            switch (e.key) {
                case 'Enter':
                    await this.executeCommand(input.value);
                    input.value = '';
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    const prevCommand = this.commandProcessor.history.getPrevious();
                    if (prevCommand !== null) {
                        input.value = prevCommand;
                    }
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    const nextCommand = this.commandProcessor.history.getNext();
                    if (nextCommand !== null) {
                        input.value = nextCommand;
                    }
                    break;
                    
                case 'Tab':
                    e.preventDefault();
                    this.handleTabCompletion(input);
                    break;
            }
        });

        // Keep focus on input when clicking in terminal
        this.windowElement?.addEventListener('click', () => {
            this.focusInput();
        });
    }

    handleTabCompletion(input) {
        const inputText = input.value;
        const cursorPosition = input.selectionStart;
        
        const completion = this.commandProcessor.getTabCompletion(inputText, cursorPosition);
        
        if (completion) {
            input.value = completion.newText;
            input.setSelectionRange(completion.newCursorPosition, completion.newCursorPosition);
            
            // Show suggestions if there are multiple matches
            if (completion.suggestions && completion.suggestions.length > 1) {
                this.showTabSuggestions(completion.suggestions);
            }
        }
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
        
        const output = [];
        
        if (commands.length > 0) {
            output.push('Commands: ' + commands.join('  '));
        }
        
        if (flags.length > 0) {
            output.push('Options: ' + flags.join('  '));
        }
        
        if (directories.length > 0) {
            output.push('Directories: ' + directories.join('  '));
        }
        
        if (files.length > 0) {
            output.push('Files: ' + files.join('  '));
        }
        
        if (other.length > 0) {
            output.push('Available: ' + other.join('  '));
        }
        
        // If no categorization worked, just show all suggestions
        if (output.length === 0) {
            output.push(suggestions.join('  '));
        }
        
        output.forEach(line => this.addOutput(line, 'text-blue-400'));
    }

    async executeCommand(command) {
        if (!command.trim()) {
            this.addPromptLine();
            return;
        }

        // Emit terminal command event for system logs
        const result = await this.commandProcessor.executeCommand(command);
        const exitCode = result && result.success !== false ? 0 : 1;
        
        document.dispatchEvent(new CustomEvent('terminal-command', {
            detail: { 
                command: command.trim(), 
                user: 'researcher',
                exitCode: exitCode
            }
        }));

        // Check if it's a security-related command
        if (this.isSecurityCommand(command)) {
            document.dispatchEvent(new CustomEvent('security-command-executed', {
                detail: { 
                    command: command.trim(), 
                    result: result ? 'success' : 'failed',
                    risk: this.getCommandRisk(command)
                }
            }));
        }

        this.commandProcessor.history.reset();
        this.addPromptLine();
        this.scrollToBottom();
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

    addOutput(text, className = '') {
        const output = this.windowElement?.querySelector('#terminal-output');
        if (!output) return;

        // Check for flag patterns in the output
        this.checkForFlags(text);

        // Handle multi-line text by splitting on newlines
        const lines = text.split('\n');
        
        lines.forEach((lineText, index) => {
            const line = document.createElement('div');
            
            // Handle tabs by replacing with spaces (4 spaces per tab)
            const processedText = lineText.replace(/\t/g, '    ');
            line.textContent = processedText;
            
            // Allow text wrapping while preserving whitespace structure
            line.style.whiteSpace = 'pre-wrap';
            line.style.wordBreak = 'break-word';
            
            if (className) {
                switch (className) {
                    case 'error':
                        line.className = 'text-red-400';
                        break;
                    case 'command':
                        line.className = 'text-white';
                        break;
                    case 'directory':
                        line.className = 'text-blue-400';
                        break;
                    case 'suspicious-file':
                        line.className = 'text-red-400';
                        break;
                    case 'file':
                        line.className = 'text-green-400';
                        break;
                    default:
                        line.className = className;
                }
            }
            
            output.appendChild(line);
        });
        
        // Auto-scroll to bottom when new output is added
        this.scrollToBottom();
    }

    addPromptLine() {
        this.addOutput(''); // Empty line for spacing
        this.updatePrompt();
    }

    updatePrompt() {
        const promptElement = this.windowElement?.querySelector('#input-prompt');
        if (promptElement && this.commandProcessor) {
            promptElement.textContent = this.commandProcessor.getPrompt();
        }
    }

    clearOutput() {
        const output = this.windowElement?.querySelector('#terminal-output');
        if (output) {
            output.innerHTML = '';
            this.addOutput('Terminal cleared', 'text-gray-400');
        }
    }

    focusInput() {
        const input = this.windowElement?.querySelector('#command-input');
        if (input) {
            input.focus();
        }
    }

    scrollToBottom() {
        const output = this.windowElement?.querySelector('#terminal-output');
        if (output) {
            output.scrollTop = output.scrollHeight;
        }
    }

    // Check for CTF flags in terminal output and notify challenge tracker
    checkForFlags(text) {
        // Look for WHT{...} flag pattern
        const flagPattern = /WHT\{[^}]+\}/g;
        const matches = text.match(flagPattern);
        
        if (matches) {
            matches.forEach(flag => {
                console.log('[TerminalApp] Flag discovered in output:', flag);
                
                // Dispatch flag discovery event for challenge tracker
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
                    console.error('[TerminalApp] Error dispatching flag discovery event:', error);
                }
            });
        }
    }
}
