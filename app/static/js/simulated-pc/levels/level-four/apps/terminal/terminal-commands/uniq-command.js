import { BaseCommand } from './base-command.js';

export class UniqCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'uniq',
            description: 'Report or omit repeated lines',
            usage: 'uniq [OPTION]... [INPUT [OUTPUT]]',
            options: [
                { flag: '-c', description: 'Prefix lines by the number of occurrences' },
                { flag: '-d', description: 'Only print duplicate lines' },
                { flag: '-u', description: 'Only print unique lines' },
                { flag: '-i', description: 'Ignore differences in case when comparing' },
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
            this.addOutput('uniq: missing file operand', 'error');
            this.addOutput('Try \'uniq --help\' for more information.', 'error');
            return;
        }

        const count = args.includes('-c');
        const duplicatesOnly = args.includes('-d');
        const uniqueOnly = args.includes('-u');
        const ignoreCase = args.includes('-i');

        // Get filename (last non-option argument)
        const filename = args.filter(arg => !arg.startsWith('-')).pop();
        
        if (!filename) {
            this.addOutput('uniq: missing file operand', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const lines = content.split('\n').filter(line => line.length > 0 || !content.endsWith('\n'));
            const lineMap = new Map();
            const result = [];
            
            // Count occurrences and track order
            lines.forEach(line => {
                const key = ignoreCase ? line.toLowerCase() : line;
                if (!lineMap.has(key)) {
                    lineMap.set(key, { original: line, count: 0, firstIndex: lineMap.size });
                }
                lineMap.get(key).count++;
            });
            
            // Convert to array and sort by first appearance
            const sortedEntries = Array.from(lineMap.values()).sort((a, b) => a.firstIndex - b.firstIndex);
            
            sortedEntries.forEach(({ original, count }) => {
                // Apply filters
                if (duplicatesOnly && count === 1) return;
                if (uniqueOnly && count > 1) return;
                
                // Format output
                if (count > 0) {
                    const output = count ? `${count.toString().padStart(7)} ${original}` : original;
                    result.push(output);
                }
            });
            
            if (result.length > 0) {
                this.addOutput(result.join('\n'));
            }
        } else {
            this.addOutput(`uniq: ${filename}: No such file or directory`, 'error');
        }
    }
}