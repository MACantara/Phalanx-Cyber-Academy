import { BaseCommand } from './base-command.js';

export class WcCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'wc',
            description: 'Print newline, word, and byte counts for files',
            usage: 'wc [OPTION]... [FILE]...',
            options: [
                { flag: '-c', description: 'Print the byte counts' },
                { flag: '-l', description: 'Print the newline counts' },
                { flag: '-w', description: 'Print the word counts' },
                { flag: '-m', description: 'Print the character counts' },
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
            this.addOutput('wc: missing file operand', 'error');
            this.addOutput('Try \'wc --help\' for more information.', 'error');
            return;
        }

        const showLines = args.includes('-l') || (!args.some(arg => arg.startsWith('-') && arg !== '--help'));
        const showWords = args.includes('-w') || (!args.some(arg => arg.startsWith('-') && arg !== '--help'));
        const showBytes = args.includes('-c') || (!args.some(arg => arg.startsWith('-') && arg !== '--help'));
        const showChars = args.includes('-m');

        // Get filename (last non-option argument)
        const filename = args.filter(arg => !arg.startsWith('-')).pop();
        
        if (!filename) {
            this.addOutput('wc: missing file operand', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const lines = content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
            const words = content.split(/\s+/).filter(word => word.length > 0).length;
            const bytes = new Blob([content]).size;
            const chars = content.length;

            let output = [];
            
            if (showLines && !args.includes('-c') && !args.includes('-w') && !args.includes('-m')) {
                output.push(lines.toString().padStart(7));
            } else if (showLines) {
                output.push(lines.toString().padStart(7));
            }
            
            if (showWords && !args.includes('-c') && !args.includes('-l') && !args.includes('-m')) {
                output.push(words.toString().padStart(7));
            } else if (showWords) {
                output.push(words.toString().padStart(7));
            }
            
            if (showBytes && !showChars) {
                output.push(bytes.toString().padStart(7));
            }
            
            if (showChars) {
                output.push(chars.toString().padStart(7));
            }
            
            // If no specific options, show all three (lines, words, bytes)
            if (!args.some(arg => ['-c', '-l', '-w', '-m'].includes(arg))) {
                output = [
                    lines.toString().padStart(7),
                    words.toString().padStart(7),
                    bytes.toString().padStart(7)
                ];
            }
            
            this.addOutput(`${output.join(' ')} ${filename}`);
        } else {
            this.addOutput(`wc: ${filename}: No such file or directory`, 'error');
        }
    }
}