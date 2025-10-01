import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level5HuntForTheNullDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🕵️ MISSION: A cybercriminal called 'The Null' has been exposed. You have their seized devices. Your job is simple: find out who they really are."
            },
            {
                text: "🎯 ONE CLEAR GOAL: Discover The Null's Real Identity\n\n✅ Real Name: ?\n✅ Email Address: ?\n✅ Phone Number: ?\n\nThat's it. Find these 3 pieces of information and you win."
            },
            {
                text: "📱 YOUR EVIDENCE (What you'll search through):\n\n💻 Laptop Hard Drive - Contains browser data and personal files\n🧠 Memory Dump - Shows what was running when seized\n🌐 Network Logs - Shows communications and data transfers"
            },
            {
                text: "🔍 HOW IT WORKS (Super Simple):\n\n1️⃣ Click Evidence Viewer → Examine each device\n2️⃣ Look for personal information (name, email, phone)\n3️⃣ Copy important clues to Forensic Report\n4️⃣ Submit when you have all 3 identity pieces"
            },
            {
                text: "🎮 SIMPLE WORKFLOW:\n\n• Start → Evidence Viewer (find clues)\n• Copy clues → Forensic Report (organize findings)\n• All 3 identity pieces found → Submit Report → WIN!\n\nNo complex procedures. Just detective work!"
            },
            {
                text: "🏆 SUCCESS = Finding These 3 Things:\n\n👤 Real Name: Alex Morrison\n📧 Email: a.morrison@securemail.com\n📞 Phone: +1-555-0142\n\nFind all 3, submit your report, case closed!"
            },
            {
                text: "Ready to be a digital detective and unmask The Null?"
            }
        ];
    }

    onComplete() {
        localStorage.setItem('cyberquest_level_5_started', 'true');
        localStorage.setItem('cyberquest_level_5_start_time', Date.now());
        
        if (window.applicationLauncher) {
            setTimeout(async () => {
                console.log('Launching Level 5 Digital Detective Mission...');
                
                try {
                    // Launch Evidence Viewer first (primary detective tool)
                    await window.applicationLauncher.launchEvidenceViewer();
                    console.log('Evidence Viewer launched successfully');
                    
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            '🎯 GOAL: Find name, email & phone. Click Evidence Viewer → Select each device → Look for personal info',
                            'success',
                            6000
                        );
                    }
                    
                    // Launch Forensic Report after 2 seconds
                    setTimeout(async () => {
                        await window.applicationLauncher.launchForensicReport();
                        console.log('Forensic Report launched successfully');
                        
                        if (window.toastManager) {
                            window.toastManager.showToast(
                                '📝 Drag identity clues to Forensic Report. Need: Real Name + Email + Phone = WIN!',
                                'info',
                                5000
                            );
                        }
                    }, 2000);
                    
                } catch (error) {
                    console.error('Failed to launch Level 5 applications:', error);
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            'Detective environment loading... Open apps from desktop if needed.',
                            'info'
                        );
                    }
                }
            }, 1000);
        }
    }

    getFinalButtonText() {
        return 'Start Digital Detective Work';
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