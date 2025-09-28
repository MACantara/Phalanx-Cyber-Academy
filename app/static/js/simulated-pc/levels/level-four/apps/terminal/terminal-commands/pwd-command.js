import { BaseCommand } from './base-command.js';

export class PwdCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'pwd',
            description: 'Print the current working directory',
            usage: 'pwd [OPTION]...',
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

        this.addOutput(this.getCurrentDirectory());
    }
}
