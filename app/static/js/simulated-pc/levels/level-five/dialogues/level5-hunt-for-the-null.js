import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level5HuntForTheNullDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to Level 5: The Hunt for The Null. This is your final mission—a comprehensive digital forensics investigation to expose The Null's identity."
            },
            {
                text: "You'll be working with a professional forensic suite featuring six specialized applications: Evidence Locker, Disk Analyzer, Memory Forensics, Network Analyzer, Timeline Constructor, and Report Generator."
            },
            {
                text: "The Evidence Locker is your central hub—it manages chain of custody, tracks evidence integrity, and coordinates analysis across all forensic tools."
            },
            {
                text: "Every piece of evidence has hash verification to ensure its authenticity."
            },
            {
                text: "Use the Disk Analyzer to examine hard drive images, recover deleted files, and analyze filesystem artifacts."
            },
            {
                text: "The Memory Forensics tool reveals running processes, network connections, and hidden malware in RAM dumps."
            },
            {
                text: "The Network Analyzer lets you inspect packet captures, identify suspicious traffic patterns, and trace command-and-control communications."
            },
            {                
                text: "Correlate findings across sources using the Timeline Constructor."
            },
            {
                text: "Finally, document your investigation with the Report Generator."
            },
            {
                text: "It creates legally-compliant forensic reports following NIST SP 800-86 and ISO/IEC 27037:2012 standards, complete with proper evidence citations."
            },
            {
                text: "All forensic applications maintain a shared evidence context, so findings from one tool are automatically available to others."
            },
            {
                text: "Look for correlations between disk artifacts, memory signatures, and network traffic."
            },
            {
                text: "The Null has left traces across multiple evidence sources."
            },
            {
                text: "Your mission is to piece together the attack timeline, identify indicators of compromise, and build an airtight case documenting their activities."
            },
            {
                text: "This investigation follows real-world digital forensics procedures."
            },
            {
                text: "Verify evidence integrity, maintain chain of custody, document your methodology, and ensure all findings are reproducible."
            },
            {
                text: "Successfully completing this forensic investigation and identifying The Null will earn you 500 XP in Digital Forensics."
            },
            {
                text: "Ready to put your investigative skills to the ultimate test?"
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
                    
                    // Show notification to guide user using centralized toast system
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            '🛡️ FORENSIC SYSTEM: Digital forensics investigation initiated. Start by examining evidence in the Evidence Locker.',
                            'success'
                        );
                    }
                    
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
