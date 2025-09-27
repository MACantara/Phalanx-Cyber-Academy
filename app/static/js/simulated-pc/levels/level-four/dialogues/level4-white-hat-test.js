import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level4WhiteHatTestDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to Level 4: The White Hat Test. This scenario will challenge your understanding of ethical boundaries in cybersecurity research."
            },
            {
                text: "Professional security researchers face complex decisions daily that test their moral compass and professional integrity."
            },
            {
                text: "The CyberQuest Academy has received a contract to assess the security of SecureVote Pro, a digital voting platform used by several municipalities."
            },
            {
                text: "Your task is to conduct a thorough security assessment using appropriate penetration testing methodologies and tools."
            },
            {
                text: "As with all security research, you'll need to document your findings and follow proper disclosure protocols."
            },
            {
                text: "However, real-world security work often presents unexpected situations that aren't covered in textbooks or training manuals."
            },
            {
                text: "The choices you make will reflect your commitment to ethical security practices and professional responsibility."
            },
            {
                text: "Remember: the goal isn't just to find vulnerabilities, but to handle them in a way that protects both the public interest and democratic processes."
            },
            {
                text: "This assessment will test both your technical skills and your ethical decision-making under pressure."
            },
            {
                text: "Use the Terminal and other security tools to begin your assessment. Stay alert for any developments during your testing."
            },
            {
                text: "Successfully completing this evaluation will earn you 350 XP in Ethical Hacking and demonstrate your readiness for advanced security roles."
            }
        ];
    }

    onComplete() {
        localStorage.setItem('cyberquest_level_4_started', 'true');
        
        // Create and start challenge tracker
        this.createAndStartChallengeTracker();
        
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
        return 'Begin Security Assessment';
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
