import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level5HuntForTheNullDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "Welcome to your final challenge. A cybercriminal known as 'The Null' has been conducting sophisticated attacks worldwide. Your mission: identify their real identity through digital forensics."
            },
            {
                text: "🎯 YOUR CLEAR OBJECTIVES:\n\n1️⃣ Maintain Chain of Custody - Ensure evidence integrity\n2️⃣ Analyze Evidence - Find identity clues in digital artifacts\n3️⃣ Extract Identity Information - Real name, email, phone\n4️⃣ Build Complete Report - Document findings for prosecution"
            },
            {
                text: "🛠️ YOUR FORENSIC TOOLKIT (3 Simple Apps):\n\n📁 Evidence Viewer - Examine digital artifacts step-by-step\n📊 Investigation Hub - Track your progress and objectives\n📋 Forensic Report - Build your final case documentation"
            },
            {
                text: "🎯 CLEAR SUCCESS PATH:\n\nStep 1: Start with Evidence Viewer to examine artifacts\nStep 2: Use Investigation Hub to track your progress\nStep 3: Compile findings in Forensic Report\nStep 4: Submit report when identity is confirmed",
                example: "Workflow: Evidence Viewer → Investigation Hub → Forensic Report → Submit"
            },
            {
                text: "🔬 FORENSIC STANDARDS (You'll be guided):\n\n✅ NIST SP 800-86 - Digital investigation procedures\n✅ ISO/IEC 27037:2012 - Evidence handling guidelines\n\nDon't worry - the apps will guide you through proper procedures!"
            },
            {
                text: "🏆 WHAT SUCCESS LOOKS LIKE:\n\n• Find The Null's real name: Alex Morrison\n• Extract email: a.morrison@securemail.com\n• Discover phone: +1-555-0142\n• Build complete forensic report\n• Earn 'Digital Detective' certification"
            },
            {
                text: "🚀 GETTING STARTED:\n\nWhen this briefing ends, three forensic apps will launch automatically. Start with the Evidence Viewer app - it will guide you through examining digital artifacts step by step."
            },
            {
                text: "Ready to solve your first major digital forensics case?"
            }
        ];
    }

    onComplete() {
        localStorage.setItem('cyberquest_level_5_started', 'true');
        // Store the start time for performance tracking
        localStorage.setItem('cyberquest_level_5_start_time', Date.now());
        
        // Launch the streamlined forensic apps
        if (window.applicationLauncher) {
            setTimeout(async () => {
                console.log('Launching Level 5 Streamlined Digital Forensics...');
                
                try {
                    // Launch Evidence Viewer first (primary analysis tool)
                    await window.applicationLauncher.launchEvidenceViewer();
                    console.log('Evidence Viewer launched successfully');
                    
                    // Show initial guidance
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            '🔍 START HERE: Use Evidence Viewer to analyze digital artifacts and extract identity clues',
                            'success',
                            4000
                        );
                    }
                    
                    // Launch Investigation Hub after 2 seconds
                    setTimeout(async () => {
                        await window.applicationLauncher.launchInvestigationHub();
                        console.log('Investigation Hub launched successfully');
                        
                        if (window.toastManager) {
                            window.toastManager.showToast(
                                '📊 Investigation Hub opened - Track your forensic progress here',
                                'info',
                                3000
                            );
                        }
                    }, 2000);
                    
                    // Launch Forensic Report after 4 seconds
                    setTimeout(async () => {
                        await window.applicationLauncher.launchForensicReport();
                        console.log('Forensic Report launched successfully');
                        
                        if (window.toastManager) {
                            window.toastManager.showToast(
                                '� Forensic Report ready - Add evidence here when you find clues',
                                'info',
                                3000
                            );
                        }
                    }, 4000);
                    
                } catch (error) {
                    console.error('Failed to launch Level 5 forensic applications:', error);
                    // Fallback notification
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            'Forensic environment loading... Open apps from desktop if needed.',
                            'info'
                        );
                    }
                }
                
            }, 1000);
        }
    }

    getFinalButtonText() {
        return 'Launch Forensic Investigation';
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
