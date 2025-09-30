import { Taskbar } from './desktop-components/taskbar.js';
import { WindowManager } from './desktop-components/window-manager.js';
import DialogueManager from './dialogues/dialogue-manager.js';
import { DialogueIntegration } from './dialogues/dialogue-integration.js';

export class Desktop {
    constructor(container) {
        this.container = container;
        this.dialogueManager = null;
        this.dialogueIntegration = null;
        this.initializeDesktop();
    }

    async initializeDesktop() {
        // Create main desktop container with initial opacity 0 for fade-in effect
        this.desktopElement = document.createElement('div');
        this.desktopElement.className = 'relative w-full h-full bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 opacity-0 transition-opacity duration-1000 ease-in-out';
        this.desktopElement.style.backgroundImage = 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 255, 0, 0.05) 0%, transparent 50%)';
        
        // Store reference to desktop on the element
        this.desktopElement.desktop = this;
        
        // Store level information from the simulation
        console.log('[Desktop] Initializing with window.currentSimulation:', window.currentSimulation);
        const simulation = window.currentSimulation;
        if (simulation && simulation.level) {
            console.log('[Desktop] Found simulation level:', simulation.level);
            this.level = simulation.level.id || simulation.level;
            console.log('[Desktop] Set desktop level to:', this.level);
        } else {
            console.log('[Desktop] No simulation level found');
        }
        
        this.container.appendChild(this.desktopElement);        
        
        // Initialize components
        this.taskbar = new Taskbar(this.desktopElement, null);
        
        // Initialize dialogue system before window manager
        this.dialogueManager = new DialogueManager(this);
        this.dialogueIntegration = new DialogueIntegration(this);
        
        this.windowManager = new WindowManager(this.desktopElement, this.taskbar);
        this.taskbar.windowManager = this.windowManager;
        
        // Set level in application launcher for level-specific apps
        if (this.windowManager.applicationLauncher) {
            this.windowManager.applicationLauncher.setLevel(this.level);
        }

        // Trigger fade-in effect after all components are loaded
        setTimeout(() => {
            this.desktopElement.classList.remove('opacity-0');
            this.desktopElement.classList.add('opacity-100');
        }, 100);

        // Initialize global accessibility
        window.dialogueManager = this.dialogueManager;
        window.dialogueIntegration = this.dialogueIntegration;

        // Make dialogue restart function globally accessible
        window.restartDialogues = () => {
            if (this.dialogueIntegration) {
                return this.dialogueIntegration.restartDialogues();
            }
            return 'Dialogue system not initialized yet.';
        };

        // Initialize dialogue flow first, then tutorials
        setTimeout(async () => {
            await this.initializeUserFlow();
        }, 2000); // Wait 2 seconds after desktop loads
    }

    async initializeUserFlow() {
        // Store desktop reference globally for dialogues
        window.desktop = this;
        
        // Start with dialogue flow - this handles the narrative introduction
        await this.dialogueIntegration.initializeDialogueFlow();
        
        // Note: Dialogues now handle both narrative and interactive guidance
        // The flow is: Welcome → Interactive Guidance → Mission Briefing
        // Level-specific applications (like Level 3 timer) are auto-opened by the ApplicationLauncher
    }

    // Method to trigger mission briefing when all guidance is complete
    async onGuidanceCompleted(guidanceName) {
        if (this.dialogueIntegration) {
            await this.dialogueIntegration.onGuidanceCompleted(guidanceName);
        }
    }

    // Method to trigger dialogues when applications are opened
    async onApplicationOpened(appName) {
        if (this.dialogueIntegration) {
            await this.dialogueIntegration.onApplicationOpened(appName);
        }
    }

    // Level 3 timer control methods
    addReputationDamage(amount) {
        if (this.windowManager?.applicationLauncher) {
            return this.windowManager.applicationLauncher.addReputationDamage(amount);
        }
        console.warn('[Desktop] ApplicationLauncher not available for damage tracking');
        return false;
    }

    addFinancialDamage(amount) {
        if (this.windowManager?.applicationLauncher) {
            return this.windowManager.applicationLauncher.addFinancialDamage(amount);
        }
        console.warn('[Desktop] ApplicationLauncher not available for damage tracking');
        return false;
    }

    getTimerStatus() {
        if (this.windowManager?.applicationLauncher) {
            return this.windowManager.applicationLauncher.getTimerStatus();
        }
        return null;
    }

    // Get level-specific applications
    getLevelApps() {
        if (this.windowManager?.applicationLauncher) {
            return this.windowManager.applicationLauncher.getLevelApps();
        }
        return {};
    }
}
