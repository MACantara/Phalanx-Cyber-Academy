/**
 * Level 3: Malware Mayhem
 * Configuration and setup for the malware detection and removal scenario
 */

export const Level3Config = {
    id: 3,
    name: "Malware Mayhem",
    description: "Isolate infections and perform digital cleanup during a gaming tournament",
    
    // Level-specific applications
    requiredApps: [
        'malware-scanner-app',
        'process-monitor-app'
    ],
    
    // Tutorial requirements
    tutorials: [
        'malware-scanner-tutorial',
        'process-monitor-tutorial',
        'system-logs-tutorial'
    ],
    
    // Dialogue files
    dialogues: [
        'level3-malware-mayhem'
    ],
    
    // Level objectives
    objectives: [
        'Detect malware infections',
        'Quarantine malicious files',
        'Monitor system processes',
        'Clean infected systems'
    ],
    
    // Scoring criteria
    scoring: {
        maxScore: 1000,
        penalties: {
            missedMalware: -150,
            falsePositive: -75
        },
        bonuses: {
            speedBonus: 200,
            thoroughnessBonus: 300
        }
    }
};
