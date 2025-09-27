import { BaseCommand } from './base-command.js';

export class WhoamiCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'whoami',
            description: 'Display the current username',
            usage: 'whoami [OPTION]...',
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

        this.addOutput(this.getUsername());
    }
}
