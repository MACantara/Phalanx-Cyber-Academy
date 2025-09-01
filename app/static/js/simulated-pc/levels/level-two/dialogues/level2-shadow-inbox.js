import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level2ShadowInboxDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to Level 2: Shadow in the Inbox. In this level, you'll be learning how to spot phishing attempts and practice safe email protocols."
            },
            {
                text: "Phishing is one of the most common cyber threats today. Attackers try to trick you into revealing sensitive information through seemingly legitimate emails."
            },
            {
                text: "You'll be presented with a series of emails. Some are legitimate, while others are phishing attempts. Your job is to identify which is which."
            },
            {
                text: "Look for telltale signs like suspicious sender addresses, urgent language, unexpected attachments, and requests for sensitive information."
            },
            {
                text: "Successfully completing this level will earn you 150 XP in the Email Security category. Ready to test your phishing detection skills?"
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
