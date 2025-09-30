import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level2ShadowInboxDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to your second cybersecurity challenge! As a SOC analyst, you'll analyze 10 emails to identify phishing attempts and protect our organization from cyber threats."
            },
            {
                text: "📊 Threat Intelligence:\nPhishing attacks account for 90% of successful data breaches. You'll evaluate 5 legitimate business emails and 5 sophisticated phishing attempts using real-world attack patterns."
            },
            {
                text: "📧 Email Analysis Challenge:\n• 5 Legitimate Emails: Real business communications from trusted sources\n• 5 Phishing Emails: Malicious attempts designed to steal credentials or deploy malware"
            },
            {
                text: "🎯 Your Mission:\nCarefully examine each of the 10 emails to distinguish between authentic business communications and cleverly crafted phishing attempts."
            },
            {
                text: "Your accuracy directly impacts organizational security. Each correct identification strengthens our defense against cybercriminals targeting our data and systems."
            },
            {
                text: "🔍 Email Analysis Framework:\nSender Verification: Check email addresses for subtle misspellings or suspicious domains that impersonate legitimate organizations.",
                example: "Legitimate: 'support@paypal.com'\nSuspicious: 'support@paypaI.com' (with uppercase I instead of l)"
            },
            {
                text: "Content Analysis: Look for urgent language, grammar errors, and pressure tactics designed to make you act without thinking carefully.",
                example: "Pressure tactics: 'Act now or lose access!', 'Urgent: Verify within 24 hours!'\nProfessional: 'Please update your information at your convenience'"
            },
            {
                text: "Link Inspection: Hover over (don't click!) suspicious links to see real destinations. Malicious links often hide behind legitimate-looking text.",
                example: "Displayed: 'www.amazon.com/account'\nActual URL: 'www.amaz0n-security.tk/phishing'"
            },
            {
                text: "Attachment Safety: Be wary of unexpected files, especially .exe, .zip, or macro-enabled documents that could contain malware.",
                example: "Safe: 'Invoice_March2024.pdf' (from known vendor)\nDangerous: 'URGENT_Payment_Details.exe', 'Invoice.doc' with macros"
            },
            {
                text: "⚠️ Red Flags Checklist:\n• Generic greetings ('Dear Customer') instead of your name\n• Urgent threats ('Account will be closed in 24 hours!')",
                example: "Suspicious: 'Dear Valued Customer, Your account will be suspended!'\nLegitimate: 'Hello John Smith, This is a reminder about your subscription'"
            },
            {
                text: "• Requests for passwords, SSN, or financial information\n• Suspicious sender addresses or reply-to mismatches\n• Poor grammar, spelling, or formatting inconsistencies",
                example: "Never legitimate: 'Please confirm your password and SSN for security'\nAlways suspicious: 'We has detected suspicious activity in you're account'"
            },
            {
                text: "🛡️ Response Protocols:\nSAFE: Mark legitimate emails to allow delivery\nPHISHING: Quarantine suspicious emails immediately"
            },
            {
                text: "REPORT: Document phishing attempts for threat intelligence\nCritical Rule: Never click suspicious links or download unexpected attachments"
            },
            {
                text: "💡 Advanced Detection Tips:\n• Check email headers for routing anomalies\n• Verify requests through alternative communication channels"
            },
            {
                text: "• Be extra cautious with financial or HR-related requests\n• When in doubt, always choose security over convenience"
            },
            {
                text: "🏆 Scoring System:\nBase XP Award: 100 XP for completing Level 2\nAccuracy Multiplier: Up to 2x bonus for perfect email classification (100%)"
            },
            {
                text: "Speed Bonus: Additional XP for efficient threat detection\nMaximum Possible: ~200 XP for perfect performance\nEarn the 'Phishing Hunter' badge for 100% accuracy!"
            },
            {
                text: "🎮 How to Play:\nOpen the Email Client and analyze all 10 emails systematically. Each email contains clues about its authenticity - examine sender details, content, and formatting carefully."
            },
            {
                text: "Use 'SAFE' for legitimate business emails or 'PHISHING' for malicious attempts. You'll receive immediate feedback and automatically progress through all 10 emails."
            },
            {
                text: "🚀 Ready for Action?\nYou'll analyze 10 carefully selected emails representing real-world scenarios. Master the skills to identify both obvious and sophisticated phishing attempts."
            },
            {
                text: "Your ability to distinguish between the 5 legitimate and 5 phishing emails protects our entire organization from cyber threats. Ready to secure the inbox?"
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
