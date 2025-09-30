import { BaseCommand } from './base-command.js';

export class NetstatCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'netstat',
            description: 'Display network connections and listening ports',
            usage: 'netstat [OPTION]...',
            options: [
                { flag: '-tuln', description: 'Show TCP and UDP listening ports with numeric addresses' },
                { flag: '-a', description: 'Show all connections and listening ports' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        const showAll = args.includes('-a') || args.includes('-tuln');
        
        this.addOutput('Active Internet connections (only servers)');
        this.addOutput('Proto Recv-Q Send-Q Local Address           Foreign Address         State');
        
        if (showAll || args.includes('-tuln')) {
            // Show typical web server and SSH ports
            this.addOutput('tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN');
            this.addOutput('tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN');
            this.addOutput('tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN');
            this.addOutput('tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN');
            // Hidden service on unusual port - security assessment finding
            this.addOutput('tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN');
            this.addOutput('tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN');
            // Suspicious service that might contain flags
            this.addOutput('tcp        0      0 127.0.0.1:1337          0.0.0.0:*               LISTEN');
            this.addOutput('udp        0      0 0.0.0.0:53              0.0.0.0:*');
            this.addOutput('udp        0      0 127.0.0.1:631           0.0.0.0:*');
        } else {
            this.addOutput('tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN');
            this.addOutput('tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN');
        }
    }
}