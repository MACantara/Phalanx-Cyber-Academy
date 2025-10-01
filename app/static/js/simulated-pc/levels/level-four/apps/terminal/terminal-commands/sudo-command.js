import { BaseCommand } from './base-command.js';

export class SudoCommand extends BaseCommand {
    constructor(processor) {
        super(processor);
        this.name = 'sudo';
        this.description = 'Execute commands with elevated privileges (simulated)';
    }

    getHelp() {
        return {
            description: 'Execute commands with elevated privileges (simulated for ethical hacking practice)',
            usage: 'sudo [command] | sudo -l',
            examples: [
                'sudo -l',
                'sudo find / -perm -4000',
                'sudo ls /root'
            ],
            options: [
                { flag: '-l', description: 'List allowed sudo commands for current user' },
                { flag: '-h, --help', description: 'Show this help message' }
            ]
        };
    }

    async execute(args) {
        // Handle help flag
        if (args.includes('-h') || args.includes('--help')) {
            this.showHelp();
            return;
        }

        // Handle -l flag (list sudo privileges)
        if (args.includes('-l')) {
            this.showSudoList();
            return;
        }

        // If no arguments, show usage
        if (args.length === 0) {
            this.processor.addOutput('Usage: sudo [command]', 'text-yellow-400');
            this.processor.addOutput('Try: sudo -l to list privileges', 'text-gray-400');
            return;
        }

        // Execute the command with simulated sudo privileges
        await this.executeWithSudo(args);
    }

    showSudoList() {
        this.processor.addOutput('🔐 Sudo Privileges for current user:', 'text-cyan-400');
        this.processor.addOutput('='.repeat(40), 'text-cyan-400');
        this.processor.addOutput('', '');
        
        // Simulated sudo privileges for ethical hacking practice
        const privileges = [
            'User researcher may run the following commands:',
            '    (ALL : ALL) NOPASSWD: /bin/ls',
            '    (ALL : ALL) NOPASSWD: /bin/cat',
            '    (ALL : ALL) NOPASSWD: /usr/bin/find',
            '    (ALL : ALL) NOPASSWD: /bin/ps',
            '    (root) NOPASSWD: /usr/bin/find / -perm -4000'
        ];

        privileges.forEach(privilege => {
            this.processor.addOutput(privilege, 'text-white');
        });

        this.processor.addOutput('', '');
        this.processor.addOutput('💡 Note: This is a simulated environment for ethical hacking practice', 'text-yellow-400');
        this.processor.addOutput('🎯 Try: sudo find / -perm -4000 2>/dev/null', 'text-green-400');
    }

    async executeWithSudo(args) {
        const command = args[0];
        const commandArgs = args.slice(1);

        this.processor.addOutput(`[sudo] Executing: ${args.join(' ')}`, 'text-blue-400');

        // Handle specific sudo commands used in CTF challenges
        switch (command) {
            case 'find':
                await this.handleSudoFind(commandArgs);
                break;
            case 'ls':
                await this.handleSudoLs(commandArgs);
                break;
            case 'cat':
                await this.handleSudoCat(commandArgs);
                break;
            case 'ps':
                await this.handleSudoPs(commandArgs);
                break;
            default:
                this.processor.addOutput(`sudo: ${command}: command not found or not permitted`, 'error');
                this.processor.addOutput('Use "sudo -l" to see available commands', 'text-gray-400');
                break;
        }
    }

    async handleSudoFind(args) {
        const argString = args.join(' ');
        
        // Handle SUID file discovery (key for WHT-PERMS flag)
        if (argString.includes('-perm -4000') || argString.includes('perm 4000')) {
            this.processor.addOutput('🔍 Searching for SUID binaries...', 'text-blue-400');
            this.processor.addOutput('', '');
            
            // Simulated SUID files that would be found in a real system
            const suidFiles = [
                '/usr/bin/sudo',
                '/usr/bin/passwd',
                '/usr/bin/su',
                '/usr/bin/mount',
                '/usr/bin/umount',
                '/usr/bin/ping',
                '/usr/local/bin/custom_admin_tool',  // Suspicious entry for CTF
                '/bin/security_checker'              // Another suspicious entry
            ];

            suidFiles.forEach(file => {
                this.processor.addOutput(file, 'text-green-300');
            });

            this.processor.addOutput('', '');
            this.processor.addOutput('⚠️  Found suspicious SUID binaries:', 'text-yellow-400');
            this.processor.addOutput('/usr/local/bin/custom_admin_tool', 'text-red-400');
            this.processor.addOutput('/bin/security_checker', 'text-red-400');
            this.processor.addOutput('', '');
            this.processor.addOutput('🎯 Flag discovered: WHT{permission_analysis}', 'text-green-400');
            this.processor.addOutput('', '');

            // Emit flag discovery event
            try {
                document.dispatchEvent(new CustomEvent('level4-flag-discovered', {
                    detail: {
                        flag: 'WHT{permission_analysis}',
                        flagId: 'WHT-PERMS',
                        timestamp: Date.now()
                    }
                }));
            } catch (error) {
                console.error('Error dispatching flag discovery event:', error);
            }

        } else if (argString.includes('/root') || argString.includes('/etc')) {
            this.processor.addOutput('🔍 Searching with elevated privileges...', 'text-blue-400');
            this.processor.addOutput('Permission granted for administrative directories', 'text-green-400');
            this.processor.addOutput('Use specific search patterns to find interesting files', 'text-gray-400');
        } else {
            this.processor.addOutput('🔍 Find command executed with sudo privileges', 'text-blue-400');
            this.processor.addOutput('No results match your search criteria', 'text-gray-400');
            this.processor.addOutput('Try: sudo find / -perm -4000 2>/dev/null', 'text-yellow-400');
        }
    }

    async handleSudoLs(args) {
        if (args.includes('/root')) {
            this.processor.addOutput('📁 Contents of /root (with sudo):', 'text-blue-400');
            this.processor.addOutput('.bash_history', 'text-green-300');
            this.processor.addOutput('.ssh/', 'text-blue-300');
            this.processor.addOutput('admin_notes.txt', 'text-white');
            this.processor.addOutput('config_backup.tar.gz', 'text-gray-300');
        } else {
            this.processor.addOutput('📁 Directory listing with elevated privileges', 'text-blue-400');
            this.processor.addOutput('Access granted to restricted directories', 'text-green-400');
        }
    }

    async handleSudoCat(args) {
        const filepath = args[0];
        if (filepath && filepath.includes('/root')) {
            this.processor.addOutput(`📄 Reading ${filepath} with elevated privileges:`, 'text-blue-400');
            this.processor.addOutput('# Administrative file - access granted via sudo', 'text-green-400');
            this.processor.addOutput('Content available with proper permissions', 'text-white');
        } else {
            this.processor.addOutput('📄 File access with sudo privileges', 'text-blue-400');
            this.processor.addOutput('Specify a file path to read with elevated access', 'text-gray-400');
        }
    }

    async handleSudoPs(args) {
        this.processor.addOutput('🔄 Process list with elevated privileges:', 'text-blue-400');
        this.processor.addOutput('All system processes visible with sudo access', 'text-green-400');
        this.processor.addOutput('', '');
        
        // Show some simulated processes with elevated view
        const processes = [
            'root     1     0  0.0  0.1   init',
            'root   123     1  0.0  0.5   systemd',
            'root   456     1  0.0  0.2   nginx',
            'admin  789     1  0.1  1.0   admin_daemon',
            'user  1234   789  0.0  0.3   bash'
        ];

        processes.forEach(proc => {
            this.processor.addOutput(proc, 'text-white');
        });
    }

    showHelp() {
        const help = this.getHelp();
        
        this.processor.addOutput(`${help.description}`, 'text-green-400');
        this.processor.addOutput('', '');
        this.processor.addOutput('USAGE:', 'text-yellow-400');
        this.processor.addOutput(`  ${help.usage}`, 'text-white');
        this.processor.addOutput('', '');
        this.processor.addOutput('DESCRIPTION:', 'text-yellow-400');
        this.processor.addOutput('  Execute commands with administrative privileges in a simulated', 'text-white');
        this.processor.addOutput('  environment for ethical hacking and security research practice.', 'text-white');
        this.processor.addOutput('', '');
        this.processor.addOutput('EXAMPLES:', 'text-yellow-400');
        help.examples.forEach(example => {
            this.processor.addOutput(`  ${example}`, 'text-gray-300');
        });
        this.processor.addOutput('', '');
        this.processor.addOutput('OPTIONS:', 'text-yellow-400');
        help.options.forEach(option => {
            this.processor.addOutput(`  ${option.flag.padEnd(20)} ${option.description}`, 'text-white');
        });
        this.processor.addOutput('', '');
        this.processor.addOutput('SECURITY LEARNING:', 'text-cyan-400');
        this.processor.addOutput('  • Understand privilege escalation concepts', 'text-blue-400');
        this.processor.addOutput('  • Learn about SUID/SGID binaries', 'text-blue-400');
        this.processor.addOutput('  • Practice permission analysis techniques', 'text-blue-400');
        this.processor.addOutput('  • Discover potential security vulnerabilities', 'text-blue-400');
        this.processor.addOutput('', '');
        this.processor.addOutput('🎯 CTF TIP: Use "sudo find / -perm -4000 2>/dev/null" to find SUID files!', 'text-green-400');
    }
}