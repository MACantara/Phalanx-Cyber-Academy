import { BaseCommand } from './base-command.js';

export class HelpCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'help',
            description: 'Display help information about commands',
            usage: 'help [COMMAND]',
            options: [
                { flag: 'COMMAND', description: 'Show detailed help for specific command' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        // If a specific command is requested
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const commandInstance = this.processor.commandRegistry.getCommand(commandName);
            
            if (commandInstance) {
                this.addOutput(`Help for '${commandName}':`);
                this.addOutput('');
                commandInstance.showHelp();
            } else {
                this.addOutput(`No help available for '${commandName}'. Command not found.`);
            }
            return;
        }

        // Show general help
        const commands = [
            'The White Hat Test - Responsible Disclosure CTF',
            '==============================================',
            '',
            'MISSION: Find 7 hidden flags and complete a responsible disclosure report',
            '',
            'Available commands (use "help <command>" for detailed information):',
            '',
            '  ls [-la]     - List directory contents',
            '  pwd          - Print working directory',
            '  cd [dir]     - Change directory',
            '  cat <file>   - Display file contents',
            '  find [opts]  - Search for files and directories',
            '  grep [opts]  - Search text patterns in files',
            '  whoami       - Display current user',
            '  clear        - Clear terminal screen',
            '  history      - Show command history',
            '  echo <text>  - Display text',
            '  date         - Show current date and time',
            '  uname [-a]   - Show system information',
            '  nmap [opts]  - Network mapper and security scanner',
            '  ping [opts]  - Test network connectivity to hosts',
            '  help [cmd]   - Show this help or help for specific command',
            '',
            'CTF Objectives:',
            '  • Explore the system to find 7 hidden flags (FLAG-1 through FLAG-7)',
            '  • Complete the responsible disclosure report in ~/disclosure_report.md',
            '  • Document your findings and recommendations',
            '  • Practice ethical security assessment techniques',
            '',
            'Tips:',
            '  - Start by exploring your home directory with "ls -la"',
            '  - Check configuration files, logs, and hidden files',
            '  - Use find and grep to search for flags',
            '  - Read the mission brief with "cat mission_brief.txt"',
            '  - Use Tab for command, option, file, and folder completion',
            '  - Use ↑/↓ arrow keys to navigate command history'
        ];
        
        commands.forEach(cmd => this.addOutput(cmd));
    }
}
