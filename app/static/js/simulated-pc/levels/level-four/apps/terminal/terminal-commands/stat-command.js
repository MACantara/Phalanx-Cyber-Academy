import { BaseCommand } from './base-command.js';

export class StatCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'stat',
            description: 'Display detailed file information',
            usage: 'stat [OPTION]... [FILE]...',
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
            this.addOutput('stat: missing file operand', 'error');
            return;
        }

        const filename = args[0];
        const exists = await this.fileSystem.fileExists(this.getCurrentDirectory(), filename);
        
        if (exists) {
            const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
            const size = new Blob([content || '']).size;
            
            this.addOutput(`  File: ${filename}`);
            this.addOutput(`  Size: ${size}            Blocks: 8          IO Block: 4096   regular file`);
            this.addOutput(`Device: 801h/2049d      Inode: 123456      Links: 1`);
            
            // Show permissions with security implications
            if (filename.includes('backup') || filename.endsWith('.sh')) {
                this.addOutput(`Access: (4755/-rwsr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)`);
                this.addOutput(`# WARNING: SUID bit set - potential privilege escalation`, 'text-red-400');
            } else if (filename.endsWith('.key')) {
                this.addOutput(`Access: (0600/-rw-------)  Uid: (    0/    root)   Gid: (    0/    root)`);
                this.addOutput(`# SECURE: Private key with restricted permissions`, 'text-green-400');
            } else {
                this.addOutput(`Access: (0644/-rw-r--r--)  Uid: ( 1000/researcher)   Gid: ( 1000/researcher)`);
            }
            
            const date = new Date().toISOString().split('T')[0];
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            this.addOutput(`Access: ${date} ${time} +0000`);
            this.addOutput(`Modify: ${date} ${time} +0000`);
            this.addOutput(`Change: ${date} ${time} +0000`);
            this.addOutput(` Birth: -`);
        } else {
            this.addOutput(`stat: cannot stat '${filename}': No such file or directory`, 'error');
        }
    }
}