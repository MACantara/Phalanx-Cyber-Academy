import { BaseCommand } from './base-command.js';

export class FileCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'file',
            description: 'Determine file type',
            usage: 'file [OPTION]... [FILE]...',
            options: [
                { flag: 'FILE', description: 'File to examine' },
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
            this.addOutput('file: missing file operand', 'error');
            return;
        }

        const filename = args[0];
        const exists = await this.fileExists(filename);
        
        if (exists) {
            const content = await this.readFile(filename);
            
            // Determine file type based on content and extension
            if (filename.endsWith('.txt') || filename.endsWith('.log')) {
                this.addOutput(`${filename}: ASCII text`);
            } else if (filename.endsWith('.sh')) {
                this.addOutput(`${filename}: Bourne-Again shell script, ASCII text executable`);
            } else if (filename.endsWith('.conf') || filename.endsWith('.config')) {
                this.addOutput(`${filename}: ASCII text, configuration file`);
            } else if (filename.endsWith('.key')) {
                this.addOutput(`${filename}: PEM RSA private key`);
            } else if (filename.endsWith('.php')) {
                this.addOutput(`${filename}: PHP script, ASCII text`);
            } else if (filename.endsWith('.html')) {
                this.addOutput(`${filename}: HTML document, ASCII text`);
            } else if (filename.endsWith('.exe')) {
                this.addOutput(`${filename}: PE32 executable (console) Intel 80386, for MS Windows`);
                // Malware detection educational content
                if (filename.includes('suspicious')) {
                    this.addOutput('WARNING: This file may contain malicious code. Analyze in isolated environment.', 'text-red-400');
                }
            } else if (content && content.startsWith('#!/')) {
                this.addOutput(`${filename}: shell script, ASCII text executable`);
            } else {
                this.addOutput(`${filename}: ASCII text`);
            }
        } else {
            this.addOutput(`file: cannot open '${filename}' (No such file or directory)`, 'error');
        }
    }
}