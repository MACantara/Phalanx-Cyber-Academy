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
                text: "💻 Terminal Command Mastery Series:\nLet's learn the essential commands for ethical hacking and CTF challenges. Each command has specific use cases in security assessment."
            },
            {
                text: "📂 FILE & DIRECTORY COMMANDS:\n• ls - List directory contents\n• ls -la - Show hidden files with detailed permissions",
                example: "Basic File Listing:\nls                    # Current directory\nls -la               # Hidden files + permissions\nls -la /home/        # List all user directories\nls -la ~/.           # Show hidden config files"
            },
            {
                text: "• cat - Display file contents\n• head/tail - Show beginning/end of files",
                example: "Reading Files:\ncat /etc/passwd      # View system users\ncat ~/.bashrc        # Check shell config\nhead -20 /var/log/auth.log  # First 20 lines\ntail -50 /var/log/syslog    # Last 50 lines"
            },
            {
                text: "🔍 SEARCH & PATTERN MATCHING:\n• grep - Search for text patterns in files\n• find - Locate files and directories",
                example: "Text Search:\ngrep -r \"WHT{\" /        # Find flags recursively\ngrep -i \"password\" /etc/*  # Case-insensitive search\ngrep \"admin\" /var/log/*    # Search logs for admin"
            },
            {
                text: "• find - Advanced file discovery\n• which/whereis - Locate executables",
                example: "File Discovery:\nfind / -name \"*.conf\" 2>/dev/null  # All config files\nfind /home -name \".*\" -type f      # Hidden files\nfind /usr -perm -4000              # SUID binaries\nfind /var/log -mtime -1            # Recent log files"
            },
            {
                text: "🌐 SYSTEM INFORMATION:\n• ps - Process information\n• env - Environment variables\n• whoami/id - User identity",
                example: "System Analysis:\nps aux               # All running processes\nenv                  # Environment variables\nwhoami               # Current user\nid                   # User ID and groups\nuname -a             # System information"
            },
            {
                text: "🔧 FILE PERMISSIONS & ATTRIBUTES:\n• chmod - Change permissions\n• chown - Change ownership\n• file - Determine file type",
                example: "File Analysis:\nls -la /etc/passwd   # Check file permissions\nfile suspicious.exe  # Identify file type\nstrings binary_file  # Extract readable text\nstat /etc/shadow     # Detailed file info"
            },
            {
                text: "📊 NETWORK & PROCESS ANALYSIS:\n• netstat - Network connections\n• ss - Socket statistics\n• lsof - List open files",
                example: "Network Reconnaissance:\nnetstat -tuln        # Listening ports\nss -tuln             # Modern socket info\nlsof -i              # Files using network\nps aux | grep nginx  # Find web server process"
            },
            {
                text: "🔐 SECURITY-FOCUSED COMMANDS:\n• sudo - Execute as another user\n• crontab - View scheduled tasks\n• history - Command history",
                example: "Security Analysis:\nsudo -l              # Check sudo permissions\ncrontab -l           # Current user's cron jobs\ncat /etc/crontab     # System-wide cron jobs\nhistory              # Command history\ncat ~/.bash_history  # Persistent history"
            },
            {
                text: "📝 LOG & CONFIGURATION ANALYSIS:\n• journalctl - System logs (systemd)\n• dmesg - Kernel messages\n• systemctl - Service management",
                example: "System Logs:\njournalctl -f        # Follow live logs\ndmesg | tail         # Recent kernel messages\nsystemctl status nginx     # Service status\nsystemctl list-unit-files  # All services"
            },
            {
                text: "🎯 CTF-SPECIFIC TECHNIQUES:\n• strings - Extract text from binaries\n• base64 - Decode encoded data\n• xxd - Hex dump analyzer",
                example: "CTF Flag Hunting:\nstrings /usr/bin/app | grep WHT    # Extract flags\nbase64 -d encoded.txt              # Decode base64\nxxd binary_file | grep \"flag\"      # Hex analysis\ncat /proc/*/environ | grep WHT     # Process environment"
            },
            {
                text: "🔄 COMMAND COMBINATIONS:\nCombine commands with pipes (|) and operators for powerful analysis:",
                example: "Advanced Techniques:\nps aux | grep -v \"root\" | head -10    # Non-root processes\nfind /var/log -name \"*.log\" | xargs grep \"error\"\ncat /etc/passwd | cut -d: -f1,3 | sort\nhistory | grep \"sudo\" | tail -5      # Recent sudo usage"
            },
            {
                text: "⚠️ COMMON CTF LOCATIONS:\nFlags are often hidden in these standard locations:",
                example: "Flag Discovery Checklist:\n/home/*/.*           # Hidden user files\n/etc/*.conf          # Configuration files\n/var/log/*           # System & app logs\n/tmp/*               # Temporary files\n/proc/*/environ      # Process environments\n/usr/local/bin/*     # Custom scripts"
            },
            {
                text: "🏆 CTF SUCCESS METHODOLOGY:\n• Start with Reconnaissance: env, ls -la ~/, cat /etc/passwd\n• Check Configuration Files: /etc/*, ~/.bashrc, ~/.profile",
                example: "Systematic Approach:\n1. env                    # Check environment\n2. ls -la ~/              # User home directory\n3. find /etc -name \"*.conf\"  # All config files\n4. cat /var/log/*/access.log  # Web server logs"
            },
            {
                text: "• Analyze Logs Thoroughly: /var/log/*, /tmp/*, process memory\n• SUID Binary Analysis: find /usr -perm -4000",
                example: "Deep Analysis Commands:\nfind /home -name \".*\" | xargs cat 2>/dev/null\ngrep -r \"WHT{\" /var/log/ 2>/dev/null\ncat /proc/*/environ | strings | grep -i flag\nfind / -name \"*backup*\" -o -name \"*config*\" 2>/dev/null"
            },
            {
                text: "📊 Success Metrics:\n• Flag Discovery: Find all 7 security vulnerabilities\n• Methodology Score: Demonstrate proper testing techniques"
            },
            {
                text: "• Documentation Quality: Clear evidence and explanations\n• Time Efficiency: Complete assessment within reasonable timeframe\n• Certification Goal: Earn 'Certified Ethical Hacker' badge"
            },
            {
                text: "🎮 START YOUR ASSESSMENT:\nOpen Terminal and begin with systematic reconnaissance. Use 'submit-flag --help' to see submission options.",
                example: "Essential Starting Commands:\n# Basic system info\nwhoami && pwd && ls -la\n\n# Check environment\nenv | grep -i wht\n\n# Find config files\nfind /etc -name \"*.conf\" 2>/dev/null | head -10\n\n# Check user directories\nls -la /home/*/\n\n# Submit flags when found\nsubmit-flag WHT{your_discovered_flag}"
            },
            {
                text: "📋 CHALLENGE SUBMISSION:\nUse the integrated submit-flag terminal command for all flag submissions:",
                example: "Submit-Flag Command Usage:\nsubmit-flag WHT{flag_value}     # Submit a flag\nsubmit-flag --progress          # Check progress\nsubmit-flag --challenges        # List challenges\nsubmit-flag --status           # Session status\nsubmit-flag --help             # Show all options"
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
