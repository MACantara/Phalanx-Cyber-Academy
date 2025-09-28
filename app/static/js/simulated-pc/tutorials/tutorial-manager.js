import { BaseTutorial } from './base-tutorial.js';
import { tutorialInteractionManager } from './tutorial-interaction-manager.js';

export class TutorialManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.currentTutorial = null;
        this.interactionManager = tutorialInteractionManager;
        this.registry = tutorialRegistry;
        this.initialize(); // Generate methods after setting up properties
    }

    // Generic tutorial starter using registry
    async startTutorial(tutorialName, tutorialClass, globalVarName) {
        if (this.currentTutorial) {
            this.currentTutorial.cleanup();
        }
        
        // Enable tutorial mode to disable interactions
        this.interactionManager.enableTutorialMode();
        
        // Dynamic import to avoid circular dependency
        const module = await import(`./${tutorialName}-tutorial.js`);
        const TutorialClass = module[tutorialClass];
        
        this.currentTutorial = new TutorialClass(this.desktop);
        window[globalVarName] = this.currentTutorial; // For global access
        window.currentTutorial = this.currentTutorial; // For shared base functionality
        
        // Override the tutorial's complete method to disable tutorial mode
        const originalComplete = this.currentTutorial.complete.bind(this.currentTutorial);
        this.currentTutorial.complete = () => {
            originalComplete();
            this.interactionManager.disableTutorialMode();
        };
        
        // Override the tutorial's cleanup method to disable tutorial mode
        const originalCleanup = this.currentTutorial.cleanup.bind(this.currentTutorial);
        this.currentTutorial.cleanup = () => {
            originalCleanup();
            this.interactionManager.disableTutorialMode();
        };
        
        this.currentTutorial.start();
    }
}

// Maintain Tutorial as an alias for backwards compatibility
export const Tutorial = TutorialManager;

// Export BaseTutorial for backwards compatibility
export { BaseTutorial };