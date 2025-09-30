import { BaseCommand } from './base-command.js';

export class ChmodCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'chmod',
            description: 'Change file permissions (simulated for CTF)',
            usage: 'chmod [OPTION]... MODE FILE...',
            options: [
                { flag: 'MODE', description: 'Permission mode (e.g., 755, u+x)' },
                { flag: 'FILE', description: 'File to change permissions' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        if (args.length < 2) {
            this.addOutput('chmod: missing operand', 'error');
            this.addOutput('Try \'chmod --help\' for more information.', 'error');
            return;
        }

        const mode = args[0];
        const filename = args[1];

        // Simulate chmod operation
        this.addOutput(`chmod: changing permissions of '${filename}' to '${mode}' (simulated)`, 'text-yellow-400');
        
        // Educational content about file permissions
        if (mode.includes('4') || mode.startsWith('4')) {
            this.addOutput('# WARNING: SUID bit set - review security implications', 'text-red-400');
        }
        if (mode === '777') {
            this.addOutput('# SECURITY RISK: 777 permissions allow all access', 'text-red-400');
        }
        if (mode === '600' || mode === '400') {
            this.addOutput('# SECURE: Restricted permissions for sensitive files', 'text-green-400');
        }
    }
}