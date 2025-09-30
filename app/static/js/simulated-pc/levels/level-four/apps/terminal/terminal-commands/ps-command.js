import { BaseCommand } from './base-command.js';

export class PsCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'ps',
            description: 'Display running processes',
            usage: 'ps [OPTION]...',
            options: [
                { flag: 'aux', description: 'Show all processes with detailed information' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        const showAll = args.includes('aux') || args.includes('a');
        
        this.addOutput('  PID TTY          TIME CMD');
        
        if (showAll) {
            // Show detailed process list for CTF environment
            this.addOutput('    1 ?        00:00:01 systemd');
            this.addOutput('    2 ?        00:00:00 kthreadd');
            this.addOutput('  123 ?        00:00:00 nginx: master process');
            this.addOutput('  124 ?        00:00:00 nginx: worker process');
            this.addOutput('  456 ?        00:00:00 sshd: researcher@pts/0');
            this.addOutput('  789 pts/0    00:00:00 bash');
            this.addOutput('  890 ?        00:00:00 cron');
            this.addOutput('  901 ?        00:00:00 mysqld');
            this.addOutput('  902 pts/0    00:00:00 ps');
            // Hidden flag in process memory - students need to check /proc/*/environ
            this.addOutput('1337 ?        00:00:00 [flag_service]');
        } else {
            this.addOutput('  789 pts/0    00:00:00 bash');
            this.addOutput('  902 pts/0    00:00:00 ps');
        }
    }
}