import { BaseCommand } from './base-command.js';

export class SsCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'ss',
            description: 'Modern utility to investigate sockets (replacement for netstat)',
            usage: 'ss [OPTION]...',
            options: [
                { flag: '-tuln', description: 'Show TCP and UDP listening sockets with numeric addresses' },
                { flag: '-a', description: 'Show all sockets' },
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
        
        this.addOutput('Netid  State      Recv-Q Send-Q Local Address:Port               Peer Address:Port');
        
        if (showAll || args.includes('-tuln')) {
            // Modern socket information display
            this.addOutput('tcp    LISTEN     0      128          *:22                     *:*');
            this.addOutput('tcp    LISTEN     0      80           127.0.0.1:3306           *:*');
            this.addOutput('tcp    LISTEN     0      128          *:80                     *:*');
            this.addOutput('tcp    LISTEN     0      128          *:443                    *:*');
            // Network configuration analysis opportunity
            this.addOutput('tcp    LISTEN     0      128          *:8080                   *:*');
            this.addOutput('tcp    LISTEN     0      128          127.0.0.1:5432           *:*');
            // Suspicious internal service
            this.addOutput('tcp    LISTEN     0      128          127.0.0.1:1337           *:*');
            this.addOutput('udp    UNCONN     0      0            *:53                     *:*');
            this.addOutput('udp    UNCONN     0      0            127.0.0.1:631            *:*');
        } else {
            this.addOutput('tcp    LISTEN     0      128          *:22                     *:*');
            this.addOutput('tcp    LISTEN     0      128          *:80                     *:*');
        }
    }
}