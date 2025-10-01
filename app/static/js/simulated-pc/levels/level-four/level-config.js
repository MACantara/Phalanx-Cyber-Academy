/**
 * Level 4: The White Hat Test
 * Configuration and setup for the ethical hacking scenario
 */

export const Level4Config = {
    id: 4,
    name: "The White Hat Test",
    description: "Practice ethical hacking and responsible vulnerability disclosure",
    
    // Level-specific applications
    requiredApps: [
        'terminal-app'
    ],
    
    // Tutorial requirements
    tutorials: [
        'terminal-tutorial'
    ],
    
    // Dialogue files
    dialogues: [
        'level4-white-hat-test'
    ],
    
    // Level objectives
    objectives: [
        'Use nmap for network reconnaissance',
        'Practice responsible disclosure'
    ],
    
    // Scoring criteria
    scoring: {
        maxScore: 1000,
        penalties: {
            unauthorizedAccess: -300,
            missedVulnerability: -100
        },
        bonuses: {
            ethicalConduct: 400,
            documentationBonus: 200
        }
    }
};
