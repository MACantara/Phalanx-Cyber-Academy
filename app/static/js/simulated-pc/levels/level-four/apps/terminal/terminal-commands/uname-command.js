import { BaseCommand } from './base-command.js';

export class UnameCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'uname',
            description: 'Print system information',
            usage: 'uname [OPTION]...',
            options: [
                { flag: '-a, --all', description: 'Print all information' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('-a')) {
            this.addOutput('Linux cyberquest 5.4.0-training #1 SMP x86_64 GNU/Linux');
        } else if (args.includes('--help')) {
            this.showHelp();
            return;
        } else {
            this.addOutput('Linux');
        }
    }
}
