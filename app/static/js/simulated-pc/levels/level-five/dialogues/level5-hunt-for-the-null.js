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
        
        // Launch the Evidence Locker as the starting point for Level 5 forensics
        if (window.applicationLauncher) {
            setTimeout(async () => {
                console.log('Launching Level 5 Digital Forensics Environment...');
                
                try {
                    // Launch the Evidence Locker app first - this is the central hub for forensic analysis
                    await window.applicationLauncher.launchEvidenceLocker();
                    console.log('Evidence Locker launched successfully');
                    
                    // Show notification to guide user
                    this.showForensicNotification(
                        'Digital forensics investigation initiated. Start by examining evidence in the Evidence Locker.',
                        'success'
                    );
                    
                    // Optional: Launch additional forensic workflow after Evidence Locker is ready
                    setTimeout(() => {
                        if (window.applicationLauncher && window.applicationLauncher.launchForensicWorkflow) {
                            window.applicationLauncher.launchForensicWorkflow();
                        }
                    }, 2000);
                    
                } catch (error) {
                    console.error('Failed to launch Level 5 forensic applications:', error);
                }
                
            }, 1000);
        }
    }

    showForensicNotification(message, type = 'info') {
        // Create forensic-themed notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded z-50 ${
            type === 'success' ? 'bg-green-600' :
            type === 'warning' ? 'bg-yellow-600' :
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white shadow-lg border border-gray-300`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="bi bi-shield-check text-lg"></i>
                <span class="font-semibold">FORENSIC SYSTEM:</span>
            </div>
            <div class="mt-1 text-sm">${message}</div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
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
