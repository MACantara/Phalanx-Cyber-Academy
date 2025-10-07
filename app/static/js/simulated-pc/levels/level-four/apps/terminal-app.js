import { WindowBase } from '/static/js/simulated-pc/desktop-components/window-base.js';
import { CommandProcessor } from './terminal/terminal-functions/command-processor.js';
import { XtermAdapter } from './terminal/xterm-adapter.js';

export class TerminalApp extends WindowBase {
    constructor() {
        super('terminal', 'Terminal', {
            width: '70%',
            height: '60%'
        });
        
        this.commandProcessor = null;
        this.xtermAdapter = null;
    }

    createContent() {
        return `
            <div class="h-full bg-black p-2 sm:p-3 flex flex-col" id="terminal-container">
                <div class="flex-1" id="xterm-container"></div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        // Initialize command processor
        this.commandProcessor = new CommandProcessor(this);
        
        // Initialize xterm adapter
        const xtermContainer = this.windowElement?.querySelector('#xterm-container');
        if (xtermContainer) {
            this.xtermAdapter = new XtermAdapter(xtermContainer, this.commandProcessor, this);
        }
    }

    // Kept for backward compatibility - these are now handled by xterm adapter
    bindEvents() {
        // No longer needed - xterm handles input
    }

    handleTabCompletion(input) {
        // Handled by xterm adapter
    }

    showTabSuggestions(suggestions) {
        // Handled by xterm adapter
    }

    async executeCommand(command) {
        // Handled by xterm adapter
    }

    isSecurityCommand(command) {
        // Handled by xterm adapter
    }

    getCommandRisk(command) {
        // Handled by xterm adapter
    }

    addOutput(text, className = '') {
        if (this.xtermAdapter) {
            this.xtermAdapter.writeLine(text, className);
        }
    }

    addPromptLine() {
        // No longer needed - xterm handles prompts
    }

    updatePrompt() {
        // No longer needed - xterm handles prompts
    }

    clearOutput() {
        if (this.xtermAdapter) {
            this.xtermAdapter.clear();
        }
    }

    focusInput() {
        // Xterm handles focus automatically
        if (this.xtermAdapter?.term) {
            this.xtermAdapter.term.focus();
        }
    }

    scrollToBottom() {
        // Xterm handles scrolling automatically
    }

    // Check for CTF flags in terminal output - kept for compatibility
    checkForFlags(text) {
        // Handled by xterm adapter
    }


}
