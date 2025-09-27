import { BaseCommand } from './base-command.js';

export class HeadCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'head',
            description: 'Display the first lines of a file',
            usage: 'head [OPTION]... [FILE]...',
            options: [
                { flag: '-n NUM', description: 'Print the first NUM lines instead of the first 10' },
                { flag: '-c NUM', description: 'Print the first NUM bytes' },
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
            this.addOutput('head: missing file operand', 'error');
            this.addOutput('Try \'head --help\' for more information.', 'error');
            return;
        }

        let lineCount = 10;
        let filename = args[args.length - 1];
        
        // Parse -n option
        for (let i = 0; i < args.length - 1; i++) {
            if (args[i] === '-n' && i + 1 < args.length - 1) {
                const num = parseInt(args[i + 1]);
                if (!isNaN(num) && num > 0) {
                    lineCount = num;
                }
            }
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const lines = content.split('\n');
            const headLines = lines.slice(0, lineCount);
            this.addOutput(headLines.join('\n'));
        } else {
            this.addOutput(`head: cannot open '${filename}' for reading: No such file or directory`, 'error');
        }
    }
}