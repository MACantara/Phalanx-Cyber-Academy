import { BaseCommand } from './base-command.js';

export class HintsCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'hints',
            description: 'Show hints for CTF flags',
            usage: 'hints [flag_number]',
            options: [
                { flag: 'flag_number', description: 'Specific flag number to get hints for (1-3)' },
                { flag: '--all', description: 'Show hints for all flags' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    async execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        try {
            // Load flag configuration
            const response = await fetch('/api/level4/flags-config');
            const result = await response.json();
            
            if (!result.success) {
                this.addOutput('Error: Unable to load flag hints', 'error');
                return;
            }

            const flagsConfig = result.ctf_config.flags;

            if (args.includes('--all')) {
                this.showAllHints(flagsConfig);
            } else if (args.length > 0) {
                const flagNumber = args[0].toUpperCase();
                if (!flagNumber.startsWith('FLAG-')) {
                    const num = parseInt(flagNumber);
                    if (num >= 1 && num <= 3) {
                        this.showFlagHints(`FLAG-${num}`, flagsConfig);
                    } else {
                        this.addOutput('Error: Flag number must be between 1 and 3', 'error');
                    }
                } else {
                    this.showFlagHints(flagNumber, flagsConfig);
                }
            } else {
                this.showHintsOverview(flagsConfig);
            }

        } catch (error) {
            console.error('Error loading flag hints:', error);
            this.addOutput('Error: Failed to load flag hints', 'error');
        }
    }

    showHintsOverview(flagsConfig) {
        this.addOutput('CTF Flag Hints Overview', 'text-cyan-400');
        this.addOutput('========================', 'text-cyan-400');
        this.addOutput('');

        const flagIds = Object.keys(flagsConfig).sort();
        
        flagIds.forEach(flagId => {
            const flag = flagsConfig[flagId];
            this.addOutput(`${flagId}: ${flag.name}`, 'text-yellow-400');
            this.addOutput(`  Category: ${flag.category}`, 'text-gray-400');
            this.addOutput(`  Difficulty: ${flag.difficulty}`, 'text-gray-400');
            this.addOutput('');
        });

        this.addOutput('Usage: hints <flag_number> for specific hints', 'text-blue-400');
        this.addOutput('       hints --all for all hints', 'text-blue-400');
    }

    showFlagHints(flagId, flagsConfig) {
        const flag = flagsConfig[flagId];
        if (!flag) {
            this.addOutput(`Error: Flag ${flagId} not found`, 'error');
            return;
        }

        this.addOutput(`Hints for ${flagId}: ${flag.name}`, 'text-cyan-400');
        this.addOutput('='.repeat(40), 'text-cyan-400');
        this.addOutput('');
        
        this.addOutput(`Description: ${flag.description}`, 'text-yellow-400');
        this.addOutput(`Category: ${flag.category}`, 'text-gray-400');
        this.addOutput(`Difficulty: ${flag.difficulty}`, 'text-gray-400');
        this.addOutput('');

        if (flag.hints && flag.hints.length > 0) {
            this.addOutput('Hints:', 'text-green-400');
            flag.hints.forEach((hint, index) => {
                this.addOutput(`  ${index + 1}. ${hint}`, 'text-white');
            });
            this.addOutput('');
        }

        if (flag.discovery_commands && flag.discovery_commands.length > 0) {
            this.addOutput('Suggested commands:', 'text-blue-400');
            flag.discovery_commands.forEach(cmd => {
                this.addOutput(`  ${cmd}`, 'text-green-300');
            });
            this.addOutput('');
        }

        if (flag.learning_objectives && flag.learning_objectives.length > 0) {
            this.addOutput('Learning objectives:', 'text-purple-400');
            flag.learning_objectives.forEach((objective, index) => {
                this.addOutput(`  • ${objective}`, 'text-gray-300');
            });
        }
    }

    showAllHints(flagsConfig) {
        this.addOutput('All CTF Flag Hints', 'text-cyan-400');
        this.addOutput('==================', 'text-cyan-400');
        this.addOutput('');

        const flagIds = Object.keys(flagsConfig).sort();
        
        flagIds.forEach((flagId, index) => {
            if (index > 0) this.addOutput('');
            this.showFlagHints(flagId, flagsConfig);
            if (index < flagIds.length - 1) {
                this.addOutput('-'.repeat(40), 'text-gray-600');
            }
        });
    }
}