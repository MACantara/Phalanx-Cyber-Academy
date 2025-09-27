import { BaseCommand } from './base-command.js';

export class HistoryCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'history',
            description: 'Display command history',
            usage: 'history [OPTION]...',
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

        const commands = this.processor.history.getHistory();
        commands.forEach((cmd, index) => {
            this.addOutput(`${(index + 1).toString().padStart(4)} ${cmd}`);
        });
    }
}
