import { BaseCommand } from './base-command.js';

export class EchoCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'echo',
            description: 'Display a line of text',
            usage: 'echo [SHORT-OPTION]... [STRING]...',
            options: [
                { flag: 'STRING', description: 'Text to display' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        this.addOutput(args.join(' '));
    }
}
