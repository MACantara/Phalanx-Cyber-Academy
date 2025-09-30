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
            'MISSION: Find 5 randomly selected hidden flags and complete a responsible disclosure report',
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
                headerLines[3] = `MISSION: Find ${ctfConfig.flags_per_session || 5} randomly selected hidden flags and complete a responsible disclosure report`;
                
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

                // Add dynamic CTF objectives based on selected flags
                const footerLines = [
                    '',
                    'Tips:',
                    '  - Start by exploring your home directory with "ls -la"',
                    '  - Check configuration files, logs, and hidden files',
                    '  - Use find and grep to search for flags',
                    '  - Read the mission brief with "cat mission_brief.txt" for current challenges',
                    '  - Use "submit-flag WHT{flag-value}" to submit captured flags',
                    '  - Use "hints" command for flag-specific guidance',
                    '  - Use Tab for command, option, file, and folder completion',
                    '  - Use ↑/↓ arrow keys to navigate command history'
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
            'MISSION: Find 5 hidden flags and complete a responsible disclosure report',
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

        // Add footer information
        const footerLines = [
            '',
            'CTF Objectives:',
            '  • Explore the system to find hidden flags',
            '  • Complete the responsible disclosure report using the desktop app',
            '  • Document your findings and recommendations',
            '  • Practice ethical security assessment techniques',
            '',
            'Tips:',
            '  - Start by exploring your home directory with "ls -la"',
            '  - Check configuration files, logs, and hidden files',
            '  - Use find and grep to search for flags',
            '  - Read the mission brief with "cat mission_brief.txt" for current challenges',
            '  - Use "submit-flag WHT{flag-value}" to submit captured flags',
            '  - Use "hints" command for flag-specific guidance',
            '  - Use Tab for command, option, file, and folder completion',
            '  - Use ↑/↓ arrow keys to navigate command history'
        ];

        footerLines.forEach(line => this.addOutput(line));
    }
}
