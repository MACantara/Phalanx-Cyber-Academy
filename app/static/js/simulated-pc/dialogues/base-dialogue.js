import { SkipDialogueModal } from '../desktop-components/skip-dialogue-modal.js';

export class BaseDialogue {
    constructor(desktop, character = 'default') {
        this.desktop = desktop;
        this.character = character;
        this.isActive = false;
        this.currentMessageIndex = 0;
        this.overlay = null;
        this.dialogueContainer = null;
        this.messages = []; // To be defined by child classes
        this.typingSpeed = 12.5; // Default typing speed in milliseconds per character (Lower is faster)
        this.skipDialogueModal = null;
        
        // Interactive guidance properties
        this.isInteractiveMode = false;
        this.highlightedElement = null;
        this.interactionBlocker = null;
        this.allowedInteractions = new Set();
        
        // First-time viewing tracking
        this.isFirstViewing = !this.hasBeenViewed();
        
        this.initializeInteractionCSS();
    }

    start() {
        if (this.isActive) return;
        
        // Prevent multiple dialogues from being active at once
        if (window.currentDialogue && window.currentDialogue !== this) {
            console.log('Another dialogue is active, cleaning up...');
            window.currentDialogue.cleanup();
        }
        
        this.isActive = true;
        this.currentMessageIndex = 0;
        this.createDialogueOverlay();
        this.showMessage();
        
        // Set as current dialogue
        window.currentDialogue = this;
    }
    
    createDialogueOverlay() {
        // Remove any existing overlay
        this.cleanup();
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'fixed inset-0 bg-black/20 flex justify-center items-start pt-[2vh] z-[10000]';
        
        // Create dialogue container
        this.dialogueContainer = document.createElement('div');
        this.dialogueContainer.className = 'bg-gray-800 border-2 border-gray-600 rounded p-4 max-w-2xl w-[90%] min-h-[200px] shadow-2xl flex flex-row items-start gap-8 dialogue-appear';
        
        this.overlay.appendChild(this.dialogueContainer);
        document.body.appendChild(this.overlay);
        
        // Prevent clicking outside to close (force user interaction)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    showMessage() {
        if (this.currentMessageIndex >= this.messages.length) {
            this.complete();
            return;
        }

        const message = this.messages[this.currentMessageIndex];
        this.renderMessage(message);
    }

    renderMessage(message) {
        const avatarUrl = this.getCharacterAvatar();
        const characterName = this.getCharacterName();
        const isLastMessage = this.currentMessageIndex >= this.messages.length - 1;

        this.dialogueContainer.innerHTML = `
            <img src="${avatarUrl}" alt="${characterName}" 
                 class="w-40 h-50 rounded border-3 border-gray-600 object-cover flex-shrink-0" 
                 onerror="this.src='/static/images/avatars/default.png'" width="120" height="120">
            
            <div class="flex-1 flex flex-col min-h-[200px] relative">
                <div class="text-green-500 text-xl font-bold mb-4 text-left">${characterName}</div>
                
                <div class="text-green-400 text-lg leading-relaxed mb-8 flex-grow text-left" id="dialogue-text-content">
                    ${this.shouldTypeMessage(message) ? '' : message.text}
                </div>
                
                <div class="flex justify-end items-center mt-auto">
                    <div class="flex gap-6">
                        ${this.currentMessageIndex > 0 ? 
                            `<button class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer text-md" onclick="${this.getPreviousHandler()}">
                                ← Previous
                            </button>` : ''
                        }
                        <button class="text-green-400 hover:text-green-300 transition-colors duration-200 cursor-pointer text-md" onclick="${this.getNextHandler()}">
                            ${isLastMessage ? this.getFinalButtonText() : 'Next →'}
                        </button>
                        ${!this.isFirstViewing ? 
                            `<button class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer text-md" onclick="${this.getSkipHandler()}">
                                Skip
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;

        // Type message if needed
        if (this.shouldTypeMessage(message)) {
            this.typeMessage(message.text);
        }

        // Apply interactive guidance for this message
        this.applyInteractiveGuidance(message);
    }

    shouldTypeMessage(message) {
        // Default to typing unless explicitly disabled
        return message.typing !== false && message.type !== 'instant';
    }

    async typeMessage(text, speed = this.typingSpeed) {
        const container = document.getElementById('dialogue-text-content');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            container.innerHTML += text[i];
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    nextMessage() {
        // Clear current interactive guidance
        this.clearHighlight();
        this.clearAllowedInteractions();
        
        if (this.currentMessageIndex < this.messages.length - 1) {
            this.currentMessageIndex++;
            this.showMessage();
        } else {
            this.complete();
        }
    }

    previousMessage() {
        // Clear current interactive guidance
        this.clearHighlight();
        this.clearAllowedInteractions();
        
        if (this.currentMessageIndex > 0) {
            this.currentMessageIndex--;
            this.showMessage();
        }
    }

    complete() {
        // Mark this dialogue as viewed
        this.markAsViewed();
        
        this.cleanup();
        this.onComplete();
    }

    cleanup() {
        // Disable interactive mode and clean up guidance elements
        this.disableInteractiveMode();
        
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.dialogueContainer = null;
        this.isActive = false;
        
        // Clear current dialogue reference if it's this instance
        if (window.currentDialogue === this) {
            window.currentDialogue = null;
        }
    }

    // Methods to be overridden by child classes
    onComplete() {
        // Override in child classes
        console.log('Dialogue completed');
    }

    getSkipButton() {
        return `<button class="dialogue-btn dialogue-btn-secondary" onclick="${this.getSkipHandler()}">
            Skip
        </button>`;
    }

    getFinalButtonText() {
        return 'Continue';
    }

    // Handler methods - to be overridden by child classes
    getNextHandler() {
        return 'window.currentDialogue.nextMessage()';
    }

    getPreviousHandler() {
        return 'window.currentDialogue.previousMessage()';
    }

    getSkipHandler() {
        return 'window.currentDialogue.showSkipModal()';
    }

    async showSkipModal() {
        if (!this.skipDialogueModal) {
            this.skipDialogueModal = new SkipDialogueModal(document.body);
        }
        
        const shouldSkip = await this.skipDialogueModal.show();
        if (shouldSkip) {
            this.complete();
        }
    }

    // Character management
    getCharacterAvatar() {
        if (this.desktop?.dialogueManager) {
            return this.desktop.dialogueManager.getCharacterAvatar(this.character);
        }
        return '/static/images/avatars/default.png';
    }

    getCharacterName() {
        if (this.desktop?.dialogueManager) {
            return this.desktop.dialogueManager.getCharacterName(this.character);
        }
        return 'System';
    }

    // Static methods - to be overridden by child classes
    static shouldAutoStart() {
        return false;
    }

    static restart() {
        // Override in child classes
    }

    // First-time viewing tracking methods
    getDialogueStorageKey() {
        // Generate a unique key based on the dialogue class name
        return `cyberquest_dialogue_viewed_${this.constructor.name}`;
    }

    hasBeenViewed() {
        try {
            const key = this.getDialogueStorageKey();
            return localStorage.getItem(key) === 'true';
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false; // Default to not viewed if localStorage fails
        }
    }

    markAsViewed() {
        try {
            const key = this.getDialogueStorageKey();
            localStorage.setItem(key, 'true');
        } catch (e) {
            console.warn('Failed to mark dialogue as viewed:', e);
        }
    }

    // Interactive guidance methods
    initializeInteractionCSS() {
        // Add interactive guidance CSS styles
        if (document.getElementById('dialogue-interaction-styles')) return;

        const interactionStyles = document.createElement('style');
        interactionStyles.id = 'dialogue-interaction-styles';
        interactionStyles.textContent = `
            .dialogue-highlight {
                outline: 3px solid #10b981 !important;
                outline-offset: 2px;
                position: relative;
                z-index: 52 !important;
                animation: dialogue-pulse 2s infinite;
            }

            .dialogue-pulse {
                animation: dialogue-pulse 2s infinite;
            }

            @keyframes dialogue-pulse {
                0%, 100% { 
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
                    transform: scale(1.02);
                }
            }

            .dialogue-spotlight {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 50;
                pointer-events: none;
            }

            .dialogue-interaction-blocker {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 49 !important;
                pointer-events: auto !important;
                background: transparent !important;
            }

            .dialogue-allowed-interaction {
                pointer-events: auto !important;
                position: relative !important;
                z-index: 53 !important;
            }
        `;
        document.head.appendChild(interactionStyles);
    }

    // Enable interactive guidance mode
    enableInteractiveMode() {
        this.isInteractiveMode = true;
        this.createInteractionBlocker();
    }

    // Disable interactive guidance mode
    disableInteractiveMode() {
        this.isInteractiveMode = false;
        this.clearHighlight();
        this.removeInteractionBlocker();
        this.clearAllowedInteractions();
    }

    // Create interaction blocker overlay
    createInteractionBlocker() {
        if (this.interactionBlocker) return;

        this.interactionBlocker = document.createElement('div');
        this.interactionBlocker.className = 'dialogue-interaction-blocker';
        this.interactionBlocker.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        this.interactionBlocker.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.body.appendChild(this.interactionBlocker);
    }

    // Remove interaction blocker
    removeInteractionBlocker() {
        if (this.interactionBlocker) {
            this.interactionBlocker.remove();
            this.interactionBlocker = null;
        }
    }

    // Highlight an element for guidance
    highlightElement(selector, action = 'highlight') {
        this.clearHighlight();
        
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for highlighting: ${selector}`);
            return null;
        }

        this.highlightedElement = element;
        element.classList.add('dialogue-highlight');
        
        if (action === 'pulse') {
            element.classList.add('dialogue-pulse');
        }

        // Create spotlight effect
        this.createSpotlight(element);
        
        return element;
    }

    // Create spotlight effect around highlighted element
    createSpotlight(element) {
        // Remove existing spotlight
        const existingSpotlight = document.querySelector('.dialogue-spotlight');
        if (existingSpotlight) existingSpotlight.remove();

        const rect = element.getBoundingClientRect();
        const spotlight = document.createElement('div');
        spotlight.className = 'dialogue-spotlight';
        
        // Create cutout effect using CSS clip-path or radial gradient
        spotlight.style.background = `
            radial-gradient(
                ellipse ${rect.width + 40}px ${rect.height + 40}px at ${rect.left + rect.width/2}px ${rect.top + rect.height/2}px,
                transparent 0%,
                transparent 40%,
                rgba(0, 0, 0, 0.7) 70%
            )
        `;
        
        document.body.appendChild(spotlight);
    }

    // Clear element highlighting
    clearHighlight() {
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('dialogue-highlight', 'dialogue-pulse');
            this.highlightedElement = null;
        }
        
        // Remove spotlight
        const spotlight = document.querySelector('.dialogue-spotlight');
        if (spotlight) spotlight.remove();
    }

    // Allow interaction with specific element
    allowInteractionWith(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('dialogue-allowed-interaction');
            this.allowedInteractions.add(element);
        }
    }

    // Clear all allowed interactions
    clearAllowedInteractions() {
        this.allowedInteractions.forEach(element => {
            element.classList.remove('dialogue-allowed-interaction');
        });
        this.allowedInteractions.clear();
    }

    // Check if a message has interactive guidance
    hasInteractiveGuidance(message) {
        return message.guidance && (message.guidance.highlight || message.guidance.allowInteraction);
    }

    // Apply interactive guidance for a message
    applyInteractiveGuidance(message) {
        if (!this.hasInteractiveGuidance(message)) return;

        const guidance = message.guidance;
        
        // Enable interactive mode if not already enabled
        if (!this.isInteractiveMode) {
            this.enableInteractiveMode();
        }

        // Highlight element if specified
        if (guidance.highlight) {
            this.highlightElement(guidance.highlight, guidance.action || 'highlight');
        }

        // Allow interaction with specific elements
        if (guidance.allowInteraction) {
            if (Array.isArray(guidance.allowInteraction)) {
                guidance.allowInteraction.forEach(selector => this.allowInteractionWith(selector));
            } else {
                this.allowInteractionWith(guidance.allowInteraction);
            }
        }
    }
}