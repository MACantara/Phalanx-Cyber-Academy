import { BaseCommand } from './base-command.js';

export class EnvCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'env',
            description: 'Display environment variables',
            usage: 'env [OPTION]...',
            options: [
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        // Display environment variables including hidden flags
        this.addOutput('USER=researcher');
        this.addOutput('HOME=/home/researcher');
        this.addOutput('PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin');
        this.addOutput('SHELL=/bin/bash');
        this.addOutput('TERM=xterm-256color');
        this.addOutput('PWD=' + this.getCurrentDirectory());
        this.addOutput('LANG=en_US.UTF-8');
        // Environment flag for students to discover
        this.addOutput('DEBUG_FLAG=WHT{environment_variables_leak_secrets}');
        this.addOutput('SECRET_KEY=prod_key_2024_DO_NOT_COMMIT');
        this.addOutput('DATABASE_URL=postgresql://admin:secret123@localhost:5432/techcorp');
        this.addOutput('API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        this.addOutput('BACKUP_SCHEDULE=0 2 * * *');
        this.addOutput('LOG_LEVEL=DEBUG');
    }
}