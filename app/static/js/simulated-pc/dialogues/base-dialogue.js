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
        // Remove any existing overlay but preserve active state
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.exampleContainer && this.exampleContainer.parentNode) {
            this.exampleContainer.parentNode.removeChild(this.exampleContainer);
        }
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'fixed inset-0 bg-black/20 flex justify-center items-start pt-2 sm:pt-4 md:pt-8 z-[10000] p-2 sm:p-4';
        
        // Create dialogue container
        this.dialogueContainer = document.createElement('div');
        this.dialogueContainer.className = 'bg-gray-800 border-2 border-gray-600 rounded p-3 sm:p-4 md:p-6 w-full max-w-xs sm:max-w-lg md:max-w-2xl min-h-[200px] max-h-[85vh] shadow-2xl flex flex-col md:flex-row items-start gap-3 sm:gap-4 md:gap-8 dialogue-appear overflow-y-auto';
        
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
        const hasExample = message.example && message.example.trim();

        this.dialogueContainer.innerHTML = `
            <img src="${avatarUrl}" alt="${characterName}" 
                 class="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded border-2 sm:border-3 border-gray-600 object-cover flex-shrink-0 mx-auto md:mx-0" 
                 onerror="this.src='/static/images/avatars/default.png'">
            
            <div class="flex-1 flex flex-col min-h-[150px] sm:min-h-[180px] md:min-h-[200px] relative w-full">
                <div class="w-full text-green-500 text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">${characterName}</div>
                
                <div class="flex-grow mb-4 sm:mb-6 md:mb-8 overflow-y-auto max-h-[40vh]">
                    <div class="text-green-400 text-sm sm:text-base md:text-lg leading-relaxed text-left" id="dialogue-text-content">
                        ${this.shouldTypeMessage(message) ? '' : this.formatText(message.text)}
                    </div>
                </div>
                
                <div class="w-full flex flex-row justify-center items-center mt-auto gap-2 sm:gap-3 md:gap-4">
                    <div class="flex flex-row gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
                        ${this.currentMessageIndex > 0 ? 
                            `<button class="w-[70px] sm:w-[90px] md:w-[100px] px-2 sm:px-3 md:px-4 py-2 text-gray-300 hover:text-white active:text-gray-200 bg-gray-700 hover:bg-gray-600 active:bg-gray-600 rounded transition-colors duration-200 cursor-pointer text-xs sm:text-sm md:text-base touch-manipulation flex items-center justify-center" onclick="${this.getPreviousHandler()}">
                                <i class="bi bi-arrow-left mr-1"></i><span class="hidden sm:inline">Previous</span><span class="sm:hidden">Prev</span>
                            </button>` : ''
                        }
                        <button class="w-[70px] sm:w-[90px] md:w-[100px] px-2 sm:px-3 md:px-4 py-2 text-green-400 hover:text-green-300 active:text-green-200 bg-gray-700 hover:bg-green-400 hover:text-black active:bg-green-500 active:text-black rounded transition-colors duration-200 cursor-pointer text-xs sm:text-sm md:text-base touch-manipulation flex items-center justify-center" onclick="${this.getNextHandler()}">
                            ${isLastMessage ? this.getFinalButtonText() : '<span class="hidden sm:inline">Next</span><span class="sm:hidden">Next</span> <i class="bi bi-arrow-right ml-1"></i>'}
                        </button>
                        ${!this.isFirstViewing ? 
                            `<button class="w-[70px] sm:w-[90px] md:w-[100px] px-2 sm:px-3 md:px-4 py-2 text-gray-300 hover:text-white active:text-gray-200 bg-gray-700 hover:bg-gray-600 active:bg-gray-600 rounded transition-colors duration-200 cursor-pointer text-xs sm:text-sm md:text-base touch-manipulation flex items-center justify-center" onclick="${this.getSkipHandler()}">
                                <i class="bi bi-skip-end mr-1"></i>Skip
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;

        // Clean up any existing example container before creating a new one
        if (this.exampleContainer && this.exampleContainer.parentNode) {
            this.exampleContainer.parentNode.removeChild(this.exampleContainer);
            this.exampleContainer = null;
        }

        // Add separate example container positioned relative to dialogue if example exists
        if (hasExample) {
            const exampleContainer = document.createElement('div');
            
            // Get dialogue container position and dimensions
            const dialogueRect = this.dialogueContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - dialogueRect.bottom;
            const spaceAbove = dialogueRect.top;
            
            // Position example container below dialogue if there's space, otherwise above
            const positionBelow = spaceBelow >= 200; // Need at least 200px for example container
            
            if (positionBelow) {
                exampleContainer.className = 'absolute flex items-start justify-center z-[10001] pointer-events-none';
                exampleContainer.style.top = `${dialogueRect.bottom + window.scrollY + 8}px`; // 8px gap
                exampleContainer.style.left = `${Math.max(8, dialogueRect.left + window.scrollX)}px`;
                exampleContainer.style.right = `${Math.max(8, window.innerWidth - dialogueRect.right - window.scrollX)}px`;
            } else {
                exampleContainer.className = 'absolute flex items-end justify-center z-[10001] pointer-events-none';
                exampleContainer.style.bottom = `${viewportHeight - dialogueRect.top - window.scrollY + 8}px`; // 8px gap above
                exampleContainer.style.left = `${Math.max(8, dialogueRect.left + window.scrollX)}px`;
                exampleContainer.style.right = `${Math.max(8, window.innerWidth - dialogueRect.right - window.scrollX)}px`;
            }
            
            exampleContainer.innerHTML = `
                <div class="bg-gray-800 border-2 border-yellow-500 rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-4 shadow-2xl pointer-events-auto">
                    <div class="text-yellow-400 text-sm sm:text-base font-semibold mb-3 flex items-center justify-center">
                        <i class="bi bi-lightbulb mr-2"></i>
                        Example
                    </div>
                    <div class="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-mono whitespace-pre-wrap text-center" id="dialogue-example-content">
${this.formatText(message.example)}
                    </div>
                </div>
            `;
            document.body.appendChild(exampleContainer);
            
            // Store reference for cleanup
            this.exampleContainer = exampleContainer;
        }

        // Type message if needed
        if (this.shouldTypeMessage(message)) {
            // Add small delay to ensure DOM is ready
            setTimeout(() => {
                this.typeMessage(message.text);
            }, 50);
        } else {
            // If not typing, make sure the formatted text is displayed
            const container = document.getElementById('dialogue-text-content');
            if (container) {
                container.innerHTML = this.formatText(message.text);
            }
        }

        // Bind touch events for mobile interaction
        this.bindTouchEvents();

        // Apply interactive guidance for this message
        this.applyInteractiveGuidance(message);
    }

    shouldTypeMessage(message) {
        // Always display instantly
        return false;
    }

    formatText(text) {
        if (!text) return '';
        
        // Convert markdown-style formatting to HTML
        let formatted = text
            // Convert line breaks
            .replace(/\n/g, '<br>')
            // Convert italic text (*text*)
            .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="text-green-300 italic">$1</em>')
            // Convert inline code (`text`)
            .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded text-yellow-300 font-mono text-sm">$1</code>')
            
        return formatted;
    }

    async typeMessage(text, speed = this.typingSpeed) {
        const container = document.getElementById('dialogue-text-content');
        if (!container) {
            console.warn('Dialogue text container not found');
            return;
        }
        
        console.log('Starting to type message:', text.substring(0, 50) + '...');
        
        // Format the text first and set it as innerHTML
        const formattedText = this.formatText(text);
        container.innerHTML = formattedText;
        
        // Store reference to ensure dialogue stays active during typing
        const dialogueInstance = this;
        
        // Create a mask that will reveal text progressively
        const maskOverlay = document.createElement('div');
        maskOverlay.style.position = 'absolute';
        maskOverlay.style.top = '0';
        maskOverlay.style.left = '0';
        maskOverlay.style.right = '0';
        maskOverlay.style.bottom = '0';
        maskOverlay.style.backgroundColor = 'rgb(31, 41, 55)'; // Same as dialogue background
        maskOverlay.style.pointerEvents = 'none';
        maskOverlay.style.zIndex = '1';
        
        // Make container relative and add the mask
        container.style.position = 'relative';
        container.appendChild(maskOverlay);
        
        // Wrap content in a div for better control
        const contentWrapper = document.createElement('div');
        contentWrapper.innerHTML = formattedText;
        contentWrapper.style.position = 'relative';
        contentWrapper.style.zIndex = '0';
        
        // Replace container content with wrapper
        container.innerHTML = '';
        container.appendChild(contentWrapper);
        container.appendChild(maskOverlay);
        
        // Get container dimensions for calculation
        const containerRect = container.getBoundingClientRect();
        const containerHeight = container.scrollHeight;
        
        // Animate by progressively reducing mask height (top-to-bottom reveal)
        const plainText = text;
        for (let i = 0; i <= plainText.length; i++) {
            // Check if dialogue is still active
            if (!dialogueInstance.isActive || !document.getElementById('dialogue-text-content')) {
                console.warn('Typing interrupted - dialogue no longer active or container removed');
                return;
            }
            
            // Calculate how much to reveal (top-to-bottom)
            const revealPercentage = i / plainText.length;
            const maskHeight = containerHeight * (1 - revealPercentage);
            
            // Position mask to cover remaining text from bottom
            maskOverlay.style.height = `${maskHeight}px`;
            maskOverlay.style.top = `${containerHeight - maskHeight}px`;
            
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        // Clean up - remove mask and restore normal container
        container.innerHTML = formattedText;
        container.style.position = '';
        
        console.log('Typing complete');
    }

    nextMessage() {
        // Clear current interactive guidance
        this.clearHighlight();
        this.clearAllowedInteractions();
        
        // Clean up previous example container
        if (this.exampleContainer && this.exampleContainer.parentNode) {
            this.exampleContainer.parentNode.removeChild(this.exampleContainer);
            this.exampleContainer = null;
        }
        
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
        
        // Clean up previous example container
        if (this.exampleContainer && this.exampleContainer.parentNode) {
            this.exampleContainer.parentNode.removeChild(this.exampleContainer);
            this.exampleContainer = null;
        }
        
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
        
        // Clean up separate example container
        if (this.exampleContainer && this.exampleContainer.parentNode) {
            this.exampleContainer.parentNode.removeChild(this.exampleContainer);
        }
        
        this.overlay = null;
        this.dialogueContainer = null;
        this.exampleContainer = null;
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
                outline: 2px solid #10b981 !important;
                outline-offset: 1px;
                position: relative;
                z-index: 52 !important;
                animation: dialogue-pulse 2s infinite;
            }

            /* Responsive outline thickness */
            @media (min-width: 640px) {
                .dialogue-highlight {
                    outline: 3px solid #10b981 !important;
                    outline-offset: 2px;
                }
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
                    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
                    transform: scale(1.01);
                }
            }

            /* Larger pulse for desktop */
            @media (min-width: 768px) {
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

    bindTouchEvents() {
        // Add touch event support for dialogue buttons
        const buttons = this.dialogueContainer.querySelectorAll('button[onclick]');
        buttons.forEach(button => {
            const onclickHandler = button.getAttribute('onclick');
            if (onclickHandler) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    eval(onclickHandler);
                });
            }
        });
    }
}