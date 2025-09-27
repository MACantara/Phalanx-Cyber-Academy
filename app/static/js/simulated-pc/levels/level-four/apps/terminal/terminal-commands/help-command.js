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
            'Available commands (use "help <command>" for detailed information):',
            '',
            '  ls [-la]     - List directory contents',
            '  pwd          - Print working directory',
            '  cd [dir]     - Change directory',
            '  cat <file>   - Display file contents',
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
            'Tips:',
            '  - Use Tab for command, option, file, and folder completion',
            '  - Use ↑/↓ arrow keys to navigate command history',
            '  - Add --help to any command for detailed usage information',
            '  - Type "help <command>" for specific command help',
            '  - Tab completion works for:',
            '    • Command names (e.g., "h" + Tab → "help")',
            '    • Command options (e.g., "ls -" + Tab → "-l", "-a", "-la")',
            '    • File and directory names (smart filtering by command)',
            '    • Absolute paths (starting with "/")',
            '    • Relative paths (e.g., "Doc" + Tab → "Documents/")',
            '    • Home directory paths (starting with "~/")',
            '    • Hidden files (starting with ".")',
            '',
            'File completion examples:',
            '  - "cd D" + Tab → completes to directories only',
            '  - "cat r" + Tab → completes to files only',
            '  - "ls Doc" + Tab → completes to "Documents/"',
            '  - "cat ~/." + Tab → shows hidden files in home directory'
        ];
        
        commands.forEach(cmd => this.addOutput(cmd));
    }
}
