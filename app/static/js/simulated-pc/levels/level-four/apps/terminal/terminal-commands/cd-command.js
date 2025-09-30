import { BaseCommand } from './base-command.js';

export class CdCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'cd',
            description: 'Change the current working directory',
            usage: 'cd [DIRECTORY]',
            options: [
                { flag: 'DIRECTORY', description: 'Directory to change to (default: home directory)' },
                { flag: '.', description: 'Current directory' },
                { flag: '..', description: 'Parent directory' },
                { flag: '~', description: 'Home directory' },
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
            this.setCurrentDirectory('/home/researcher');
            return;
        }

        const target = args[0];
        const newPath = this.resolvePath(target);
        
        if (await this.directoryExists(target)) {
            this.setCurrentDirectory(newPath);
        } else {
            this.addOutput(`bash: cd: ${target}: No such file or directory`, 'error');
        }
    }
}
