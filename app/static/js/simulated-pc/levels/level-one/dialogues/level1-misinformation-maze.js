import { BaseDialogue } from '../../../dialogues/base-dialogue.js';
import { 
    LevelCompletionDialogue 
} from './index.js';

export class Level1MisinformationMazeDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor') {
        super(desktop, character);
        this.messages = [
            {
                text: "🎯 Mission Brief: Level 1 - The Misinformation Maze\nWelcome to your first cybersecurity challenge! As a junior security analyst, you've been assigned to investigate a coordinated disinformation campaign targeting upcoming elections."
            },
            {
                text: "📚 Learning Objectives:\n• Master critical thinking techniques for information verification\n• Identify common misinformation tactics and manipulation strategies"
            },
            {
                text: "• Develop skills to assess source credibility and author credentials\n• Learn to spot emotional manipulation and bias in content"
            },
            {
                text: "🔍 Your Mission:\nIntelligence reports indicate that foreign adversaries are spreading false information through fake news websites."
            },
            {
                text: "You'll analyze various news articles to distinguish legitimate journalism from fabricated content designed to influence public opinion."
            },
            {
                text: "🛠️ Detection Techniques:\nSource Analysis: Check domain authority and publication history\nAuthor Verification: Look for real credentials and bylines",
                example: "Legitimate: 'By Sarah Johnson, Political Reporter, Associated Press'\nSuspicious: 'By Staff Writer' or no author listed"
            },
            {
                text: "Fact Correlation: Cross-reference with reputable news sources\nLanguage Patterns: Watch for sensational headlines and emotional manipulation",
                example: "Professional: 'Senator Proposes New Healthcare Bill'\nManipulative: 'SHOCKING: Politicians HATE This Simple Healthcare Trick!'"
            },
            {
                text: "⚠️ Warning Signs to Watch For:\n• Suspicious URLs or domain names\n• Missing author information or fake credentials",
                example: "Suspicious: 'realcnnews.com' (mimicking cnn.com)\nLegitimate: 'reuters.com', 'apnews.com', 'bbc.com'"
            },
            {
                text: "• Extreme emotional language designed to provoke anger\n• Claims without credible sources or evidence\n• Headlines that don't match the article content",
                example: "Red flags: 'OUTRAGEOUS!', 'They don't want you to know!'\nBalanced: 'Study shows', 'According to officials'"
            },
            {
                text: "🎮 How to Play:\nUse the Web Browser to navigate articles. Read each article carefully, then use your analytical skills to determine if it's legitimate journalism or misinformation."
            },
            {
                text: "Click 'Legitimate' or 'Misinformation' based on your assessment. Take your time to analyze all the evidence before making a decision."
            },
            {
                text: "🏆 Scoring System:\nCorrect identification: +100 XP per article\nSpeed bonus: Extra points for quick, accurate decisions"
            },
            {
                text: "Streak multiplier: Consecutive correct answers increase your score\nPerfect score: Earn the 'Truth Seeker' badge for 100% accuracy"
            },
            {
                text: "💡 Pro Tips:\n• Take time to read carefully - rushing leads to mistakes\n• Check multiple indicators, not just one red flag"
            },
            {
                text: "• When in doubt, err on the side of caution\n• Real news includes multiple credible sources and balanced reporting"
            },
            {
                text: "🚀 Ready for Action?\nThis mission is crucial for national security. Disinformation campaigns can influence elections, cause social unrest, and undermine public trust."
            },
            {
                text: "Your ability to identify fake news helps protect democracy itself. Are you ready to enter the Misinformation Maze?"
            }
        ];
    }

    async onComplete() {
        // Store completion in localStorage
        localStorage.setItem('cyberquest_level_1_started', 'true');
        
        // Start the level simulation by opening the browser using application launcher
        if (window.applicationLauncher) {
            try {
                await window.applicationLauncher.launchForLevel(1, 'browser', 'Web Browser');
                
                // Get the browser instance from the applications map
                const browserApp = this.desktop.windowManager.applications.get('browser');
                if (browserApp) {
                    // Wait a moment for the browser to initialize
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Navigate directly to the challenge1 page
                    browserApp.navigation.navigateToUrl('https://daily-politico-news.com/breaking-news');
                    
                }
                
                // Mark the challenge as started
                localStorage.setItem('cyberquest_challenge1_started', 'true');
            } catch (error) {
                console.error('Failed to open browser:', error);
            }
        }
    }


    getFinalButtonText() {
        return 'Start Simulation';
    }

    // Static methods for tutorial management
    static shouldAutoStart(levelId) {
        const currentLevel = localStorage.getItem('cyberquest_current_level');
        const levelStarted = localStorage.getItem(`cyberquest_level_${levelId}_started`);
        return currentLevel === '1' && !levelStarted;
    }

    static markLevelStarted(levelId) {
        localStorage.setItem(`cyberquest_level_${levelId}_started`, 'true');
    }

    static markLevelCompleted(levelId) {
        localStorage.setItem(`cyberquest_level_${levelId}_completed`, 'true');
    }

    // Methods to trigger specific dialogues
    static async startTutorialDialogue(desktop) {
        if (TutorialDialogue.shouldAutoStart()) {
            // Ensure no other dialogue is active
            if (window.currentDialogue) {
                window.currentDialogue.cleanup();
            }
            
            const dialogue = new TutorialDialogue(desktop);
            window.currentDialogue = dialogue;
            dialogue.start();
            TutorialDialogue.markStarted();
        }
    }


    static async startLevelCompletionDialogue(desktop) {
        if (LevelCompletionDialogue.shouldAutoStart()) {
            // Ensure no other dialogue is active
            if (window.currentDialogue) {
                window.currentDialogue.cleanup();
            }
            
            const dialogue = new LevelCompletionDialogue(desktop);
            window.currentDialogue = dialogue;
            dialogue.start();
        }
    }

    // Start a level dialogue by name
    async startLevelDialogue(levelDialogueName, character = 'instructor') {
        console.log(`[DialogueManager] Starting level dialogue: ${levelDialogueName}`);
        try {
            const modulePath = `../../../dialogues/levels/${levelDialogueName}.js`;
            console.log(`[DialogueManager] Importing module from: ${modulePath}`);
            const module = await import(modulePath);
            
            // Generate the class name by capitalizing each word and appending 'Dialogue'
            const className = levelDialogueName.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join('') + 'Dialogue';
            console.log(`[DialogueManager] Looking for class: ${className}`);
            
            console.log(`Looking for dialogue class: ${className} in module:`, module);
            const dialogueClass = module[className];
            if (!dialogueClass) {
                const availableExports = Object.keys(module).join(', ');
                throw new Error(`Dialogue class '${className}' not found in module. Available exports: ${availableExports}`);
            }
            
            // Create and start the dialogue
            const dialogue = new dialogueClass(this.desktop, character);
            if (typeof dialogue.start === 'function') {
                // Store reference for event handlers
                window.currentDialogue = dialogue;
                // Store reference in manager for cleanup
                this.currentDialogue = dialogue;
                
                // Ensure cleanup on completion
                const originalComplete = dialogue.complete.bind(dialogue);
                dialogue.complete = () => {
                    if (window.currentDialogue === dialogue) {
                        window.currentDialogue = null;
                    }
                    return originalComplete();
                };
                
                // Start the dialogue
                dialogue.start();
                return dialogue;
            } else {
                throw new Error('Dialogue class must implement start() method');
            }
        } catch (error) {
            console.error(`Error loading level dialogue '${levelDialogueName}':`, error);
            throw new Error(`Failed to load dialogue '${levelDialogueName}': ${error.message}`);
        }
    }
}
