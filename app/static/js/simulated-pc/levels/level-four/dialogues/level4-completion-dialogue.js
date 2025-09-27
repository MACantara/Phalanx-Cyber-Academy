import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level4CompletionDialogue extends BaseDialogue {
    constructor(desktop, challengeTracker = null, character = 'instructor') {
        super(desktop, character);
        this.challengeTracker = challengeTracker;
        this.completionStats = this.generateCompletionStats();
        this.messages = [
            {
                text: "Outstanding work! You have successfully completed The White Hat Test - discovering all security flags and demonstrating professional-level penetration testing skills."
            },
            {
                text: `Your systematic approach uncovered ${this.completionStats.flagsFound} critical security vulnerabilities across multiple attack vectors including configuration analysis, log investigation, and forensic examination.`
            },
            {
                text: "The methodologies you employed - from environment reconnaissance to database credential discovery - reflect real-world security assessment techniques used by professional penetration testers."
            },
            {
                text: "Your thorough documentation and systematic flag submission process demonstrates adherence to responsible disclosure practices essential in cybersecurity research."
            },
            {
                text: `Assessment completed in ${this.completionStats.duration}, showcasing both technical proficiency and efficient security research methodology.`
            },
            {
                text: "This achievement qualifies you for advanced cybersecurity roles requiring expertise in ethical hacking, vulnerability assessment, and penetration testing."
            },
            {
                text: "You have earned 350 XP in Ethical Hacking and demonstrated mastery of professional security assessment practices."
            },
            {
                text: "Congratulations on completing Level 4: The White Hat Test. You're now ready for even more advanced cybersecurity challenges!"
            }
        ];
    }

    generateCompletionStats() {
        const stats = {
            flagsFound: 7,
            duration: 'approximately 30 minutes',
            categories: ['Environment Analysis', 'Configuration Review', 'Log Investigation', 'Forensic Analysis'],
            xpEarned: 350
        };

        // If we have access to the challenge tracker, get real stats
        if (this.challengeTracker) {
            const progress = this.challengeTracker.getProgress();
            stats.flagsFound = progress.found;
            
            // Calculate rough duration if possible
            const startTime = localStorage.getItem('cyberquest_level_4_start_time');
            if (startTime) {
                const duration = Math.round((Date.now() - parseInt(startTime)) / (1000 * 60));
                stats.duration = `${duration} minutes`;
            }
        }

        return stats;
    }

    onComplete() {
        // Mark level as completed
        localStorage.setItem('cyberquest_level_4_completed', 'true');
        localStorage.setItem('cyberquest_level_4_completion_time', Date.now());
        
        // Show session summary after dialogue
        setTimeout(() => {
            this.showSessionSummary();
        }, 500);
    }

    async showSessionSummary() {
        try {
            // Import and show Level 4 session summary
            const { Level4SessionSummary } = await import('../components/level4-session-summary.js');
            Level4SessionSummary.createAndShow(this.challengeTracker, this.completionStats);
        } catch (error) {
            console.error('[Level4Completion] Failed to load session summary:', error);
            // Fallback to simple navigation
            this.navigateToLevelsOverview();
        }
    }

    navigateToLevelsOverview() {
        // Navigate back to levels overview
        setTimeout(() => {
            window.location.href = '/levels';
        }, 1000);
    }

    getFinalButtonText() {
        return 'View Assessment Summary';
    }

    static shouldAutoStart() {
        return false; // This dialogue should be manually triggered by challenge tracker
    }

    static startLevel4CompletionDialogue(desktop, challengeTracker) {
        const dialogue = new Level4CompletionDialogue(desktop, challengeTracker);
        dialogue.start();
        return dialogue;
    }
}