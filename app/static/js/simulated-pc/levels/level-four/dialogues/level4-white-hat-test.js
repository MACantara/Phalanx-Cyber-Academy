import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level4WhiteHatTestDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🎓 Level 4: The White Hat Test\n\nWelcome to ethical hacking! You'll learn responsible security testing by finding hidden vulnerabilities in a safe environment."
            },
            {
                text: "🛡️ What is Ethical Hacking?\n\nEthical hackers are security professionals who find vulnerabilities to help organizations improve their security - with permission!"
            },
            {
                text: "🎯 Your Mission:\n\nFind 3 security flags hidden in the system using basic terminal commands. Each flag teaches you a fundamental ethical hacking skill."
            },
            {
                text: "� Essential Commands:\n\nYou'll use these basic terminal commands to explore the system and find vulnerabilities:",
                example: "Core Commands:\nls -la    # List all files (including hidden)\ncat file  # Read file contents\nfind /    # Search for files\ngrep text # Search inside files"
            },
            {
                text: "🔍 Where to Look:\n\n• Hidden files (start with .)\n• Configuration files in /etc/\n• Log files in /var/log/\n• User directories in /home/",
                example: "Getting Started:\nls -a ~          # Check home directory\ncat ~/.bashrc     # Read shell config\nls /var/log/      # Check log directory"
            },
            {
                text: "� What You'll Learn:\n\n1. Basic Reconnaissance - Find hidden files\n2. Log Analysis - Examine system logs\n3. Configuration Review - Check server settings\n4. Credential Discovery - Find exposed passwords\n5. Network Analysis - Understand network setup\n6. Process Analysis - Check running services\n7. Permission Analysis - Find security flaws\n8. Responsible Disclosure - Report findings ethically"
            },
            {
                text: "🎮 Getting Started:\n\n1. Open the Terminal application\n2. Start exploring with 'ls -a ~' to list files\n3. Use 'hints' command when you need help\n4. Submit flags with 'submit-flag WHT{flag_value}'",
                example: "First Commands to Try:\nls -a ~              # Check your home directory\ncat ~/.bashrc         # Read configuration files\nls /var/log/          # Look at system logs\nhints                 # Get help when stuck"
            },
            {
                text: "🛡️ Remember: Always Practice Ethical Hacking!\n\n• Only test systems you have permission to test\n• Report vulnerabilities responsibly\n• Help organizations improve their security\n• Respect privacy and data protection\n\nReady to start your ethical hacking journey?"
            }
        ];
    }

    async onComplete() {
        localStorage.setItem('cyberquest_level_4_started', 'true');
        localStorage.setItem('cyberquest_level_4_start_time', Date.now());
        
        // Create and start challenge tracker
        await this.createAndStartChallengeTracker();
        
        // Open the Terminal application for ethical hacking tools
        if (window.applicationLauncher) {
            setTimeout(async () => {
                await window.applicationLauncher.launchForLevel(4, 'terminal', 'Terminal');
            }, 500);
        }
    }

    async createAndStartChallengeTracker() {
        try {
            // Challenge tracking is now integrated into the submit-flag terminal command
            console.log('[Level4] Challenge tracking integrated into terminal submit-flag command');
            console.log('[Level4Dialog] Level 4 CTF ready - use terminal commands to interact');
        } catch (error) {
            console.error('[Level4Dialog] Level setup error:', error);
        }
    }

    getFinalButtonText() {
        return 'Start CTF Assessment';
    }

    static shouldAutoStart() {
        const level4Started = localStorage.getItem('cyberquest_level_4_started');
        const level3Completed = localStorage.getItem('cyberquest_level_3_completed');
        return level3Completed && !level4Started;
    }

    static startLevel4Dialogue(desktop) {
        const dialogue = new Level4WhiteHatTestDialogue(desktop);
        dialogue.start();
    }
}
