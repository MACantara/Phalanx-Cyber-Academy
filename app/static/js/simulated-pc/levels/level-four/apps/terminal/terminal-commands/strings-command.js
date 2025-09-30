import { BaseCommand } from './base-command.js';

export class StringsCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'strings',
            description: 'Extract printable strings from binary files',
            usage: 'strings [OPTION]... [FILE]...',
            options: [
                { flag: 'FILE', description: 'File to analyze' },
                { flag: '-n NUM', description: 'Minimum string length (default: 4)' },
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
            this.addOutput('strings: missing file operand', 'error');
            return;
        }

        let minLength = 4;
        let filename = args[args.length - 1];

        // Parse -n option
        for (let i = 0; i < args.length - 1; i++) {
            if (args[i] === '-n' && i + 1 < args.length - 1) {
                const num = parseInt(args[i + 1]);
                if (!isNaN(num) && num > 0) {
                    minLength = num;
                }
            }
        }

        const content = await this.readFile(filename);
        
        if (content !== null) {
            // Extract strings from file content
            const strings = this.extractStrings(content, minLength);
            
            // Add some predefined strings for CTF purposes
            if (filename.includes('backup') || filename.endsWith('.sh')) {
                strings.push('WHT{suid_binary_analysis}');
                strings.push('/var/backups/daily');
                strings.push('pg_dump techcorp');
                strings.push('admin_secret_2024');
            }
            
            if (filename.includes('suspicious') || filename.endsWith('.exe')) {
                strings.push('Malware Analysis Exercise');
                strings.push('WHT{malware_detection_exercise}');
                strings.push('Encryption routines');
                strings.push('Network callbacks');
                strings.push('Persistence mechanisms');
                strings.push('This is educational malware sample');
            }

            strings.forEach(str => this.addOutput(str));
        } else {
            this.addOutput(`strings: '${filename}': No such file`, 'error');
        }
    }

    extractStrings(content, minLength) {
        const strings = [];
        const lines = content.split('\n');
        
        lines.forEach(line => {
            // Extract printable ASCII strings
            const matches = line.match(/[a-zA-Z0-9_\-\.\/\{\}:@#]+/g);
            if (matches) {
                matches.forEach(match => {
                    if (match.length >= minLength) {
                        strings.push(match);
                    }
                });
            }
        });

        return [...new Set(strings)]; // Remove duplicates
    }
}