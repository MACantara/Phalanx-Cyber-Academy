import { BaseCommand } from './base-command.js';

export class TailCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'tail',
            description: 'Display the last lines of a file',
            usage: 'tail [OPTION]... [FILE]...',
            options: [
                { flag: '-n NUM', description: 'Print the last NUM lines instead of the last 10' },
                { flag: '-c NUM', description: 'Print the last NUM bytes' },
                { flag: '-f', description: 'Follow mode (simulated for CTF)' },
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
            this.addOutput('tail: missing file operand', 'error');
            this.addOutput('Try \'tail --help\' for more information.', 'error');
            return;
        }

        let lineCount = 10;
        let filename = args[args.length - 1];
        let followMode = args.includes('-f');
        
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
            const tailLines = lines.slice(-lineCount);
            this.addOutput(tailLines.join('\n'));
            
            if (followMode) {
                this.addOutput('==> Following file (simulated - press Ctrl+C to stop) <==', 'text-blue-400');
                this.addOutput('tail: following file would continue in real environment', 'text-gray-400');
            }
        } else {
            this.addOutput(`tail: cannot open '${filename}' for reading: No such file or directory`, 'error');
        }
    }
}