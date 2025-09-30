import { BaseCommand } from './base-command.js';

export class SystemctlCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'systemctl',
            description: 'Control systemd services',
            usage: 'systemctl [OPTIONS...] {COMMAND} [NAME...]',
            options: [
                { flag: 'status NAME', description: 'Show service status' },
                { flag: 'list-unit-files', description: 'List all available services' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        if (args.length === 0) {
            this.addOutput('systemctl: missing command', 'error');
            return;
        }

        const command = args[0];

        if (command === 'list-unit-files') {
            this.addOutput('UNIT FILE                     STATE   ');
            this.addOutput('nginx.service                 enabled ');
            this.addOutput('ssh.service                   enabled ');
            this.addOutput('mysql.service                 enabled ');
            this.addOutput('cron.service                  enabled ');
            this.addOutput('apache2.service               disabled');
            // Suspicious service that might contain secrets
            this.addOutput('backdoor.service              masked  ');
            this.addOutput('monitoring.service            enabled ');
            this.addOutput('backup.service                enabled ');
            this.addOutput('');
            this.addOutput('8 unit files listed.');
        } else if (command === 'status' && args.length > 1) {
            const service = args[1];
            this.addOutput(`● ${service}`);
            this.addOutput(`   Loaded: loaded (/lib/systemd/system/${service}; enabled; vendor preset: enabled)`);
            
            if (service === 'nginx.service') {
                this.addOutput('   Active: active (running) since Mon 2025-09-27 08:00:00 UTC; 2h 30min ago');
                this.addOutput('  Process: 123 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)');
                this.addOutput(' Main PID: 124 (nginx)');
            } else if (service === 'backup.service') {
                this.addOutput('   Active: active (running) since Mon 2025-09-27 02:00:00 UTC; 8h ago');
                this.addOutput('  Process: 890 ExecStart=/usr/local/bin/backup_script.sh (code=exited, status=0/SUCCESS)');
                this.addOutput('# Check backup service configuration for potential security issues');
            } else {
                this.addOutput('   Active: active (running) since Mon 2025-09-27 08:00:00 UTC; 2h ago');
            }
        } else {
            this.addOutput(`systemctl: invalid command '${command}'`, 'error');
        }
    }
}