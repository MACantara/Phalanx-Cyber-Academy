import { BaseDialogue } from '../../../dialogues/base-dialogue.js';

export class Level5HuntForTheNullDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🔍 CASE FILE: Level 5 - The Hunt for The Null\n\nCASE NUMBER: FOR-2024-0812\nCLASSIFICATION: Top Secret\nLEAD INVESTIGATOR: [Your Name]\nINCIDENT TYPE: Advanced Persistent Threat (APT)\nOBJECTIVE: Identify and prosecute 'The Null' - mastermind behind global cybercrimes"
            },
            {
                text: "📋 Case Background:\nFor months, a sophisticated cybercriminal known only as 'The Null' has orchestrated attacks against critical infrastructure, financial institutions, and government agencies worldwide. Previous attempts to identify this adversary have failed. You are our last hope."
            },
            {
                text: "🎯 Investigation Mandate:\nUsing advanced digital forensics techniques, analyze seized evidence from The Null's compromised systems to:\n• Establish their true identity\n• Document attack methodologies\n• Build prosecutable evidence chain\n• Prevent future attacks by understanding their infrastructure"
            },
            {
                text: "🛠️ Forensic Suite Overview:\n\nEvidence Locker - Your command center\n• Manages chain of custody for all evidence\n• Tracks evidence integrity with cryptographic hashes\n• Coordinates analysis across all forensic tools\n• Maintains audit trail per ISO/IEC 27037:2012 standards",
                example: "Evidence Files:\nDISK_001.img (Hard drive image)\nMEMORY_001.dmp (RAM dump)\nNETWORK_001.pcap (Network traffic)"
            },
            {
                text: "Disk Analyzer - Hard drive forensics\n• Examine disk images from seized computers\n• Recover deleted files and hidden partitions\n• Analyze filesystem artifacts and metadata\n• Extract browser history, downloads, and user activity",
                example: "Findings: Deleted chat logs, browser bookmarks to suspicious sites\nArtifacts: Recently accessed files, USB device history"
            },
            {
                text: "Memory Forensics - RAM analysis\n• Analyze memory dumps from running systems\n• Identify active processes and network connections\n• Detect memory-resident malware and rootkits\n• Extract encryption keys and volatile data",
                example: "Discoveries: Hidden processes, network connections to 192.168.1.100:443\nKeys: SSH private keys, encrypted passwords in memory"
            },
            {
                text: "Network Analyzer - Traffic investigation\n• Inspect captured network packets\n• Identify command-and-control communications\n• Trace data exfiltration patterns\n• Reconstruct network conversations and protocols",
                example: "Suspicious Traffic: Encrypted data to tor-exit-node.onion\nC2 Commands: Base64 encoded messages every 30 seconds"
            },
            {
                text: "Timeline Constructor - Event correlation\n• Correlate findings across all evidence sources\n• Build comprehensive attack timeline\n• Identify patterns and relationships between events\n• Visualize the complete attack sequence",
                example: "Timeline: 2024-01-15 14:30 - First malware execution\n2024-01-15 14:45 - Network connection established\n2024-01-15 15:00 - Data exfiltration began"
            },
            {
                text: "Report Generator - Legal documentation\n• Create court-admissible forensic reports\n• Follow NIST SP 800-86 forensic guidelines\n• Include proper evidence citations and methodology\n• Generate executive summaries for law enforcement"
            },
            {
                text: "🔬 Forensic Methodology:\n\nPhase 1: Evidence Acquisition\n• Verify evidence integrity using cryptographic hashes\n• Document chain of custody\n• Create forensic copies for analysis"
            },
            {
                text: "Phase 2: Analysis\n• Examine each evidence source systematically\n• Look for artifacts, deleted files, and hidden data\n• Cross-reference findings between sources"
            },
            {
                text: "Phase 3: Correlation\n• Use Timeline Constructor to identify patterns\n• Connect disk artifacts with memory signatures\n• Correlate network traffic with system activities"
            },
            {
                text: "Phase 4: Documentation\n• Document all findings with legal precision\n• Maintain evidence integrity throughout\n• Prepare comprehensive forensic report"
            },
            {
                text: "🎯 Key Investigation Areas:\n\n• Digital Identity: Email accounts, usernames, online personas\n• Technical Indicators: IP addresses, domains, malware signatures"
            },
            {
                text: "• Operational Security: VPNs, encryption, anonymization techniques\n• Attack Infrastructure: C2 servers, botnets, staging areas\n• Financial Trails: Cryptocurrency wallets, money laundering"
            },
            {
                text: "⚖️ Legal Standards:\nThis investigation must meet courtroom standards:"
            },
            {
                text: "• Evidence Integrity: Cryptographic verification\n• Chain of Custody: Documented handling procedures\n• Methodology: Industry-standard forensic practices"
            },
            {
                text: "• Documentation: Detailed, reproducible findings\n• Expert Testimony: Ability to defend findings in court"
            },
            {
                text: "🏆 Success Criteria:\n• Identity Confirmation: Definitive identification of The Null\n• Evidence Quality: Court-admissible documentation\n• Timeline Accuracy: Complete attack reconstruction"
            },
            {
                text: "• Technical Proficiency: Master-level forensic skills\n• Mission Badge: Earn 'Digital Detective' certification"
            },
            {
                text: "🚀 Investigation Launch:\nThe Evidence Locker is your starting point. All seized materials have been catalogued and await your analysis."
            },
            {
                text: "Remember - The Null is highly sophisticated and has evaded capture before. Your forensic expertise is the key to finally bringing them to justice."
            },
            {
                text: "Case Status: Active Investigation\nEvidence Status: Ready for Analysis\nLegal Authority: Full Forensic Examination Authorized"
            },
            {
                text: "Ready to begin the hunt?"
            }
        ];
    }

    onComplete() {
        localStorage.setItem('cyberquest_level_5_started', 'true');
        // Store the start time for performance tracking (similar to Level 4)
        localStorage.setItem('cyberquest_level_5_start_time', Date.now());
        
        // Launch the Investigation Briefing as the starting point for Level 5 forensics
        if (window.applicationLauncher) {
            setTimeout(async () => {
                console.log('Launching Level 5 Digital Forensics Environment...');
                
                try {
                    // Launch the Investigation Briefing app first - this provides mission guidance and context
                    await window.applicationLauncher.launchInvestigationBriefing();
                    console.log('Investigation Briefing launched successfully');
                    
                    // Launch the Investigation Tracker - provides progress monitoring throughout the investigation
                    await window.applicationLauncher.launchInvestigationTracker();
                    console.log('Investigation Tracker launched successfully');
                    
                    // Show notification to guide user using centralized toast system
                    if (window.toastManager) {
                        window.toastManager.showToast(
                            ' INVESTIGATION BRIEFING: Mission briefing loaded. Review objectives and evidence guide before starting investigation.',
                            'success'
                        );
                    }
                    

                    
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
