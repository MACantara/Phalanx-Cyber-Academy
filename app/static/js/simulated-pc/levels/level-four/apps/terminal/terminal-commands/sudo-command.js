import { BaseCommand } from './base-command.js';

export class SudoCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'sudo',
            description: 'Execute commands as another user',
            usage: 'sudo [OPTION]... COMMAND',
            options: [
                { flag: '-l', description: 'List allowed commands for current user' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        if (args.includes('-l')) {
            // Show sudo permissions - security assessment information
            this.addOutput('Matching Defaults entries for researcher on sandbox:');
            this.addOutput('    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin');
            this.addOutput('');
            this.addOutput('User researcher may run the following commands on sandbox:');
            this.addOutput('    (root) NOPASSWD: /bin/ls, /bin/cat /var/log/*');
            this.addOutput('    (root) NOPASSWD: /usr/local/bin/backup_script.sh');
            this.addOutput('    (admin) /usr/bin/systemctl restart nginx');
            // Security misconfiguration - privilege escalation opportunity
            this.addOutput('    (ALL) NOPASSWD: /bin/find /var/log -name "*.log" -exec cat {} \\;');
            this.addOutput('# WHT{sudo_privilege_analysis} - Check for privilege escalation vectors');
        } else if (args.length > 0) {
            this.addOutput('sudo: command execution simulated in CTF environment', 'text-yellow-400');
            this.addOutput('In real environment, this would execute: ' + args.join(' '), 'text-gray-400');
        } else {
            this.addOutput('sudo: a command must be specified', 'error');
        }
    }
}