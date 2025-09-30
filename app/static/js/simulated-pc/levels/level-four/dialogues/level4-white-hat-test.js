import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level4WhiteHatTestDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🎓 Professional Certification: Level 4 - The White Hat Test\nENGAGEMENT TYPE: Authorized Penetration Test\nCLIENT: TechCorp Industries\nSCOPE: Web Application Security Assessment\nDURATION: Full-scope evaluation\nMETHODOLOGY: NIST SP 800-115 & OWASP Testing Guide"
            },
            {
                text: "📜 Rules of Engagement:\nAUTHORIZED ACTIVITIES:\n• Reconnaissance and information gathering\n• Vulnerability scanning and analysis"
            },
            {
                text: "• Configuration review and assessment\n• Log file examination and forensic analysis"
            },
            {
                text: "STRICTLY PROHIBITED:\n• Social engineering against real personnel\n• Denial of service attacks\n• Data exfiltration or destruction\n• Unauthorized access to production systems"
            },
            {
                text: "🎯 Mission Objectives:\nTechCorp has hired you as an ethical hacker to assess their security posture before a major product launch."
            },
            {
                text: "Your task is to identify 7 security vulnerabilities (represented as flags) across their infrastructure using professional penetration testing methodologies."
            },
            {
                text: "🔍 Assessment Categories:\n• Environment Analysis: System configuration and deployment security\n• Access Control: Authentication and authorization mechanisms"
            },
            {
                text: "• Data Exposure: Sensitive information in logs and files\n• Configuration Security: Server and application hardening\n• Code Review: Source code vulnerabilities"
            },
            {
                text: "• Forensic Analysis: Historical security incidents\n• Network Security: Communication and protocol security"
            },
            {
                text: "🔐 Core Ethical Hacking Principles:\n• Password Security: Understanding brute-force attack resistance\n• Social Engineering Awareness: Recognizing manipulation tactics",
                example: "Strong Password Example:\nWeak: password123, ilovepizza\nStrong: q2W#r7&zLp0 (12+ chars, mixed case, symbols)"
            },
            {
                text: "• Anomaly Detection: Identifying suspicious patterns\n• Incident Response: Proper breach containment procedures\n• Digital Hygiene: Maintaining secure practices",
                example: "Suspicious Activity Indicators:\n- Login attempts at unusual hours (3 AM)\n- Multiple failed logins from foreign IPs\n- Unexpected privilege escalation attempts"
            },
            {
                text: "🛡️ Attack Vector Analysis:\n• Denial-of-Service (DoS): Service disruption techniques\n• Malware Detection: File analysis and threat identification\n• Multi-Factor Authentication: Enhanced access controls",
                example: "DoS Attack Goal:\nOverwhelm services to make them unavailable\nNOT: Steal credentials or gain system access"
            },
            {
                text: "🛠️ CTF Challenge Approach:\nThis is a Capture The Flag (CTF) security challenge. Your goal is to find 7 hidden flags using terminal commands and system exploration.",
                example: "Example commands to get started:\nls -la (list files)\ncat filename.txt (read files)\ngrep -r \"flag\" . (search for flags)"
            },
            {
                text: "💻 Essential CTF Commands:\nMaster these terminal commands to find the hidden flags:",
                example: "File Operations:\nls, cat, head, tail, grep\nfind / -name \"*.txt\" 2>/dev/null\nstrings binary_file | grep flag"
            },
            {
                text: "Advanced techniques for finding flags in logs, configurations, and hidden files:",
                example: "Log Analysis:\ngrep -i \"flag\\|password\\|key\" /var/log/*\nSystem Info:\nps aux, netstat -tulpn, env"
            },
            {
                text: "🏆 CTF Success Tips:\n• Be Systematic: Check common flag locations first\n• Read Everything: Flags can be hidden in comments or unusual places",
                example: "Common Flag Locations:\n/home/user/flag.txt\n/etc/passwd comments\nEnvironment variables (env command)"
            },
            {
                text: "📊 Success Metrics:\n• Flag Discovery: Find all 7 security vulnerabilities\n• Methodology Score: Demonstrate proper testing techniques"
            },
            {
                text: "• Documentation Quality: Clear evidence and explanations\n• Time Efficiency: Complete assessment within reasonable timeframe\n• Certification Goal: Earn 'Certified Ethical Hacker' badge"
            },
            {
                text: "🎮 How to Begin:\nOpen the Terminal and start exploring! Use the Challenge Tracker in the top-right to submit flags as you find them.",
                example: "First commands to try:\nls -la\ncat /etc/passwd\ngrep -r \"CyberQuest\" .\nfind / -name \"*flag*\" 2>/dev/null"
            },
            {
                text: "🚀 Professional Engagement:\nThis assessment simulates real-world penetration testing engagements. Your professionalism, methodology, and ethical approach demonstrate readiness for cybersecurity consulting roles."
            },
            {
                text: "Remember: Great penetration testers combine technical skills with ethical responsibility and clear communication.\nReady to begin your professional security assessment?"
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
