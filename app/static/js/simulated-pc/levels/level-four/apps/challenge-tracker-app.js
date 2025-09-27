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
            
            // Use all flags instead of just selected_flags to match our 15 flags
            if (data.success && data.ctf_config && data.ctf_config.flags) {
                this.challenges = Object.entries(data.ctf_config.flags).map(([id, info]) => ({
                    id: id,
                    name: info.name || id,
                    challenge_question: info.challenge_question || info.name || 'Challenge description loading...',
                    category: info.category || 'general',
                    difficulty: info.difficulty || 'medium',
                    value: info.value || `${id}{...}`
                }));
            } else if (data.selected_flags && data.selected_flags.length > 0) {
                // Fallback to selected_flags if available
                this.challenges = data.selected_flags.map((flag, index) => ({
                    id: flag.id || `flag-${index + 1}`,
                    name: flag.name || `Challenge ${index + 1}`,
                    challenge_question: flag.challenge_question || flag.name || 'Challenge description loading...',
                    category: flag.category || 'general',
                    difficulty: flag.difficulty || 'medium',
                    value: flag.value || `WHT-${index + 1}{...}`
                }));
            } else {
                // Fallback with all our known flags
                this.challenges = [
                    { id: 'WHT-ENV', name: 'Environment Reconnaissance', challenge_question: 'Find hidden information in user environment configuration files', value: 'WHT-ENV{...}' },
                    { id: 'WHT-ENV2', name: 'Environment Variables Leak', challenge_question: 'Discover secrets exposed in admin environment variables', value: 'WHT-ENV2{...}' },
                    { id: 'WHT-BACKUP', name: 'Backup Script Analysis', challenge_question: 'Analyze automated backup scripts for security issues', value: 'WHT-BACKUP{...}' },
                    { id: 'WHT-HIST', name: 'Command History Forensics', challenge_question: 'Examine command history for accidentally leaked credentials', value: 'WHT-HIST{...}' },
                    { id: 'WHT-SRC', name: 'Source Code Analysis', challenge_question: 'Find flags hidden in HTML comments and source code', value: 'WHT-SRC{...}' },
                    { id: 'WHT-DB', name: 'Database Configuration', challenge_question: 'Locate database credentials in configuration files', value: 'WHT-DB{...}' },
                    { id: 'WHT-LOG', name: 'Log File Analysis', challenge_question: 'Search web server logs for security information', value: 'WHT-LOG{...}' }
                ];
            }
            
            console.log('[ChallengeTracker] Loaded', this.challenges.length, 'challenges');
            this.updateContent();
        } catch (error) {
            console.error('[ChallengeTracker] Error loading challenges:', error);
            // Fallback to static message
            this.challenges = [{
                id: 'loading',
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
                    <div class="flex flex-col items-end space-y-1">
                        <div class="flex items-center space-x-2">
                            <span class="text-xs bg-blue-800 px-2 py-1 rounded">${progress}</span>
                            <i class="bi bi-chevron-up text-gray-300"></i>
                        </div>
                        <div class="w-16 bg-gray-600 rounded-full h-1">
                            <div class="bg-gradient-to-r from-blue-400 to-green-400 h-1 rounded-full transition-all duration-500" 
                                 style="width: ${this.challenges.length > 0 ? (this.foundFlags.size / this.challenges.length) * 100 : 0}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-3 text-white max-h-96 overflow-y-auto">
                <!-- Current Challenge - Always show -->
                <div class="mb-3">
                    <div class="text-sm font-semibold text-blue-300 mb-2">
                        <div class="flex items-center">
                            <i class="bi bi-search mr-1"></i>
                            Current Challenge
                        </div>
                    </div>
                    <!-- Challenge Dropdown -->
                    <div class="mb-3">
                        <select onchange="window.level4ChallengeTracker?.selectChallenge(parseInt(this.value))" 
                                class="w-full text-xs bg-gray-600 text-white rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-blue-400"
                                value="${this.currentChallengeIndex}">
                            ${this.challenges.map((challenge, index) => `
                                <option value="${index}" ${index === this.currentChallengeIndex ? 'selected' : ''}>
                                    ${this.foundFlags.has(challenge.value) ? '✅' : '📋'} ${index + 1}. ${challenge.name || challenge.id || `Challenge ${index + 1}`}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    ${currentChallenge ? `
                        <div class="bg-gray-700 rounded p-3 ${this.foundFlags.has(currentChallenge.value) ? 'ring-2 ring-green-400 bg-green-900 bg-opacity-20' : ''}">
                            <div class="flex items-center mb-2">
                                <div class="flex items-center mr-2">
                                    ${this.foundFlags.has(currentChallenge.value) ? 
                                        '<i class="bi bi-check-circle-fill text-green-400 text-lg"></i>' : 
                                        '<i class="bi bi-circle text-gray-500"></i>'
                                    }
                                </div>
                                <div class="text-xs font-semibold ${this.foundFlags.has(currentChallenge.value) ? 'text-green-300' : 'text-gray-300'}">${currentChallenge.name || 'Challenge'}</div>
                                ${this.foundFlags.has(currentChallenge.value) ? 
                                    '<div class="ml-auto px-2 py-0.5 bg-green-600 text-green-100 text-xs rounded-full font-medium">COMPLETED</div>' : 
                                    ''
                                }
                            </div>
                            <div class="text-sm leading-relaxed ${this.foundFlags.has(currentChallenge.value) ? 'text-gray-300 line-through opacity-75' : ''}">${currentChallenge.challenge_question || 'Loading challenge...'}</div>
                            ${this.foundFlags.has(currentChallenge.value) ? 
                                '<div class="mt-2 text-xs text-green-400 flex items-center"><i class="bi bi-trophy mr-1"></i>Challenge completed! Well done!</div>' : 
                                ''
                            }
                        </div>
                    ` : `
                        <div class="bg-gray-700 rounded p-3 text-center text-gray-400">
                            <i class="bi bi-hourglass-split"></i>
                            <div>Loading challenges...</div>
                        </div>
                    `}
                </div>
                
                <!-- Flag Submission Form -->
                <div class="border-t border-gray-600 pt-3">
                    <div class="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                        <i class="bi bi-flag-fill text-yellow-400 mr-1"></i>
                        Submit Flag
                    </div>
                    <div class="space-y-2">
                        <input 
                            type="text" 
                            id="flag-input-${this.id}" 
                            placeholder="Enter flag (e.g., WHT{example})"
                            class="w-full text-xs bg-gray-600 text-white rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-blue-400"
                            onkeypress="if(event.key==='Enter') window.level4ChallengeTracker?.submitCurrentFlag()"
                        />
                        <button 
                            onclick="window.level4ChallengeTracker?.submitCurrentFlag()" 
                            class="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white text-xs font-semibold py-1 px-2 rounded transition-colors flex items-center justify-center space-x-1 hover:shadow-lg transform hover:scale-105 transition-transform">
                            <i class="bi bi-check-circle"></i>
                            <span>Verify Flag</span>
                        </button>
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

    // Submit flag for current challenge
    async submitCurrentFlag() {
        const currentChallenge = this.challenges[this.currentChallengeIndex];
        if (!currentChallenge) {
            this.showNotification('No challenge selected', 'error');
            return;
        }

        const flagInput = this.element?.querySelector(`#flag-input-${this.id}`);
        const flagValue = flagInput?.value?.trim();
        
        if (!flagValue) {
            this.showNotification('Please enter a flag value', 'error');
            return;
        }

        // Check if flag has already been found
        if (this.foundFlags.has(flagValue)) {
            this.showNotification('This flag has already been submitted', 'warning');
            return;
        }

        try {
            // Validate flag with API
            const response = await fetch('/api/level4/validate-flag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    flag_number: currentChallenge.id,
                    flag_value: flagValue
                })
            });

            const result = await response.json();

            if (result.success && result.is_valid) {
                // Mark flag as found
                this.markFlagFound(flagValue);
                
                // Clear the input
                if (flagInput) {
                    flagInput.value = '';
                }
                
                // Add celebratory animation to the current challenge
                const challengeDiv = this.element?.querySelector('.bg-gray-700');
                if (challengeDiv) {
                    challengeDiv.style.transform = 'scale(1.05)';
                    challengeDiv.style.transition = 'transform 0.3s ease';
                    setTimeout(() => {
                        challengeDiv.style.transform = 'scale(1)';
                    }, 300);
                }
                
                this.showNotification('🎉 Flag verified successfully!', 'success');
                
                // Auto-advance to next incomplete challenge
                const nextIncompleteIndex = this.challenges.findIndex((challenge, index) => 
                    index > this.currentChallengeIndex && !this.foundFlags.has(challenge.value)
                );
                
                if (nextIncompleteIndex !== -1) {
                    setTimeout(() => {
                        this.selectChallenge(nextIncompleteIndex);
                    }, 1000);
                }

            } else {
                this.showNotification(result.message || 'Incorrect flag. Please try again.', 'error');
            }

        } catch (error) {
            console.error('[ChallengeTracker] Error validating flag:', error);
            this.showNotification('Error validating flag. Please try again.', 'error');
        }
    }

    // Show notification popup
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-600 border-green-500 text-green-100',
            error: 'bg-red-600 border-red-500 text-red-100',
            warning: 'bg-yellow-600 border-yellow-500 text-yellow-100',
            info: 'bg-blue-600 border-blue-500 text-blue-100'
        };

        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} border px-4 py-3 rounded shadow-lg z-50 max-w-sm transition-all duration-300 -translate-y-full opacity-0`;
        notification.innerHTML = `
            <div class="flex items-start space-x-2">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'} flex-shrink-0 mt-0.5"></i>
                <span class="text-sm font-medium whitespace-pre-line">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.remove('-translate-y-full', 'opacity-0');
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.add('-translate-y-full', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
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
        
        // Show special completion notification
        this.showNotification('🎉 ALL CHALLENGES COMPLETED! 🎉\nYou have successfully completed The White Hat Test!', 'success', 8000);
        
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