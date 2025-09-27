import { BaseCommand } from './base-command.js';

export class ClearCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'clear',
            description: 'Clear the terminal screen',
            usage: 'clear [OPTION]...',
            options: [
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        this.terminalApp.clearOutput();
    }
}
