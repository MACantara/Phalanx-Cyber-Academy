import { BootSequence } from './boot-sequence.js';
import { LoadingScreen } from './loading-screen.js';
import { ShutdownSequence } from './shutdown-sequence.js';
import { Desktop } from './desktop.js';
import { ShutdownModal } from './desktop-components/shutdown-modal.js';

export class SimulatedPC {
    constructor(level = null) {
        this.level = level;
        this.isActive = false;
        this.container = null;
        this.bootSequence = null;
        this.loadingScreen = null;
        this.desktop = null;
        this.shutdownModal = null;
    }

    async initialize() {
        // Create fullscreen overlay
        this.container = document.createElement('div');
        this.container.className = 'fixed inset-0 w-full h-full overflow-hidden z-50 bg-black';
        document.body.appendChild(this.container);

        try {
            // Step 1: Boot sequence
            const bootContainer = document.createElement('div');
            bootContainer.className = 'w-full h-full';
            this.container.appendChild(bootContainer);

            this.bootSequence = new BootSequence(bootContainer);
            await this.bootSequence.start();

            // Step 2: Loading screen
            this.container.innerHTML = '';
            const loadingContainer = document.createElement('div');
            loadingContainer.className = 'w-full h-full';
            this.container.appendChild(loadingContainer);

            this.loadingScreen = new LoadingScreen(loadingContainer);
            await this.loadingScreen.show();

            // Step 3: Initialize desktop directly
            await this.initializeDesktop();
            this.isActive = true;
        } catch (error) {
            console.error('Failed to initialize simulated PC:', error);
            this.destroy();
        }
    }

    async initializeDesktop() {
        // Clear loading screen
        this.container.innerHTML = '';
        
        // Initialize desktop
        this.desktop = new Desktop(this.container);

        // Listen for exit events
        window.addEventListener('exitSimulation', () => {
            this.exit();
        });

        // Prevent escape key and other shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        // Prevent common shortcuts that might break the simulation
        if (event.key === 'Escape' || 
            (event.ctrlKey && event.key === 'w') ||
            (event.ctrlKey && event.key === 't') ||
            (event.altKey && event.key === 'Tab')) {
            
            if (event.key === 'Escape') {
                // Allow escape to show exit confirmation
                this.exit();
            } else {
                event.preventDefault();
            }
        }
    }

    async exit() {
        if (!this.shutdownModal) {
            this.shutdownModal = new ShutdownModal(this.container);
        }
        
        const shouldShutdown = await this.shutdownModal.show();
        if (shouldShutdown) {
            this.runShutdownSequence();
        }
    }

    async runShutdownSequence() {
        try {
            // Clear current content and show shutdown sequence
            this.container.innerHTML = '';
            
            const shutdownContainer = document.createElement('div');
            shutdownContainer.className = 'w-full h-full';
            this.container.appendChild(shutdownContainer);

            // Run shutdown sequence
            await ShutdownSequence.runShutdown(shutdownContainer);
            
            // After shutdown completes, redirect
            this.destroy();
            window.location.href = '/levels';
        } catch (error) {
            console.error('Error during shutdown sequence:', error);
            // Fallback to immediate exit
            this.destroy();
            window.location.href = '/levels';
        }
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('exitSimulation', this.exit);
        
        this.isActive = false;
    }

    // Scenario-specific methods
    loadScenario(scenarioData) {
        if (this.desktop) {
            // Customize desktop based on scenario
            // This can be extended for different levels
            console.log('Loading scenario:', scenarioData);
        }
    }

    updateProgress(progress) {
        // Update mission progress
        console.log('Progress updated:', progress);
    }

    showNotification(message, type = 'info') {
        // Use centralized toast utility if available
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, type);
        } else {
            // Fallback to console log if toast manager not available
            console.log(`SimulatedPC Notification [${type}]: ${message}`);
        }
    }
}

// Global instance
window.simulatedPC = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we should start simulation based on URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('start_simulation') === 'true') {
        startSimulation();
    }
});

// Export function to start simulation
window.startSimulation = async function(level = null) {
    if (window.simulatedPC && window.simulatedPC.isActive) {
        console.warn('Simulation already running');
        return;
    }

    try {
        window.simulatedPC = new SimulatedPC(level);
        await window.simulatedPC.initialize();
    } catch (error) {
        console.error('Failed to start simulation:', error);
        alert('Failed to start simulation. Please try again.');
    }
};

// Export function to stop simulation
window.stopSimulation = function() {
    if (window.simulatedPC) {
        window.simulatedPC.destroy();
        window.simulatedPC = null;
    }
};
