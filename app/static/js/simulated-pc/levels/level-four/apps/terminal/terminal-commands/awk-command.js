import { BaseCommand } from './base-command.js';

export class AwkCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'awk',
            description: 'Pattern scanning and data extraction language (simplified)',
            usage: 'awk \'program\' [file...]',
            options: [
                { flag: '-F fs', description: 'Use fs for the input field separator' },
                { flag: 'program', description: 'AWK program text' },
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
            this.addOutput('awk: missing program text', 'error');
            this.addOutput('Try \'awk --help\' for more information.', 'error');
            return;
        }

        let fieldSeparator = /\s+/; // Default whitespace separator
        let program = '';
        let filename = '';

        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-F' && i + 1 < args.length) {
                const fs = args[i + 1];
                fieldSeparator = new RegExp(fs === ' ' ? '\\s+' : fs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                i++; // Skip next arg
            } else if (!program) {
                program = args[i];
            } else if (!filename) {
                filename = args[i];
            }
        }

        if (!program) {
            this.addOutput('awk: missing program text', 'error');
            return;
        }

        if (!filename) {
            this.addOutput('awk: missing file operand', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const lines = content.split('\n').filter(line => line.length > 0 || !content.endsWith('\n'));
            const result = [];

            lines.forEach((line, lineNum) => {
                const fields = line.split(fieldSeparator).filter(f => f);
                const NF = fields.length;
                const NR = lineNum + 1;

                try {
                    const output = this.executeAwkProgram(program, line, fields, NF, NR);
                    if (output !== null) {
                        result.push(output);
                    }
                } catch (error) {
                    this.addOutput(`awk: ${error.message}`, 'error');
                    return;
                }
            });

            if (result.length > 0) {
                this.addOutput(result.join('\n'));
            }
        } else {
            this.addOutput(`awk: fatal: cannot open file '${filename}' for reading`, 'error');
        }
    }

    executeAwkProgram(program, line, fields, NF, NR) {
        // Simplified AWK interpreter for common CTF patterns
        
        // Handle simple print statements
        if (program.includes('print')) {
            // Pattern matching for common cases
            if (program === '{print}' || program === 'print') {
                return line;
            }
            
            // Field printing like {print $1}, {print $2}
            const fieldMatch = program.match(/\{\s*print\s+\$(\d+)\s*\}/);
            if (fieldMatch) {
                const fieldNum = parseInt(fieldMatch[1]);
                return fieldNum === 0 ? line : (fields[fieldNum - 1] || '');
            }
            
            // Multiple field printing like {print $1, $3}
            const multiFieldMatch = program.match(/\{\s*print\s+([^}]+)\s*\}/);
            if (multiFieldMatch) {
                const fieldExpr = multiFieldMatch[1];
                const parts = fieldExpr.split(',').map(p => p.trim());
                const output = [];
                
                parts.forEach(part => {
                    if (part.startsWith('$')) {
                        const fieldNum = parseInt(part.substring(1));
                        output.push(fieldNum === 0 ? line : (fields[fieldNum - 1] || ''));
                    } else if (part.startsWith('"') && part.endsWith('"')) {
                        output.push(part.substring(1, part.length - 1));
                    } else {
                        output.push(part);
                    }
                });
                
                return output.join(' ');
            }
        }
        
        // Handle simple pattern matching
        if (program.startsWith('/') && program.includes('/')) {
            const patternMatch = program.match(/^\/(.+?)\//);
            if (patternMatch) {
                const pattern = patternMatch[1];
                const regex = new RegExp(pattern, 'i');
                if (regex.test(line)) {
                    const action = program.substring(program.indexOf('/') + pattern.length + 1).trim();
                    if (action === '' || action === '{print}') {
                        return line;
                    }
                }
                return null; // No match
            }
        }
        
        // Handle NR (line number) conditions
        if (program.includes('NR')) {
            const nrMatch = program.match(/NR\s*([<>=!]+)\s*(\d+)/);
            if (nrMatch) {
                const operator = nrMatch[1];
                const value = parseInt(nrMatch[2]);
                let condition = false;
                
                switch (operator) {
                    case '==': condition = NR === value; break;
                    case '!=': condition = NR !== value; break;
                    case '<': condition = NR < value; break;
                    case '>': condition = NR > value; break;
                    case '<=': condition = NR <= value; break;
                    case '>=': condition = NR >= value; break;
                }
                
                if (condition) {
                    return line;
                }
                return null;
            }
        }
        
        // Default: return the line if no specific pattern matched
        return line;
    }
}