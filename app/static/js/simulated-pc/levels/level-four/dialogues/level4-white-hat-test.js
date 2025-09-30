import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level4WhiteHatTestDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🎓 **Professional Certification: Level 4 - The White Hat Test**\n\n**ENGAGEMENT TYPE:** Authorized Penetration Test\n**CLIENT:** TechCorp Industries\n**SCOPE:** Web Application Security Assessment\n**DURATION:** Full-scope evaluation\n**METHODOLOGY:** NIST SP 800-115 & OWASP Testing Guide"
            },
            {
                text: "📜 **Rules of Engagement:**\n\n**AUTHORIZED ACTIVITIES:**\n• Reconnaissance and information gathering\n• Vulnerability scanning and analysis"
            },
            {
                text: "• Configuration review and assessment\n• Log file examination and forensic analysis"
            },
            {
                text: "**STRICTLY PROHIBITED:**\n• Social engineering against real personnel\n• Denial of service attacks\n• Data exfiltration or destruction\n• Unauthorized access to production systems"
            },
            {
                text: "🎯 **Mission Objectives:**\nTechCorp has hired you as an ethical hacker to assess their security posture before a major product launch."
            },
            {
                text: "Your task is to identify 7 security vulnerabilities (represented as flags) across their infrastructure using professional penetration testing methodologies."
            },
            {
                text: "🔍 **Assessment Categories:**\n\n• **Environment Analysis:** System configuration and deployment security\n• **Access Control:** Authentication and authorization mechanisms"
            },
            {
                text: "• **Data Exposure:** Sensitive information in logs and files\n• **Configuration Security:** Server and application hardening\n• **Code Review:** Source code vulnerabilities"
            },
            {
                text: "• **Forensic Analysis:** Historical security incidents\n• **Network Security:** Communication and protocol security"
            },
            {
                text: "🛠️ **Penetration Testing Methodology:**\n\n**Phase 1: Reconnaissance**\n• Gather information about the target system\n• Identify services, versions, and technologies\n• Map the attack surface"
            },
            {
                text: "**Phase 2: Scanning & Enumeration**\n• Identify potential vulnerabilities\n• Enumerate services and configurations\n• Document findings systematically"
            },
            {
                text: "**Phase 3: Vulnerability Assessment**\n• Analyze discovered weaknesses\n• Determine exploitability and impact\n• Prioritize findings by risk level"
            },
            {
                text: "**Phase 4: Documentation**\n• Use the Challenge Tracker to submit flags\n• Document methodology and evidence\n• Prepare findings for client reporting"
            },
            {
                text: "💻 **Professional Tools Available:**\n\n• **Terminal Access:** Command-line interface with security tools\n• **File System Explorer:** Navigate and examine system files"
            },
            {
                text: "• **Log Analyzer:** Review system and application logs\n• **Configuration Inspector:** Analyze server and app configurations\n• **Network Scanner:** Discover services and open ports"
            },
            {
                text: "🏆 **Professional Standards:**\n\n• **Thoroughness:** Systematic examination of all components\n• **Documentation:** Detailed evidence collection for each finding"
            },
            {
                text: "• **Ethics:** Responsible disclosure and minimal impact testing\n• **Methodology:** Follow industry-standard testing procedures"
            },
            {
                text: "📊 **Success Metrics:**\n\n• **Flag Discovery:** Find all 7 security vulnerabilities\n• **Methodology Score:** Demonstrate proper testing techniques"
            },
            {
                text: "• **Documentation Quality:** Clear evidence and explanations\n• **Time Efficiency:** Complete assessment within reasonable timeframe\n• **Certification Goal:** Earn 'Certified Ethical Hacker' badge"
            },
            {
                text: "🎮 **How to Begin:**\nOpen the Terminal to start your security assessment. Use commands like `ls`, `cat`, `grep`, and specialized security tools to explore the TechCorp infrastructure."
            },
            {
                text: "The Challenge Tracker in the top-right will help you submit flags and monitor progress throughout your assessment."
            },
            {
                text: "🚀 **Professional Engagement:**\nThis assessment simulates real-world penetration testing engagements. Your professionalism, methodology, and ethical approach demonstrate readiness for cybersecurity consulting roles."
            },
            {
                text: "**Remember:** Great penetration testers combine technical skills with ethical responsibility and clear communication.\n\nReady to begin your professional security assessment?"
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
            // Import and create challenge tracker
            const { Level4ChallengeTracker } = await import('../apps/challenge-tracker-app.js');
            const tracker = new Level4ChallengeTracker();
            
            // Make tracker globally accessible
            window.level4ChallengeTracker = tracker;
            
            // Create and append tracker element
            const trackerElement = tracker.createElement();
            document.body.appendChild(trackerElement);
            
            // Initialize tracker
            tracker.initialize();
            
            console.log('[Level4Dialog] Challenge tracker started');
        } catch (error) {
            console.error('[Level4Dialog] Failed to create challenge tracker:', error);
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
