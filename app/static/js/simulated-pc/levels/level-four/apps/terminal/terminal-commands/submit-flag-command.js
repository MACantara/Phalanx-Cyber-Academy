import { BaseCommand } from './base-command.js';

export class SubmitFlagCommand extends BaseCommand {
    constructor(processor) {
        super(processor);
        this.name = 'submit-flag';
        this.description = 'Submit a captured CTF flag for verification and track progress';
        
        // Challenge tracking state
        this.challenges = [];
        this.foundFlags = new Set(); // Contains flag values that were submitted
        this.foundFlagIds = new Set(); // Contains flag IDs that were completed
        this.challengesLoaded = false;
        
        // Load challenges on construction
        this.loadChallenges();
    }

    // Load challenges from API
    async loadChallenges() {
        try {
            const response = await fetch('/api/level4/flags-config');
            if (!response.ok) {
                throw new Error(`Failed to load challenges: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Use all flags from configuration
            if (data.success && data.ctf_config && data.ctf_config.flags) {
                this.challenges = Object.entries(data.ctf_config.flags).map(([id, info]) => ({
                    id: id,
                    name: info.name || id,
                    challenge_question: info.challenge_question || info.name || 'Challenge description loading...',
                    category: info.category || 'general',
                    difficulty: info.difficulty || 'medium',
                    value: info.value || `WHT{...}`
                }));
            } else {
                // Fallback with known flags
                this.challenges = [
                    { id: 'WHT-ENV', name: 'Environment Reconnaissance', challenge_question: 'Find hidden information in user environment configuration files', value: 'WHT{enum_services_first}' },
                    { id: 'WHT-ENV2', name: 'Environment Variables Leak', challenge_question: 'Discover secrets exposed in admin environment variables', value: 'WHT{environment_variables_leak_secrets}' },
                    { id: 'WHT-BACKUP', name: 'Backup Script Analysis', challenge_question: 'Analyze automated backup scripts for security issues', value: 'WHT{backup_script_analysis}' },
                    { id: 'WHT-HIST', name: 'Command History Forensics', challenge_question: 'Examine command history for accidentally leaked credentials', value: 'WHT{command_history_forensics}' },
                    { id: 'WHT-SRC', name: 'Source Code Analysis', challenge_question: 'Find flags hidden in HTML comments and source code', value: 'WHT{source_code_comments}' },
                    { id: 'WHT-DB', name: 'Database Configuration', challenge_question: 'Locate database credentials in configuration files', value: 'WHT{database_credentials_found}' },
                    { id: 'WHT-LOG', name: 'Log File Analysis', challenge_question: 'Search web server logs for security information', value: 'WHT{log_files_reveal_activity}' }
                ];
            }
            
            this.challengesLoaded = true;
            console.log('[SubmitFlagCommand] Loaded', this.challenges.length, 'challenges');
        } catch (error) {
            console.error('[SubmitFlagCommand] Error loading challenges:', error);
            // Fallback to basic challenges
            this.challenges = [{
                id: 'loading',
                challenge_question: "Loading challenges...",
                name: "Challenge System",
                value: "WHT{loading}"
            }];
            this.challengesLoaded = false;
        }
    }

    getHelp() {
        return {
            description: 'Submit a captured CTF flag for verification and track progress',
            usage: 'submit-flag [flag-value] | submit-flag --progress | submit-flag --challenges',
            examples: [
                'submit-flag WHT{example_flag_here}',
                'submit-flag "WHT{flag with spaces}"',
                'submit-flag --progress',
                'submit-flag --challenges'
            ],
            options: [
                { flag: '-h, --help', description: 'Show this help message' },
                { flag: '--progress, -p', description: 'Show current progress and found flags' },
                { flag: '--challenges, -c', description: 'List all available challenges' },
                { flag: '--status, -s', description: 'Show detailed status of all challenges' }
            ]
        };
    }

    async execute(args) {
        // Handle help flag
        if (args.includes('-h') || args.includes('--help')) {
            this.showHelp();
            return;
        }

        // Handle progress flag
        if (args.includes('--progress') || args.includes('-p')) {
            await this.showProgress();
            return;
        }

        // Handle challenges flag
        if (args.includes('--challenges') || args.includes('-c')) {
            await this.showChallenges();
            return;
        }

        // Handle status flag
        if (args.includes('--status') || args.includes('-s')) {
            await this.showDetailedStatus();
            return;
        }

        // Check if flag value is provided
        if (args.length === 0) {
            this.processor.addOutput('Error: No flag provided', 'error');
            this.processor.addOutput('Usage: submit-flag [flag-value]', 'text-yellow-400');
            this.processor.addOutput('Use --help for more options', 'text-gray-400');
            this.processor.addOutput('Example: submit-flag WHT{example_flag_here}', 'text-gray-400');
            return;
        }

        // Join all arguments to handle flags with spaces
        const flagValue = args.join(' ').trim();

        // Validate flag format (basic check)
        if (!this.isValidFlagFormat(flagValue)) {
            this.processor.addOutput('Warning: Flag format appears invalid', 'text-yellow-400');
            this.processor.addOutput('Expected format: WHT{...}', 'text-gray-400');
        }

        // Submit the flag
        await this.submitFlag(flagValue);
    }

    isValidFlagFormat(flag) {
        // Updated flag format validation for WHT{} format
        const whtFormats = [
            /^WHT\{.*\}$/i,           // WHT{flag} - primary format
            /^CTF\{.*\}$/i,           // CTF{flag} - legacy support
            /^FLAG\{.*\}$/i,          // FLAG{flag} - alternative
            /^[A-Z0-9_-]+\{.*\}$/i    // Generic format
        ];

        return whtFormats.some(pattern => pattern.test(flag));
    }

    async showProgress() {
        if (!this.challengesLoaded) {
            await this.loadChallenges();
        }

        const totalFlags = this.challenges.length;
        const foundCount = this.foundFlags.size;
        const percentage = totalFlags > 0 ? Math.round((foundCount / totalFlags) * 100) : 0;

        this.processor.addOutput('🏆 The White Hat Test - Progress Report', 'text-yellow-400');
        this.processor.addOutput('='.repeat(50), 'text-yellow-400');
        this.processor.addOutput('', '');
        this.processor.addOutput(`Progress: ${foundCount}/${totalFlags} flags captured (${percentage}%)`, 'text-blue-400');
        
        // Progress bar
        const barWidth = 30;
        const filled = Math.round((foundCount / totalFlags) * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        this.processor.addOutput(`[${bar}]`, 'text-green-400');
        this.processor.addOutput('', '');

        if (foundCount > 0) {
            this.processor.addOutput('Found Flags:', 'text-green-400');
            Array.from(this.foundFlags).forEach((flag, index) => {
                this.processor.addOutput(`  ${index + 1}. ${flag}`, 'text-green-300');
            });
        } else {
            this.processor.addOutput('No flags captured yet. Start exploring!', 'text-gray-400');
        }

        this.processor.addOutput('', '');
        this.processor.addOutput('Use "submit-flag --challenges" to see available challenges', 'text-blue-400');
    }

    async showChallenges() {
        if (!this.challengesLoaded) {
            await this.loadChallenges();
        }

        this.processor.addOutput('🎯 Available Challenges', 'text-yellow-400');
        this.processor.addOutput('='.repeat(50), 'text-yellow-400');
        this.processor.addOutput('', '');

        this.challenges.forEach((challenge, index) => {
            const isCompleted = this.foundFlagIds.has(challenge.id);
            const status = isCompleted ? '✓' : '○';
            const statusColor = isCompleted ? 'text-green-400' : 'text-gray-400';
            
            this.processor.addOutput(`${status} ${index + 1}. ${challenge.name}`, statusColor);
            this.processor.addOutput(`   ${challenge.challenge_question}`, 'text-gray-300');
            this.processor.addOutput(`   Category: ${challenge.category || 'general'} | Difficulty: ${challenge.difficulty || 'medium'}`, 'text-blue-400');
            this.processor.addOutput('', '');
        });

        this.processor.addOutput('💡 Tip: Explore the file system, check logs, and analyze configurations!', 'text-yellow-400');
    }

    async showDetailedStatus() {
        if (!this.challengesLoaded) {
            await this.loadChallenges();
        }

        const totalFlags = this.challenges.length;
        const foundCount = this.foundFlags.size;

        this.processor.addOutput('📊 Detailed Challenge Status', 'text-yellow-400');
        this.processor.addOutput('='.repeat(60), 'text-yellow-400');
        this.processor.addOutput('', '');

        // Summary
        this.processor.addOutput(`Total Challenges: ${totalFlags}`, 'text-blue-400');
        this.processor.addOutput(`Completed: ${foundCount}`, 'text-green-400');
        this.processor.addOutput(`Remaining: ${totalFlags - foundCount}`, 'text-red-400');
        this.processor.addOutput('', '');

        // Detailed breakdown
        const categories = {};
        this.challenges.forEach(challenge => {
            const cat = challenge.category || 'general';
            if (!categories[cat]) {
                categories[cat] = { total: 0, completed: 0 };
            }
            categories[cat].total++;
            if (this.foundFlagIds.has(challenge.id)) {
                categories[cat].completed++;
            }
        });

        this.processor.addOutput('Progress by Category:', 'text-cyan-400');
        Object.entries(categories).forEach(([category, stats]) => {
            const percentage = Math.round((stats.completed / stats.total) * 100);
            this.processor.addOutput(`  ${category}: ${stats.completed}/${stats.total} (${percentage}%)`, 'text-white');
        });

        this.processor.addOutput('', '');
        this.processor.addOutput('Use "submit-flag --challenges" to see all challenges', 'text-blue-400');
    }

    async submitFlag(flagValue) {
        try {
            this.processor.addOutput(`Submitting flag: ${flagValue}`, 'text-blue-400');
            this.processor.addOutput('Verifying flag against challenge database...', 'text-gray-400');

            if (!this.challengesLoaded) {
                await this.loadChallenges();
            }

            // Check if flag was already found
            if (this.foundFlags.has(flagValue)) {
                this.processor.addOutput('Flag already submitted!', 'text-yellow-400');
                this.processor.addOutput(`Flag: ${flagValue}`, 'text-gray-400');
                return;
            }

            // Try to validate the flag
            const validationResult = await this.validateFlag(flagValue);

            if (validationResult.isValid) {
                // Mark flag as found
                this.markFlagFound(flagValue, validationResult.flagId);
                
                const progress = this.getProgress();
                this.processor.addOutput('✓ FLAG ACCEPTED!', 'text-green-400');
                this.processor.addOutput(`Flag: ${flagValue}`, 'text-green-300');
                
                // Show challenge info if available
                if (validationResult.challengeInfo) {
                    this.processor.addOutput(`Challenge: ${validationResult.challengeInfo.name}`, 'text-blue-300');
                    this.processor.addOutput(`Category: ${validationResult.challengeInfo.category}`, 'text-cyan-400');
                }
                
                this.processor.addOutput(`Progress: ${progress.found}/${progress.total} flags captured`, 'text-blue-400');
                
                // Show achievement message
                this.processor.addOutput('', '');
                this.processor.addOutput('='.repeat(50), 'text-yellow-400');
                this.processor.addOutput('🏆 FLAG CAPTURED! Well done, researcher!', 'text-yellow-400');
                this.processor.addOutput('='.repeat(50), 'text-yellow-400');

                // Check if all flags are found
                if (progress.found === progress.total) {
                    await this.onAllChallengesCompleted();
                }
            } else {
                this.processor.addOutput('✗ Flag not recognized', 'error');
                this.processor.addOutput(`Submitted: ${flagValue}`, 'text-gray-400');
                this.processor.addOutput('Double-check the flag format and try again', 'text-yellow-400');
                this.processor.addOutput('Hint: Look for flags in configuration files, logs, and hidden directories', 'text-blue-400');
                this.processor.addOutput('Use "submit-flag --challenges" to see available challenges', 'text-cyan-400');
            }

        } catch (error) {
            this.processor.addOutput(`Error submitting flag: ${error.message}`, 'error');
            console.error('Flag submission error:', error);
        }
    }

    async validateFlag(flagValue) {
        try {
            // Load all flags for validation
            const { getAllFlags } = await import('../../index.js');
            const allFlags = await getAllFlags();
            
            // Check if the submitted flag matches any valid flag
            const flagEntries = Object.entries(allFlags);
            for (const [flagId, validFlag] of flagEntries) {
                if (flagValue === validFlag) {
                    // Find challenge info
                    const challengeInfo = this.challenges.find(c => c.id === flagId);
                    return { 
                        isValid: true, 
                        flagId: flagId,
                        challengeInfo: challengeInfo
                    };
                }
            }

            return { isValid: false };
        } catch (error) {
            console.error('Error validating flag:', error);
            this.processor.addOutput('Warning: Could not validate flag against database', 'text-yellow-400');
            
            // Fallback: Allow any properly formatted flag for testing
            if (this.isValidFlagFormat(flagValue)) {
                this.processor.addOutput('Flag format is valid, accepting for testing purposes', 'text-blue-400');
                return { isValid: true, flagId: 'test', challengeInfo: null };
            }
            
            return { isValid: false };
        }
    }

    markFlagFound(flagValue, flagId = null) {
        this.foundFlags.add(flagValue);
        
        // Try to find the flag ID if not provided
        if (!flagId) {
            const challenge = this.challenges.find(c => 
                flagValue === c.value
            );
            flagId = challenge?.id;
        }
        
        if (flagId) {
            this.foundFlagIds.add(flagId);
        }
        
        console.log('[SubmitFlagCommand] Flag found:', flagValue, 'ID:', flagId);
    }

    async onAllChallengesCompleted() {
        this.processor.addOutput('', '');
        this.processor.addOutput('🎉 CONGRATULATIONS! 🎉', 'text-green-400');
        this.processor.addOutput('All flags have been captured!', 'text-green-300');
        this.processor.addOutput('', '');
        this.processor.addOutput('🏅 Achievement Unlocked: White Hat Expert', 'text-yellow-400');
        this.processor.addOutput('You have successfully completed The White Hat Test!', 'text-cyan-400');
        this.processor.addOutput('', '');
        this.processor.addOutput('📋 Next Steps:', 'text-blue-400');
        this.processor.addOutput('1. Document your findings in a responsible disclosure report', 'text-white');
        this.processor.addOutput('2. Include remediation recommendations for each vulnerability', 'text-white');
        this.processor.addOutput('3. Follow ethical disclosure practices', 'text-white');
        this.processor.addOutput('', '');
        this.processor.addOutput('Thank you for practicing ethical security research!', 'text-green-400');
        
        // Emit completion event
        try {
            document.dispatchEvent(new CustomEvent('level4-completed', {
                detail: { 
                    totalFlags: this.challenges.length,
                    foundFlags: Array.from(this.foundFlags),
                    completionTime: new Date().toISOString()
                }
            }));
        } catch (error) {
            console.error('Error dispatching completion event:', error);
        }
    }

    getProgress() {
        return {
            found: this.foundFlags.size,
            total: this.challenges.length,
            percentage: this.challenges.length > 0 ? Math.round((this.foundFlags.size / this.challenges.length) * 100) : 0
        };
    }

    showHelp() {
        const help = this.getHelp();
        
        this.processor.addOutput(`${help.description}`, 'text-green-400');
        this.processor.addOutput('', '');
        this.processor.addOutput('USAGE:', 'text-yellow-400');
        this.processor.addOutput(`  ${help.usage}`, 'text-white');
        this.processor.addOutput('', '');
        this.processor.addOutput('DESCRIPTION:', 'text-yellow-400');
        this.processor.addOutput('  Submit captured CTF flags for verification and scoring.', 'text-white');
        this.processor.addOutput('  Flags are typically found in configuration files, logs,', 'text-white');
        this.processor.addOutput('  hidden directories, or through various enumeration techniques.', 'text-white');
        this.processor.addOutput('', '');
        this.processor.addOutput('EXAMPLES:', 'text-yellow-400');
        help.examples.forEach(example => {
            this.processor.addOutput(`  ${example}`, 'text-gray-300');
        });
        this.processor.addOutput('', '');
        this.processor.addOutput('FLAG FORMATS:', 'text-yellow-400');
        this.processor.addOutput('  WHT{flag_content}     - White Hat Test format (primary)', 'text-green-300');
        this.processor.addOutput('  CTF{flag_content}     - Standard CTF format (legacy)', 'text-gray-300');
        this.processor.addOutput('  FLAG{flag_content}    - Alternative format', 'text-gray-300');
        this.processor.addOutput('', '');
        this.processor.addOutput('TIPS:', 'text-yellow-400');
        this.processor.addOutput('  • Check system logs and configuration files', 'text-blue-400');
        this.processor.addOutput('  • Look for hidden files and directories', 'text-blue-400');
        this.processor.addOutput('  • Use enumeration commands like find, grep, and cat', 'text-blue-400');
        this.processor.addOutput('  • Examine network services and their configurations', 'text-blue-400');
        this.processor.addOutput('', '');
        this.processor.addOutput('OPTIONS:', 'text-yellow-400');
        help.options.forEach(option => {
            this.processor.addOutput(`  ${option.flag.padEnd(20)} ${option.description}`, 'text-gray-300');
        });
    }
}