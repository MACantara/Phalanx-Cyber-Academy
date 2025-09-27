import { BaseCommand } from './base-command.js';

export class SedCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'sed',
            description: 'Stream editor for filtering and transforming text (simplified)',
            usage: 'sed [options] script [file...]',
            options: [
                { flag: '-n', description: 'Suppress automatic printing of pattern space' },
                { flag: '-e script', description: 'Add the script to the commands to be executed' },
                { flag: 's/regexp/replacement/flags', description: 'Substitute command' },
                { flag: 'p', description: 'Print command' },
                { flag: 'd', description: 'Delete command' },
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
            this.addOutput('sed: missing command', 'error');
            this.addOutput('Try \'sed --help\' for more information.', 'error');
            return;
        }

        let quiet = false;
        let script = '';
        let filename = '';

        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n') {
                quiet = true;
            } else if (args[i] === '-e' && i + 1 < args.length) {
                script = args[i + 1];
                i++; // Skip next arg
            } else if (!script) {
                script = args[i];
            } else if (!filename) {
                filename = args[i];
            }
        }

        if (!script) {
            this.addOutput('sed: missing command', 'error');
            return;
        }

        if (!filename) {
            this.addOutput('sed: missing file operand', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const lines = content.split('\n');
            const result = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const processedLine = this.processLine(line, script, i + 1);
                
                if (processedLine !== null) {
                    if (!quiet || script.includes('p')) {
                        result.push(processedLine);
                    }
                }
            }

            if (result.length > 0) {
                this.addOutput(result.join('\n'));
            }
        } else {
            this.addOutput(`sed: can't read ${filename}: No such file or directory`, 'error');
        }
    }

    processLine(line, script, lineNumber) {
        // Handle substitute command s/pattern/replacement/flags
        const substituteMatch = script.match(/s\/(.+?)\/(.+?)\/([gi]*)/);
        if (substituteMatch) {
            const pattern = substituteMatch[1];
            const replacement = substituteMatch[2];
            const flags = substituteMatch[3] || '';
            
            try {
                const regex = new RegExp(pattern, flags);
                return line.replace(regex, replacement);
            } catch (error) {
                this.addOutput(`sed: invalid regular expression: ${error.message}`, 'error');
                return null;
            }
        }

        // Handle delete command
        if (script === 'd') {
            return null; // Delete line
        }

        // Handle print command
        if (script === 'p') {
            return line;
        }

        // Handle line number commands like '2d' or '3p'
        const lineCommandMatch = script.match(/^(\d+)([pd])$/);
        if (lineCommandMatch) {
            const targetLine = parseInt(lineCommandMatch[1]);
            const command = lineCommandMatch[2];
            
            if (lineNumber === targetLine) {
                if (command === 'd') {
                    return null; // Delete this line
                } else if (command === 'p') {
                    return line; // Print this line
                }
            }
        }

        // Handle range commands like '1,3d' or '2,4p'
        const rangeCommandMatch = script.match(/^(\d+),(\d+)([pd])$/);
        if (rangeCommandMatch) {
            const startLine = parseInt(rangeCommandMatch[1]);
            const endLine = parseInt(rangeCommandMatch[2]);
            const command = rangeCommandMatch[3];
            
            if (lineNumber >= startLine && lineNumber <= endLine) {
                if (command === 'd') {
                    return null; // Delete this line
                } else if (command === 'p') {
                    return line; // Print this line
                }
            }
        }

        // Handle pattern-based commands
        const patternCommandMatch = script.match(/^\/(.+?)\/([pd])$/);
        if (patternCommandMatch) {
            const pattern = patternCommandMatch[1];
            const command = patternCommandMatch[2];
            
            try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(line)) {
                    if (command === 'd') {
                        return null; // Delete matching line
                    } else if (command === 'p') {
                        return line; // Print matching line
                    }
                }
            } catch (error) {
                this.addOutput(`sed: invalid regular expression: ${error.message}`, 'error');
                return null;
            }
        }

        // Default: return the line unchanged
        return line;
    }
}