import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level5HuntForTheNullDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to Level 5: The Hunt for The Null. This is your final mission - use advanced digital forensics to expose The Null's identity."
            },
            {
                text: "As a master cybersecurity analyst, you'll need to combine all your skills to track down the elusive hacker known only as 'The Null'."
            },
            {
                text: "You'll be analyzing logs, decrypting files, and following digital breadcrumbs across multiple systems to piece together The Null's identity."
            },
            {
                text: "This will test everything you've learned. Look for patterns, think critically, and don't overlook any detail, no matter how small it may seem."
            },
            {
                text: "Successfully completing this final challenge will earn you 500 XP in the Digital Forensics category. Are you ready to catch The Null?"
            }
        ];
    }

    onComplete() {
        localStorage.setItem('cyberquest_level_5_started', 'true');
        
        // Initialize evidence tracker for Level 5
        if (typeof initializeEvidenceTracker === 'function') {
            import('../../level5/evidence-tracker.js').then(module => {
                window.evidenceTracker = module.initializeEvidenceTracker();
                if (window.evidenceTracker) {
                    window.evidenceTracker.showTracker();
                }
            });
        }
        
        // Open multiple applications for digital forensics
        if (window.applicationLauncher) {
            setTimeout(async () => {
                // Launch multiple apps for comprehensive forensics analysis
                const apps = ['files', 'logs', 'terminal'];
                await window.applicationLauncher.launchMultiple(apps);
                console.log('Digital forensics tools opened for Level 5: Hunt for The Null');
                
                // Start forensics guidance through dialogue system instead
                setTimeout(() => {
                    // Trigger interactive forensics guidance dialogue
                    if (this.desktop && this.desktop.dialogueManager) {
                        this.desktop.dialogueManager.triggerDialogue('level5-forensics-guidance', 'instructor');
                    }
                }, 1500);
            }, 500);
        }
    }

    getFinalButtonText() {
        return 'Start Final Mission';
    }

    static shouldAutoStart(levelId) {
        const currentLevel = localStorage.getItem('cyberquest_current_level');
        const levelStarted = localStorage.getItem(`cyberquest_level_${levelId}_started`);
        return currentLevel === '5' && !levelStarted;
    }

    static markLevelStarted(levelId) {
        localStorage.setItem(`cyberquest_level_${levelId}_started`, 'true');
    }

    static isCompleted() {
        return localStorage.getItem('cyberquest_level_5_completed') === 'true';
    }
}
