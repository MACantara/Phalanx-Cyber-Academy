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
                text: "📱 YOUR EVIDENCE (What you'll search through):\n\n💻 Laptop Hard Drive - Contains browser data and personal files\n🧠 Memory Dump - Shows what was running when seized\n🌐 Network Logs - Shows communications and data transfers\n\n⚡ You must investigate ALL 5 evidence pieces before building your report!"
            },
            {
                text: "🔍 HOW IT WORKS (Super Simple):\n\n1️⃣ Evidence Viewer → Investigate ALL 5 pieces of evidence\n2️⃣ Extract clues from each device (laptop, memory, network)\n3️⃣ Forensic Report Builder → Organize your findings\n4️⃣ Submit when you have all identity pieces"
            },
            {
                text: "🎮 STREAMLINED WORKFLOW:\n\n• Evidence Viewer: Investigate all 5 evidence pieces\n• Extract clues from each device thoroughly\n• Forensic Report Builder: Drag clues into report sections\n• Submit Report → WIN!\n\nComplete investigation required before report building!"
            },
            {
                text: "🏆 SUCCESS = Finding These 3 Things:\n\n👤 Real Name: Alex Morrison\n📧 Email: a.morrison@securemail.com\n📞 Phone: +1-555-0142\n\nFind all 3, submit your report, case closed!"
            },
            {
                text: "Ready to be a digital detective and unmask The Null?"
            }
        ];
    }

    async onComplete() {
        localStorage.setItem('cyberquest_level_5_started', 'true');
        localStorage.setItem('cyberquest_level_5_start_time', Date.now());
        
        // Initialize session for Level 5 using the GameProgressManager
        try {
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();
            
            const levelData = await progressManager.startLevel(5, 'Hunt-for-the-Null', 'expert');
            console.log('[Level5] Session started:', levelData);
            
            // Store session ID for later use
            if (levelData.session && levelData.session.id) {
                localStorage.setItem('cyberquest_active_session_id', levelData.session.id.toString());
                sessionStorage.setItem('active_session_id', levelData.session.id.toString());
                window.currentSessionId = levelData.session.id;
            }
        } catch (error) {
            console.warn('[Level5] Failed to start session, will create one on completion:', error);
        }
        
        if (window.applicationLauncher) {
            setTimeout(async () => {
                console.log('Launching Level 5 Digital Detective Mission...');
                
                try {
                    // Launch Evidence Viewer first (primary detective tool)
                    await window.applicationLauncher.launchEvidenceViewer();
                    console.log('Evidence Viewer launched successfully');
                    
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            '🎯 GOAL: Investigate ALL 5 evidence pieces → Extract clues → Build forensic report → Find name, email & phone!',
                            'success',
                            8000
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
                        '🔒 Complete evidence analysis first! Investigate all 5 pieces of evidence in Evidence Viewer.',
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