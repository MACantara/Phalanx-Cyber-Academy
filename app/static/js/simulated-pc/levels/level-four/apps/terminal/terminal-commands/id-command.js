import { BaseCommand } from './base-command.js';

export class IdCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'id',
            description: 'Display user and group IDs',
            usage: 'id [OPTION]... [USER]',
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

        // Display current user identity information
        this.addOutput('uid=1000(researcher) gid=1000(researcher) groups=1000(researcher),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),116(lpadmin),126(sambashare),999(docker)');
    }
}