import { BaseCommand } from './base-command.js';

export class DateCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'date',
            description: 'Display or set the system date',
            usage: 'date [OPTION]... [+FORMAT]',
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

        const now = new Date();
        this.addOutput(now.toString());
    }
}
