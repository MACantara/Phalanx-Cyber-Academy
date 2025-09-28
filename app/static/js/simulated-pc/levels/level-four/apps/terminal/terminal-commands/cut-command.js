import { BaseCommand } from './base-command.js';

export class CutCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'cut',
            description: 'Extract sections from each line of files',
            usage: 'cut [OPTION]... [FILE]...',
            options: [
                { flag: '-c LIST', description: 'Select only these characters' },
                { flag: '-f LIST', description: 'Select only these fields' },
                { flag: '-d DELIM', description: 'Use DELIM instead of TAB for field delimiter' },
                { flag: '-s', description: 'Do not print lines not containing delimiters' },
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
            this.addOutput('cut: missing file operand', 'error');
            this.addOutput('Try \'cut --help\' for more information.', 'error');
            return;
        }

        let characters = null;
        let fields = null;
        let delimiter = '\t';
        let suppressNoDelim = args.includes('-s');

        // Parse options
        for (let i = 0; i < args.length - 1; i++) {
            if (args[i] === '-c' && i + 1 < args.length) {
                characters = args[i + 1];
            } else if (args[i] === '-f' && i + 1 < args.length) {
                fields = args[i + 1];
            } else if (args[i] === '-d' && i + 1 < args.length) {
                delimiter = args[i + 1];
            }
        }

        // Get filename (last non-option argument that's not a parameter)
        const filename = args[args.length - 1];
        if (filename.startsWith('-') || [characters, fields, delimiter].includes(filename)) {
            this.addOutput('cut: missing file operand', 'error');
            return;
        }

        if (!characters && !fields) {
            this.addOutput('cut: you must specify a list of bytes, characters, or fields', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const lines = content.split('\n');
            const result = [];

            lines.forEach(line => {
                if (line.length === 0) {
                    if (!suppressNoDelim) result.push('');
                    return;
                }

                let output = '';

                if (characters) {
                    // Character-based cutting
                    const ranges = this.parseRanges(characters, line.length);
                    ranges.forEach(range => {
                        for (let i = range.start; i <= range.end && i < line.length; i++) {
                            output += line[i];
                        }
                    });
                } else if (fields) {
                    // Field-based cutting
                    const fieldArray = line.split(delimiter);
                    if (suppressNoDelim && !line.includes(delimiter)) {
                        return; // Skip lines without delimiter
                    }
                    
                    const ranges = this.parseRanges(fields, fieldArray.length);
                    const selectedFields = [];
                    
                    ranges.forEach(range => {
                        for (let i = range.start; i <= range.end && i < fieldArray.length; i++) {
                            selectedFields.push(fieldArray[i]);
                        }
                    });
                    
                    output = selectedFields.join(delimiter);
                }

                if (output || !suppressNoDelim) {
                    result.push(output);
                }
            });

            if (result.length > 0) {
                this.addOutput(result.join('\n'));
            }
        } else {
            this.addOutput(`cut: ${filename}: No such file or directory`, 'error');
        }
    }

    parseRanges(rangeStr, maxLength) {
        const ranges = [];
        const parts = rangeStr.split(',');

        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-');
                const startNum = start ? parseInt(start) - 1 : 0;
                const endNum = end ? parseInt(end) - 1 : maxLength - 1;
                ranges.push({
                    start: Math.max(0, startNum),
                    end: Math.min(maxLength - 1, endNum)
                });
            } else {
                const num = parseInt(part) - 1;
                if (num >= 0 && num < maxLength) {
                    ranges.push({ start: num, end: num });
                }
            }
        });

        return ranges.sort((a, b) => a.start - b.start);
    }
}