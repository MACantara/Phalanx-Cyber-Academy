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

        // Show general help with dynamically loaded commands
        this.showGeneralHelp();
    }

    async showGeneralHelp() {
        let headerLines = [
            'The White Hat Test - Responsible Disclosure CTF',
            '==============================================',
            '',
            'MISSION: Find 3 randomly selected hidden flags and learn ethical hacking basics',
            '',
            'Available commands (use "help <command>" for detailed information):',
            ''
        ];

        try {
            // Load CTF configuration from API
            const response = await fetch('/api/level4/flags-config');
            const configData = await response.json();
            
            if (configData.success) {
                const ctfConfig = configData.ctf_config;
                const selectedFlags = ctfConfig.selected_flags || [];
                
                // Update mission description with dynamic flag count
                headerLines[3] = `MISSION: Find ${ctfConfig.flags_per_session || 3} randomly selected hidden flags and learn ethical hacking basics`;
                
                // Add header
                headerLines.forEach(line => this.addOutput(line));

                // Get all registered commands and their info dynamically
                const commandNames = this.processor.commandRegistry.getAllCommands().sort();
                const maxNameLength = Math.max(...commandNames.map(name => name.length));

                commandNames.forEach(commandName => {
                    const commandInstance = this.processor.commandRegistry.getCommand(commandName);
                    if (commandInstance) {
                        const help = commandInstance.getHelp();
                        const paddedName = commandName.padEnd(maxNameLength + 2);
                        const description = help.description || 'No description available';
                        
                        this.addOutput(`  ${paddedName} - ${description}`);
                    }
                });

                // Add beginner-friendly guidance
                const footerLines = [
                    '',
                    'Getting Started:',
                    '  1. Start with "ls -la" to see all files (including hidden ones)',
                    '  2. Use "cat filename" to read interesting files',
                    '  3. Check different directories like /etc/, /var/log/, /tmp/',
                    '  4. Use "find" and "grep" to search for files and text',
                    '  5. Submit flags with "submit-flag WHT{flag-value}"',
                    '',
                    'Tips:',
                    '  - Hidden files start with a dot (.) - they often contain secrets!',
                    '  - Use "hints" when you need help finding specific flags',
                    '  - Try Tab to auto-complete commands and filenames',
                    '  - Use ↑/↓ arrow keys to repeat previous commands'
                ];

                footerLines.forEach(line => this.addOutput(line));
            } else {
                // Fallback to static help if API fails
                this.showStaticHelp();
            }
        } catch (error) {
            console.error('Error loading CTF configuration:', error);
            this.showStaticHelp();
        }
    }

    showStaticHelp() {
        const headerLines = [
            'The White Hat Test - Responsible Disclosure CTF',
            '==============================================',
            '',
            'MISSION: Find 3 hidden flags and learn ethical hacking basics',
            '',
            'Available commands (use "help <command>" for detailed information):',
            ''
        ];

        // Add header
        headerLines.forEach(line => this.addOutput(line));

        // Get all registered commands and their info dynamically
        const commandNames = this.processor.commandRegistry.getAllCommands().sort();
        const maxNameLength = Math.max(...commandNames.map(name => name.length));

        commandNames.forEach(commandName => {
            const commandInstance = this.processor.commandRegistry.getCommand(commandName);
            if (commandInstance) {
                const help = commandInstance.getHelp();
                const paddedName = commandName.padEnd(maxNameLength + 2);
                const description = help.description || 'No description available';
                
                this.addOutput(`  ${paddedName} - ${description}`);
            }
        });

        // Add beginner-friendly footer
        const footerLines = [
            '',
            'Your Mission:',
            '  • Find 3 hidden security flags in the system',
            '  • Learn basic ethical hacking techniques',
            '  • Practice responsible vulnerability discovery',
            '',
            'Getting Started:',
            '  1. Start with "ls -la" to see all files (including hidden ones)',
            '  2. Use "cat filename" to read interesting files',
            '  3. Check different directories like /etc/, /var/log/, /tmp/',
            '  4. Use "find" and "grep" to search for files and text',
            '  5. Submit flags with "submit-flag WHT{flag-value}"',
            '',
            'Tips:',
            '  - Hidden files start with a dot (.) - they often contain secrets!',
            '  - Use "hints" when you need help finding specific flags',
            '  - Try Tab to auto-complete commands and filenames',
            '  - Use ↑/↓ arrow keys to repeat previous commands'
        ];

        footerLines.forEach(line => this.addOutput(line));
    }
}
