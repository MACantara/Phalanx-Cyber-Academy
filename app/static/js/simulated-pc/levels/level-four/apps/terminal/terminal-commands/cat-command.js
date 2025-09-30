import { BaseCommand } from './base-command.js';

export class CatCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'cat',
            description: 'Display file contents',
            usage: 'cat [OPTION]... [FILE]...',
            options: [
                { flag: 'FILE', description: 'File(s) to display' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    async execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        if (args.length === 0) {
            this.addOutput('cat: missing file operand', 'error');
            return;
        }

        const filename = args[0];
        const content = await this.readFile(filename);
        
        if (content !== null) {
            this.addOutput(content);
        } else {
            this.addOutput(`cat: ${filename}: No such file or directory`, 'error');
        }
    }
}
