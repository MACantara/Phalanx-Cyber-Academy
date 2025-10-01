import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class LevelCompletionDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Congratulations, Agent! You've successfully completed Level 1: The Misinformation Maze."
            },
            {
                text: "Your performance in classifying news articles shows real promise in cybersecurity awareness and critical thinking."
            },
            {
                text: "You've demonstrated key skills: identifying suspicious headlines, recognizing questionable sources, and spotting emotional manipulation tactics."
            },
            {
                text: "Through analyzing real and fake news articles, you learned to spot red flags like biased language, missing author credentials, and sensational claims."
            },
            {
                text: "These skills are essential in today's digital landscape where misinformation can influence elections, spread conspiracy theories, and undermine public trust."
            },
            {
                text: "You've earned performance-based XP in Information Literacy. Your XP reward reflects your accuracy in distinguishing real from fake news!"
            },
            {
                text: "Remember: Always verify before you share, cross-reference multiple sources, and question information that seems designed to provoke strong emotions."
            },
            {
                text: "You're now ready for Level 2: Shadow Inbox, where you'll face more sophisticated threats in email security and phishing detection."
            }
        ];
    }

    async onComplete() {
        // Mark level as completed and update progress
        localStorage.setItem('cyberquest_level_1_completed', 'true');
        localStorage.setItem('cyberquest_current_level', '2');
        
        // Note: XP will be awarded through the session completion system based on performance
        // The challenge completion system should handle XP calculation via the API based on score and accuracy
        
        const badges = JSON.parse(localStorage.getItem('cyberquest_badges') || '[]');
        if (!badges.includes('fact-checker')) {
            badges.push('fact-checker');
            localStorage.setItem('cyberquest_badges', JSON.stringify(badges));
        }
        
        // Navigate back to levels overview instead of dashboard
        if (this.desktop?.windowManager) {
            try {
                const browserApp = this.desktop.windowManager.applications.get('browser');
                if (browserApp) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    browserApp.navigation.navigateToUrl('/levels');
                }
            } catch (error) {
                console.error('Failed to navigate to levels overview:', error);
                window.location.href = '/levels';
            }
        } else {
            window.location.href = '/levels';
        }
    }

    getFinalButtonText() {
        return 'View Levels Overview';
    }

    static shouldAutoStart() {
        const levelCompleted = localStorage.getItem('cyberquest_level_1_completed');
        const challenge1Completed = localStorage.getItem('cyberquest_challenge1_completed');
        return challenge1Completed && !levelCompleted;
    }
}
