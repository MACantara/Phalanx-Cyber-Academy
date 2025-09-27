/**
 * Level 4: The White Hat Test - Challenge Tracker App
 * Static app element displaying current flag challenges at the top right
 * Similar to Level 3 timer but for CTF challenge tracking
 */

export class Level4ChallengeTracker {
    constructor() {
        this.id = 'level4-challenge-tracker';
        this.title = 'Challenge Tracker';
        
        // Challenge state
        this.challenges = [];
        this.foundFlags = new Set();
        this.currentChallengeIndex = 0;
        this.isMinimized = false;
        
        // DOM element
        this.element = null;
        
        // Load challenges on construction
        this.loadChallenges();
    }

    // Load challenges from API
    async loadChallenges() {
        try {
            const response = await fetch('/api/level4/flags-config');
            if (!response.ok) {
                throw new Error(`Failed to load challenges: ${response.status}`);
            }
            
            const data = await response.json();
            this.challenges = data.selected_flags || [];
            console.log('[ChallengeTracker] Loaded', this.challenges.length, 'challenges');
            this.updateContent();
        } catch (error) {
            console.error('[ChallengeTracker] Error loading challenges:', error);
            // Fallback to static message
            this.challenges = [{
                challenge_question: "Loading challenges...",
                name: "Challenge Tracker",
                value: "WHT{loading}"
            }];
            this.updateContent();
        }
    }

    // Create the static tracker element
    createElement() {
        this.element = document.createElement('div');
        this.element.id = 'level4-challenge-tracker-static';
        this.element.className = 'fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 backdrop-blur-sm';
        this.element.style.width = this.isMinimized ? '60px' : '320px';
        this.element.style.transition = 'width 0.3s ease';
        
        this.updateContent();
        return this.element;
    }

    // Create content HTML
    createContent() {
        if (this.isMinimized) {
            return `
                <div class="bg-gradient-to-r from-blue-700 to-blue-600 px-3 py-2 rounded cursor-pointer" 
                     onclick="window.level4ChallengeTracker?.toggleMinimize()">
                    <div class="text-white text-sm font-semibold flex items-center justify-center">
                        <i class="bi bi-flag text-yellow-400"></i>
                    </div>
                </div>
            `;
        }

        const currentChallenge = this.challenges[this.currentChallengeIndex] || null;
        const progress = `${this.foundFlags.size}/${this.challenges.length}`;
        
        return `
            <div class="bg-gradient-to-r from-blue-700 to-blue-600 px-3 py-2 border-b border-gray-600 cursor-pointer"
                 onclick="window.level4ChallengeTracker?.toggleMinimize()">
                <div class="text-white text-xs font-semibold flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="bi bi-flag text-yellow-400"></i>
                        <span>WHITE HAT TEST</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-blue-800 px-2 py-1 rounded">${progress}</span>
                        <i class="bi bi-chevron-up text-gray-300"></i>
                    </div>
                </div>
            </div>
            <div class="p-3 text-white max-h-96 overflow-y-auto">
                ${currentChallenge ? `
                    <!-- Current Challenge -->
                    <div class="mb-3">
                        <div class="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                            <i class="bi bi-search mr-1"></i>
                            Current Challenge
                        </div>
                        <div class="bg-gray-700 rounded p-3">
                            <div class="text-xs font-semibold text-gray-300 mb-1">${currentChallenge.name || 'Challenge'}</div>
                            <div class="text-sm leading-relaxed">${currentChallenge.challenge_question || 'Loading challenge...'}</div>
                            ${currentChallenge.category ? `
                                <div class="mt-2">
                                    <span class="text-xs bg-gray-600 px-2 py-1 rounded">${currentChallenge.category.replace(/_/g, ' ')}</span>
                                    <span class="text-xs text-gray-400 ml-2">${currentChallenge.difficulty || 'medium'}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Challenge Navigation -->
                ${this.challenges.length > 1 ? `
                    <div class="mb-3">
                        <div class="text-sm font-semibold text-blue-300 mb-2">Challenges</div>
                        <div class="grid grid-cols-7 gap-1">
                            ${this.challenges.map((challenge, index) => `
                                <button class="challenge-nav-btn h-8 w-8 text-xs rounded transition-colors ${
                                    this.foundFlags.has(challenge.value) ? 'bg-green-600 text-white' :
                                    index === this.currentChallengeIndex ? 'bg-blue-600 text-white' :
                                    'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }" 
                                onclick="window.level4ChallengeTracker?.selectChallenge(${index})"
                                title="${challenge.name || `Challenge ${index + 1}`}">
                                    ${this.foundFlags.has(challenge.value) ? 
                                        '<i class="bi bi-check"></i>' : 
                                        (index + 1)
                                    }
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Progress Summary -->
                <div class="border-t border-gray-600 pt-3">
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-gray-300">Progress:</span>
                        <span class="${this.foundFlags.size === this.challenges.length ? 'text-green-400' : 'text-blue-400'} font-semibold">
                            ${progress} flags found
                        </span>
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div class="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500" 
                             style="width: ${this.challenges.length > 0 ? (this.foundFlags.size / this.challenges.length) * 100 : 0}%"></div>
                    </div>
                </div>
                
                <!-- Quick Commands -->
                <div class="mt-3 text-xs">
                    <div class="text-gray-400 mb-1">Quick commands:</div>
                    <div class="bg-gray-700 rounded p-2 font-mono text-xs">
                        help - Show all challenges<br>
                        ls -la - List files<br>
                        cat &lt;file&gt; - Read file content
                    </div>
                </div>
            </div>
        `;
    }

    // Update content of the element
    updateContent() {
        if (this.element) {
            this.element.innerHTML = this.createContent();
            this.element.style.width = this.isMinimized ? '60px' : '320px';
        }
    }

    // Append to desktop (called by application launcher)
    appendTo(container) {
        if (!container) {
            console.error('[ChallengeTracker] No container provided, using document.body');
            container = document.body;
        }
        
        if (!this.element) {
            this.createElement();
        }
        
        try {
            container.appendChild(this.element);
            console.log('[ChallengeTracker] Tracker element appended to container');
        } catch (error) {
            console.error('[ChallengeTracker] Failed to append tracker element:', error);
            // Fallback to document.body
            document.body.appendChild(this.element);
        }
        
        // Make globally accessible for onclick handlers
        window.level4ChallengeTracker = this;
    }

    // Remove from DOM
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clean up global reference
        if (window.level4ChallengeTracker === this) {
            delete window.level4ChallengeTracker;
        }
    }

    // Challenge navigation
    selectChallenge(index) {
        if (index >= 0 && index < this.challenges.length) {
            this.currentChallengeIndex = index;
            this.updateContent();
            console.log('[ChallengeTracker] Selected challenge', index + 1);
        }
    }

    // Navigate to next challenge
    nextChallenge() {
        if (this.currentChallengeIndex < this.challenges.length - 1) {
            this.currentChallengeIndex++;
            this.updateContent();
        }
    }

    // Navigate to previous challenge
    previousChallenge() {
        if (this.currentChallengeIndex > 0) {
            this.currentChallengeIndex--;
            this.updateContent();
        }
    }

    // Toggle minimize/maximize
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.updateContent();
    }

    // Mark flag as found
    markFlagFound(flagValue) {
        this.foundFlags.add(flagValue);
        this.updateContent();
        
        // Move to next unfinished challenge if current one is completed
        if (this.challenges[this.currentChallengeIndex]?.value === flagValue) {
            const nextUnfinishedIndex = this.challenges.findIndex((challenge, index) => 
                index > this.currentChallengeIndex && !this.foundFlags.has(challenge.value)
            );
            
            if (nextUnfinishedIndex !== -1) {
                this.currentChallengeIndex = nextUnfinishedIndex;
                this.updateContent();
            }
        }
        
        console.log('[ChallengeTracker] Flag found:', flagValue);
        
        // Check for completion
        if (this.foundFlags.size === this.challenges.length) {
            this.onAllChallengesCompleted();
        }
    }

    // Handle all challenges completed
    onAllChallengesCompleted() {
        console.log('[ChallengeTracker] All challenges completed!');
        
        // Dispatch completion event
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('level4-challenges-completed', {
                    detail: {
                        totalChallenges: this.challenges.length,
                        foundFlags: Array.from(this.foundFlags),
                        timestamp: Date.now()
                    }
                }));
            }
        } catch (error) {
            console.error('[ChallengeTracker] Error dispatching completion event:', error);
        }
    }

    // Get current challenge
    getCurrentChallenge() {
        return this.challenges[this.currentChallengeIndex] || null;
    }

    // Get all challenges
    getAllChallenges() {
        return this.challenges;
    }

    // Get progress information
    getProgress() {
        return {
            total: this.challenges.length,
            found: this.foundFlags.size,
            remaining: this.challenges.length - this.foundFlags.size,
            percentage: this.challenges.length > 0 ? (this.foundFlags.size / this.challenges.length) * 100 : 0
        };
    }

    // Initialize the tracker (called by application launcher)
    initialize() {
        console.log('[ChallengeTracker] Challenge tracker initialized');
        
        // Listen for flag submissions
        if (typeof window !== 'undefined') {
            window.addEventListener('level4-flag-submitted', (event) => {
                if (event.detail && event.detail.success && event.detail.flag) {
                    this.markFlagFound(event.detail.flag);
                }
            });
            
            // Listen for terminal flag discoveries
            window.addEventListener('level4-flag-discovered', (event) => {
                if (event.detail && event.detail.flag) {
                    this.markFlagFound(event.detail.flag);
                }
            });
        }
    }

    // Cleanup when tracker is destroyed
    cleanup() {
        this.remove();
    }

    // Get current status for saving/API
    getStatus() {
        return {
            foundFlags: Array.from(this.foundFlags),
            currentChallengeIndex: this.currentChallengeIndex,
            isMinimized: this.isMinimized
        };
    }

    // Restore status from save/API
    setStatus(status) {
        if (status) {
            this.foundFlags = new Set(status.foundFlags || []);
            this.currentChallengeIndex = status.currentChallengeIndex || 0;
            this.isMinimized = status.isMinimized || false;
            this.updateContent();
        }
    }
}

// Export a factory function for easy integration
export function createLevel4ChallengeTracker() {
    return new Level4ChallengeTracker();
}