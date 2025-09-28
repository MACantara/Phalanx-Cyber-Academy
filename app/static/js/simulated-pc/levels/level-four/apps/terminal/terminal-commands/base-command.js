export class BaseCommand {
    constructor(processor) {
        this.processor = processor;
        this.fileSystem = processor.fileSystem;
        this.terminalApp = processor.terminalApp;
    }

    execute(args) {
        throw new Error('Command must implement execute method');
    }

    getHelp() {
        return {
            name: this.constructor.name.replace('Command', '').toLowerCase(),
            description: 'No description available',
            usage: 'command',
            options: []
        };
    }

    showHelp() {
        const help = this.getHelp();
        this.addOutput(`Usage: ${help.usage}`);
        this.addOutput(`Description: ${help.description}`);
        if (help.options.length > 0) {
            this.addOutput('Options:');
            help.options.forEach(option => {
                this.addOutput(`  ${option.flag.padEnd(12)} ${option.description}`);
            });
        }
    }

    addOutput(text, className = '') {
        this.processor.addOutput(text, className);
    }

    getCurrentDirectory() {
        return this.processor.currentDirectory;
    }

    setCurrentDirectory(path) {
        this.processor.currentDirectory = path;
    }

    getUsername() {
        return this.processor.username;
    }

    getHostname() {
        return this.processor.hostname;
    }
}
