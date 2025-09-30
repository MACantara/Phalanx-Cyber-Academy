import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level2ShadowInboxDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🚨 **SECURITY ALERT: Level 2 - Shadow in the Inbox**\n\nUrgent! Our organization has been targeted by a sophisticated phishing campaign. As the Security Operations Center analyst on duty, you must identify and quarantine malicious emails before they compromise our systems."
            },
            {
                text: "📊 **Threat Intelligence:**\nRecent attacks show a 300% increase in spear-phishing attempts targeting our industry. Attackers are using advanced social engineering tactics to breach corporate defenses."
            },
            {
                text: "**Current Attack Vectors:**\n• CEO impersonation emails\n• Fake vendor invoices\n• Credential harvesting schemes\n• Malware-laden attachments"
            },
            {
                text: "🎯 **Your Mission:**\nAnalyze incoming emails in the corporate inbox and determine which are legitimate business communications versus sophisticated phishing attempts."
            },
            {
                text: "One wrong decision could lead to a data breach costing millions. The stakes are high, and you are our last line of defense against these cyber threats."
            },
            {
                text: "🔍 **Email Analysis Framework:**\n\n**Sender Verification:** Check email addresses for subtle misspellings or suspicious domains that impersonate legitimate organizations.",
                example: "Legitimate: 'support@paypal.com'\nSuspicious: 'support@paypaI.com' (with uppercase I instead of l)"
            },
            {
                text: "**Content Analysis:** Look for urgent language, grammar errors, and pressure tactics designed to make you act without thinking carefully.",
                example: "Pressure tactics: 'Act now or lose access!', 'Urgent: Verify within 24 hours!'\nProfessional: 'Please update your information at your convenience'"
            },
            {
                text: "**Link Inspection:** Hover over (don't click!) suspicious links to see real destinations. Malicious links often hide behind legitimate-looking text.",
                example: "Displayed: 'www.amazon.com/account'\nActual URL: 'www.amaz0n-security.tk/phishing'"
            },
            {
                text: "**Attachment Safety:** Be wary of unexpected files, especially .exe, .zip, or macro-enabled documents that could contain malware.",
                example: "Safe: 'Invoice_March2024.pdf' (from known vendor)\nDangerous: 'URGENT_Payment_Details.exe', 'Invoice.doc' with macros"
            },
            {
                text: "⚠️ **Red Flags Checklist:**\n\n• Generic greetings ('Dear Customer') instead of your name\n• Urgent threats ('Account will be closed in 24 hours!')",
                example: "Suspicious: 'Dear Valued Customer, Your account will be suspended!'\nLegitimate: 'Hello John Smith, This is a reminder about your subscription'"
            },
            {
                text: "• Requests for passwords, SSN, or financial information\n• Suspicious sender addresses or reply-to mismatches\n• Poor grammar, spelling, or formatting inconsistencies",
                example: "Never legitimate: 'Please confirm your password and SSN for security'\nAlways suspicious: 'We has detected suspicious activity in you're account'"
            },
            {
                text: "🛡️ **Response Protocols:**\n\n**SAFE:** Mark legitimate emails to allow delivery\n**PHISHING:** Quarantine suspicious emails immediately"
            },
            {
                text: "**REPORT:** Document phishing attempts for threat intelligence\n**Critical Rule:** Never click suspicious links or download unexpected attachments"
            },
            {
                text: "💡 **Advanced Detection Tips:**\n\n• Check email headers for routing anomalies\n• Verify requests through alternative communication channels"
            },
            {
                text: "• Be extra cautious with financial or HR-related requests\n• When in doubt, always choose security over convenience"
            },
            {
                text: "🏆 **Performance Metrics:**\n\n**Accuracy Rate:** Correctly identify email types\n**Response Time:** Quick decisions prevent damage"
            },
            {
                text: "**False Positives:** Minimize blocking legitimate business emails\n**Threat Detection:** Earn bonus XP for catching advanced attacks"
            },
            {
                text: "🎮 **How to Play:**\nOpen the Email Client and examine each message carefully. Read the sender information, subject line, and content thoroughly."
            },
            {
                text: "Use the 'SAFE' or 'PHISHING' buttons to classify each email based on your analysis. Remember - you're protecting the entire organization!"
            },
            {
                text: "🚀 **Mission Critical:**\nPhishing attacks are responsible for 90% of data breaches. Your expertise in email security directly protects our organization's data, reputation, and financial assets."
            },
            {
                text: "Every email you analyze correctly makes us more secure. The entire team is counting on your vigilance and expertise.\n\nReady to defend the inbox?"
            }
        ];
    }

    onComplete() {
        // Store completion in localStorage
        localStorage.setItem('cyberquest_level_2_started', 'true');
        
        // Set fresh start flag for email app
        localStorage.setItem('cyberquest_level_2_fresh_start', 'true');
        
        // Start new session (don't clear previous data - keep for analytics)
        this.startNewSession();
        
        // Open the email application using application launcher
        if (window.applicationLauncher) {
            setTimeout(async () => {
                await window.applicationLauncher.launchForLevel(2, 'email', 'Email Client');
            }, 500);
        }
    }

    async startNewSession() {
        try {
            // Start a new session without clearing previous attempts
            const response = await fetch('/levels/api/level/2/new-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (response.ok) {
                console.log('New Level 2 session started (previous data preserved)');
            } else {
                console.warn('Failed to start new Level 2 session');
            }
        } catch (error) {
            console.warn('Failed to start new Level 2 session:', error);
        }
    }

    getFinalButtonText() {
        return 'Start Simulation';
    }

    // Static methods
    static shouldAutoStart(levelId) {
        // Check if this is the current level and it hasn't been started yet
        const currentLevel = localStorage.getItem('cyberquest_current_level');
        const levelStarted = localStorage.getItem(`cyberquest_level_${levelId}_started`);
        return currentLevel === '2' && !levelStarted;
    }

    static markLevelStarted(levelId) {
        localStorage.setItem(`cyberquest_level_${levelId}_started`, 'true');
    }

    static markLevelCompleted(levelId) {
        localStorage.setItem(`cyberquest_level_${levelId}_completed`, 'true');
    }
}
