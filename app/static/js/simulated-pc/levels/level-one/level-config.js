/**
 * Level 1: The Misinformation Maze
 * Configuration and setup for the misinformation detection scenario
 */

export const Level1Config = {
    id: 1,
    name: "The Misinformation Maze",
    description: "Develop critical thinking skills to identify fake news and misinformation",
    
    // Level-specific applications
    requiredApps: [
        'browser-app'
    ],
    
    // Tutorial requirements
    tutorials: [
        'initial-tutorial',
        'browser-tutorial'
    ],
    
    // Dialogue files
    dialogues: [
        'level1-misinformation-maze'
    ],
    
    // Level objectives
    objectives: [
        'Analyze news articles for credibility',
        'Identify fake news warning signs',
        'Classify articles as real or fake',
        'Develop critical thinking skills'
    ],
    
    // Scoring criteria
    scoring: {
        maxScore: 1000,
        penalties: {
            incorrectClassification: -50,
            missedFakeNews: -75
        },
        bonuses: {
            accuracyBonus: 200,
            perfectScore: 300
        }
    }
};
