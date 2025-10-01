import { BaseCommand } from './base-command.js';

export class LsCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'ls',
            description: 'List directory contents',
            usage: 'ls [OPTION]... [FILE]...',
            options: [
                { flag: '-a, --all', description: 'Show hidden files and directories' },
                { flag: '-l', description: 'Use long listing format with detailed information' },
                { flag: '-la', description: 'Combine -l and -a options' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    async execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
        
        // Check if a specific directory is provided
        const nonFlagArgs = args.filter(arg => !arg.startsWith('-'));
        const targetDir = nonFlagArgs.length > 0 ? nonFlagArgs[0] : '.';
        
        const items = await this.listDirectory(targetDir, showAll);
        
        if (longFormat) {
            items.forEach(item => {
                const date = new Date().toISOString().split('T')[0].replace(/-/g, ' ');
                const time = new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5);
                const permissions = item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
                const size = item.size || 4096;
                const className = item.suspicious ? 'suspicious-file' : (item.type === 'directory' ? 'directory' : 'file');
                
                this.addOutput(`${permissions} 2 ${this.getUsername()} ${this.getUsername()} ${size.toString().padStart(8)} ${date} ${time} ${item.name}`, className);
            });
        } else {
            const names = items.map(item => item.name).join('  ');
            this.addOutput(names);
        }
    }
}
