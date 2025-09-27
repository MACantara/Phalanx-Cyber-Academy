import { FileSystem } from './file-system.js';
import { CommandHistory } from './command-history.js';
import { CommandRegistry } from './command-registry.js';
import { TabCompletion } from './tab-completion.js';

export class CommandProcessor {
    constructor(terminalApp) {
        this.terminalApp = terminalApp;
        this.fileSystem = new FileSystem();
        this.history = new CommandHistory();
        this.currentDirectory = '/home/trainee';
        this.username = 'trainee';
        this.hostname = 'cyberquest';
        
        // Initialize command registry and tab completion
        this.commandRegistry = new CommandRegistry(this);
        this.tabCompletion = new TabCompletion(this);
    }

    executeCommand(commandLine) {
        if (!commandLine.trim()) return;

        this.history.addCommand(commandLine);
        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Add command to output
        this.addOutput(`${this.getPrompt()}${commandLine}`, 'command');

        try {
            const commandInstance = this.commandRegistry.getCommand(command);
            if (commandInstance) {
                commandInstance.execute(args);
            } else {
                this.addOutput(`bash: ${command}: command not found`, 'error');
            }
        } catch (error) {
            this.addOutput(`Error: ${error.message}`, 'error');
        }
    }

    getTabCompletion(inputText, cursorPosition) {
        return this.tabCompletion.getCompletion(inputText, cursorPosition);
    }

    addOutput(text, className = '') {
        this.terminalApp.addOutput(text, className);
    }

    getPrompt() {
        const shortPath = this.currentDirectory.replace('/home/trainee', '~');
        return `${this.username}@${this.hostname}:${shortPath}$ `;
    }

    getCurrentDirectory() {
        return this.currentDirectory;
    }
}