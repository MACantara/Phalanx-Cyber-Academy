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
                    
                    // Set up forensic event listener for app opening
                    this.setupForensicEventListener();
                    
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

    setupForensicEventListener() {
        // Listen for forensic events to handle app opening
        document.addEventListener('forensic-event', (e) => {
            const { eventType, details } = e.detail;
            
            if (eventType === 'open_app' && details.appId === 'forensic-report') {
                this.openForensicReportApp();
            }
        });
        
        console.log('[Level5] Forensic event listener set up for app opening');
    }

    async openForensicReportApp() {
        try {
            // Check if evidence analysis is complete
            const analysisComplete = localStorage.getItem('level5_evidence_analysis_complete');
            
            if (analysisComplete === 'true') {
                console.log('[Level5] Opening Forensic Report - evidence analysis complete');
                await window.applicationLauncher.launchForensicReport();
                
                if (window.toastManager) {
                    window.toastManager.showToast(
                        '📝 Report Builder opened! Drag evidence into sections to reveal the identity.',
                        'info',
                        5000
                    );
                }
            } else {
                console.log('[Level5] Forensic Report blocked - evidence analysis not complete');
                if (window.toastManager) {
                    window.toastManager.showToast(
                        '🔒 Complete evidence analysis first! Extract 3+ identity clues from Evidence Viewer.',
                        'warning',
                        5000
                    );
                }
            }
        } catch (error) {
            console.error('[Level5] Failed to open forensic report:', error);
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