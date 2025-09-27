import { BaseCommand } from './base-command.js';

export class SortCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'sort',
            description: 'Sort lines in text files',
            usage: 'sort [OPTION]... [FILE]...',
            options: [
                { flag: '-r', description: 'Reverse the result of comparisons' },
                { flag: '-n', description: 'Compare according to string numerical value' },
                { flag: '-u', description: 'Output only the first of an equal run' },
                { flag: '-k FIELD', description: 'Sort by field number' },
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
            this.addOutput('sort: missing file operand', 'error');
            this.addOutput('Try \'sort --help\' for more information.', 'error');
            return;
        }

        const reverse = args.includes('-r');
        const numeric = args.includes('-n');
        const unique = args.includes('-u');
        
        // Parse -k option for field sorting
        let fieldNumber = null;
        for (let i = 0; i < args.length - 1; i++) {
            if (args[i] === '-k' && i + 1 < args.length) {
                const field = parseInt(args[i + 1]);
                if (!isNaN(field) && field > 0) {
                    fieldNumber = field;
                }
            }
        }

        // Get filename (last non-option argument)
        const filename = args.filter(arg => !arg.startsWith('-') && args[args.indexOf(arg) - 1] !== '-k').pop();
        
        if (!filename) {
            this.addOutput('sort: missing file operand', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            let lines = content.split('\n').filter(line => line.length > 0 || !content.endsWith('\n'));
            
            // Sort logic
            lines.sort((a, b) => {
                let valA = a;
                let valB = b;
                
                // Field-based sorting
                if (fieldNumber) {
                    const fieldsA = a.split(/\s+/);
                    const fieldsB = b.split(/\s+/);
                    valA = fieldsA[fieldNumber - 1] || '';
                    valB = fieldsB[fieldNumber - 1] || '';
                }
                
                // Numeric sorting
                if (numeric) {
                    const numA = parseFloat(valA) || 0;
                    const numB = parseFloat(valB) || 0;
                    return reverse ? numB - numA : numA - numB;
                }
                
                // String sorting
                if (reverse) {
                    return valB.localeCompare(valA);
                } else {
                    return valA.localeCompare(valB);
                }
            });
            
            // Remove duplicates if unique flag is set
            if (unique) {
                lines = [...new Set(lines)];
            }
            
            this.addOutput(lines.join('\n'));
        } else {
            this.addOutput(`sort: cannot read: ${filename}: No such file or directory`, 'error');
        }
    }
}