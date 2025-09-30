import { BaseCommand } from './base-command.js';

export class Base64Command extends BaseCommand {
    getHelp() {
        return {
            name: 'base64',
            description: 'Encode/decode base64 data',
            usage: 'base64 [OPTION]... [FILE]',
            options: [
                { flag: '-d, --decode', description: 'Decode base64 input' },
                { flag: 'FILE', description: 'File to encode/decode' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    async execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        const decode = args.includes('-d') || args.includes('--decode');
        
        if (args.length === 0 || (args.length === 1 && decode)) {
            this.addOutput('base64: missing file operand', 'error');
            return;
        }

        const filename = args[args.length - 1];
        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            try {
                if (decode) {
                    // Decode base64 content
                    const decoded = atob(content.trim());
                    this.addOutput(decoded);
                    
                    // Check if decoded content contains flags
                    if (decoded.includes('WHT{')) {
                        this.addOutput('# Base64 decoded content may contain flags!', 'text-green-400');
                    }
                } else {
                    // Encode to base64
                    const encoded = btoa(content);
                    this.addOutput(encoded);
                }
            } catch (error) {
                this.addOutput('base64: invalid input', 'error');
            }
        } else {
            this.addOutput(`base64: ${filename}: No such file or directory`, 'error');
        }
    }
}