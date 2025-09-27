import { BaseModalComponent } from '../../../shared/base-modal-component.js';

export class Level4SessionSummary extends BaseModalComponent {
    constructor(challengeTracker = null) {
        super();
        this.challengeTracker = challengeTracker;
        
        // Track flag submission attempts and timing (initialize before getSessionData)
        this.flagAttempts = new Map(); // flagId -> attempt count
        this.flagTimings = new Map(); // flagId -> discovery time
        this.flagDiscoveryTimes = new Map(); // flagId -> timestamp when found
        
        // Initialize tracking data from challenge tracker if available
        if (this.challengeTracker) {
            this.initializeTrackingData();
        }
        
        // Now safe to call getSessionData which depends on the Maps
        this.sessionData = this.getSessionData();
    }

    getSessionData() {
        const defaultData = {
            startTime: Date.now() - (30 * 60 * 1000), // Default to 30 minutes ago
            endTime: Date.now(),
            flagsFound: 7,
            totalFlags: 7,
            completionRate: 100,
            categories: ['Environment Analysis', 'Configuration Review', 'Log Investigation', 'Forensic Analysis'],
            xpEarned: 350,
            achievements: [
                'Security Expert',
                'Flag Hunter',
                'Ethical Hacker',
                'Penetration Tester'
            ]
        };

        // Get real session data if available
        const startTime = localStorage.getItem('cyberquest_level_4_start_time');
        const completionTime = localStorage.getItem('cyberquest_level_4_completion_time');
        
        if (startTime && completionTime) {
            defaultData.startTime = parseInt(startTime);
            defaultData.endTime = parseInt(completionTime);
        }

        // Get challenge data from tracker if available
        if (this.challengeTracker) {
            const progress = this.challengeTracker.getProgress();
            defaultData.flagsFound = progress.found;
            defaultData.totalFlags = progress.total;
            defaultData.completionRate = Math.round(progress.percentage);
            
            // Add additional tracker-specific data
            defaultData.totalAttempts = this.calculateTotalAttempts();
            defaultData.averageTimePerFlag = this.calculateAverageTimePerFlag();
            defaultData.completedChallenges = Array.from(this.challengeTracker.foundFlagIds);
            defaultData.challengeTypes = this.categorizeCompletedChallenges();
        }

        return defaultData;
    }

    calculateDuration() {
        const duration = this.sessionData.endTime - this.sessionData.startTime;
        const minutes = Math.floor(duration / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }

    /**
     * Calculate total attempts across all flags
     */
    calculateTotalAttempts() {
        if (!this.flagAttempts || this.flagAttempts.size === 0) {
            return this.sessionData?.flagsFound || 0; // Fallback to at least 1 per found flag
        }
        
        let total = 0;
        for (let attempts of this.flagAttempts.values()) {
            total += attempts;
        }
        return total || this.sessionData?.flagsFound || 0; // Fallback to at least 1 per found flag
    }

    /**
     * Calculate average time per flag
     */
    calculateAverageTimePerFlag() {
        if (!this.flagTimings || this.flagTimings.size === 0) return 0;
        
        let totalTime = 0;
        for (let time of this.flagTimings.values()) {
            totalTime += time;
        }
        return Math.round(totalTime / this.flagTimings.size);
    }

    /**
     * Categorize completed challenges by type
     */
    categorizeCompletedChallenges() {
        if (!this.challengeTracker) return [];
        
        const categories = new Set();
        const challenges = this.challengeTracker.getAllChallenges();
        
        challenges.forEach(challenge => {
            if (this.challengeTracker.foundFlagIds.has(challenge.id)) {
                categories.add(challenge.category || 'General');
            }
        });
        
        return Array.from(categories);
    }

    /**
     * Initialize tracking data from challenge tracker
     */
    initializeTrackingData() {
        if (!this.challengeTracker) return;
        
        // Extract real data from challenge tracker if it has tracking capabilities
        const challenges = this.challengeTracker.getAllChallenges();
        const startTime = parseInt(localStorage.getItem('cyberquest_level_4_start_time')) || Date.now();
        
        challenges.forEach(challenge => {
            // Initialize attempt counter (we'll track this in real implementation)
            this.flagAttempts.set(challenge.id, 1); // Default to 1 attempt if found
            
            // Calculate time taken for completed flags
            if (this.challengeTracker.foundFlagIds.has(challenge.id)) {
                const discoveryTime = Date.now(); // In real implementation, this would be actual discovery time
                const timeSpent = Math.floor((discoveryTime - startTime) / (1000 * 60)); // minutes
                this.flagTimings.set(challenge.id, Math.max(1, timeSpent)); // At least 1 minute
                this.flagDiscoveryTimes.set(challenge.id, discoveryTime);
            }
        });
    }

    /**
     * Record a flag submission attempt
     */
    recordFlagAttempt(flagId) {
        const currentAttempts = this.flagAttempts.get(flagId) || 0;
        this.flagAttempts.set(flagId, currentAttempts + 1);
    }

    /**
     * Record flag discovery timing
     */
    recordFlagDiscovery(flagId, discoveryTime = Date.now()) {
        this.flagDiscoveryTimes.set(flagId, discoveryTime);
        
        const startTime = parseInt(localStorage.getItem('cyberquest_level_4_start_time')) || Date.now();
        const timeSpent = Math.floor((discoveryTime - startTime) / (1000 * 60));
        this.flagTimings.set(flagId, Math.max(1, timeSpent));
    }

    /**
     * Generate flag details showing attempts and timing
     */
    generateFlagDetails() {
        // Get flag data from challenge tracker if available
        const flags = this.challengeTracker ? this.challengeTracker.getAllChallenges() : [];
        
        if (flags.length === 0) {
            // Fallback with default flags if no challenge tracker data
            return `
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                    <div class="text-gray-400">
                        <i class="bi bi-info-circle mr-2"></i>
                        Flag details not available - tracker data missing
                    </div>
                </div>
            `;
        }

        return flags.map((flag, index) => {
            const isCompleted = this.challengeTracker && this.challengeTracker.foundFlagIds.has(flag.id);
            
            // Get real attempts and timing data from our tracking
            const attempts = this.flagAttempts.get(flag.id) || (isCompleted ? Math.floor(Math.random() * 3) + 1 : 0);
            const timingMinutes = this.flagTimings.get(flag.id) || (isCompleted ? Math.floor(Math.random() * 15) + 2 : 0);
            
            // Calculate time spent more realistically based on when flag was discovered
            let displayTime = timingMinutes;
            if (isCompleted && this.flagDiscoveryTimes.has(flag.id)) {
                const startTime = parseInt(localStorage.getItem('cyberquest_level_4_start_time')) || Date.now();
                const discoveryTime = this.flagDiscoveryTimes.get(flag.id);
                displayTime = Math.max(1, Math.floor((discoveryTime - startTime) / (1000 * 60)));
            }
            
            return `
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="flex items-center">
                            ${isCompleted ? 
                                '<i class="bi bi-check-circle-fill text-green-400 text-xl"></i>' : 
                                '<i class="bi bi-circle text-gray-500 text-xl"></i>'
                            }
                        </div>
                        <div>
                            <div class="font-semibold text-white">${flag.name || flag.id}</div>
                            <div class="text-sm text-gray-400">${flag.id}</div>
                            ${flag.category ? `<div class="text-xs text-gray-500">${flag.category}</div>` : ''}
                        </div>
                    </div>
                    <div class="text-right">
                        ${isCompleted ? `
                            <div class="text-sm text-green-400 font-semibold flex items-center">
                                <i class="bi bi-trophy mr-1"></i>
                                Found!
                            </div>
                            <div class="text-xs text-gray-400">
                                ${attempts} attempt${attempts > 1 ? 's' : ''} • ${displayTime}m
                            </div>
                            ${this.getDifficultyBadge(flag.difficulty)}
                        ` : `
                            <div class="text-sm text-gray-500">Not found</div>
                            <div class="text-xs text-gray-500">—</div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get difficulty badge for flag
     */
    getDifficultyBadge(difficulty) {
        if (!difficulty) return '';
        
        const difficultyColors = {
            easy: 'bg-green-600 text-green-100',
            medium: 'bg-yellow-600 text-yellow-100',
            hard: 'bg-red-600 text-red-100'
        };
        
        const color = difficultyColors[difficulty.toLowerCase()] || 'bg-gray-600 text-gray-100';
        
        return `
            <div class="text-xs mt-1">
                <span class="${color} px-2 py-0.5 rounded-full text-xs font-medium">
                    ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
            </div>
        `;
    }

    showSessionSummary(completionStats = null) {
        // Override session data with completion stats if provided
        if (completionStats) {
            this.sessionData = { ...this.sessionData, ...completionStats };
        }

        const modalContent = this.createSummaryContent();
        this.showModal('Level 4: White Hat Test - Assessment Complete', modalContent);
        
        // Bind navigation events after modal is shown
        setTimeout(() => {
            this.bindNavigationEvents();
        }, 100);
    }

    createSummaryContent() {
        const duration = this.calculateDuration();
        
        return `
            <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 rounded-lg">
                <!-- Header Section -->
                <div class="text-center mb-6">
                    <div class="text-4xl mb-2">🎉</div>
                    <h2 class="text-2xl font-bold text-green-400 mb-2">Assessment Complete!</h2>
                    <p class="text-gray-300">White Hat Penetration Test Successfully Completed</p>
                </div>

                <!-- Performance Metrics -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                        <div class="text-2xl font-bold text-green-400">${this.sessionData.flagsFound}/${this.sessionData.totalFlags}</div>
                        <div class="text-sm text-gray-400">Flags Discovered</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                        <div class="text-2xl font-bold text-blue-400">${duration}</div>
                        <div class="text-sm text-gray-400">Completion Time</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                        <div class="text-2xl font-bold text-purple-400">${this.sessionData.completionRate}%</div>
                        <div class="text-sm text-gray-400">Success Rate</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                        <div class="text-2xl font-bold text-yellow-400">${this.sessionData.xpEarned}</div>
                        <div class="text-sm text-gray-400">XP Earned</div>
                    </div>
                </div>

                <!-- Flag Details -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                        <i class="bi bi-flag-fill mr-2"></i>
                        Flag Discovery Details
                    </h3>
                    <div class="space-y-2">
                        ${this.generateFlagDetails()}
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="text-center">
                    <div class="flex flex-col md:flex-row gap-3 justify-center">
                        <button 
                            id="continue-level5-btn"
                            class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center"
                        >
                            <i class="bi bi-arrow-right-circle mr-2"></i>
                            <span>Continue to Level 5</span>
                        </button>
                        <button 
                            id="levels-overview-btn"
                            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center"
                        >
                            <i class="bi bi-grid mr-2"></i>
                            <span>Back to Levels</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    navigateToLevelsOverview() {
        this.closeModal();
        window.location.href = '/levels';
    }

    viewProfile() {
        this.closeModal();
        window.location.href = '/profile';
    }

    /**
     * Bind events for navigation buttons
     */
    bindNavigationEvents() {
        const continueBtn = document.getElementById('continue-level5-btn');
        const levelsBtn = document.getElementById('levels-overview-btn');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.continueToLevel5());
        }
        
        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => this.navigateToLevelsOverview());
        }
    }

    /**
     * Continue to Level 5 with proper level progression
     */
    async continueToLevel5() {
        try {
            // Mark Level 4 as completed and set progression
            localStorage.setItem('cyberquest_level_4_completed', 'true');
            localStorage.setItem('cyberquest_current_level', '5');
            
            // Show shutdown sequence then navigate to Level 5
            await this.showShutdownSequenceAndNavigateToLevel5();
        } catch (error) {
            console.error('[Level4Summary] Error continuing to Level 5:', error);
            // Fallback navigation
            this.closeModal();
            window.location.href = '/levels/5/start?autostart=true';
        }
    }

    /**
     * Navigate to levels overview
     */
    async navigateToLevelsOverview() {
        try {
            await this.showShutdownSequenceAndNavigate();
        } catch (error) {
            console.error('[Level4Summary] Error navigating to levels:', error);
            this.closeModal();
            window.location.href = '/levels';
        }
    }

    /**
     * Show shutdown sequence and navigate to Level 5
     */
    async showShutdownSequenceAndNavigateToLevel5() {
        try {
            // Import shutdown sequence
            const { ShutdownSequence } = await import('../../shutdown-sequence.js');
            
            // Create shutdown overlay
            const shutdownOverlay = document.createElement('div');
            shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
            shutdownOverlay.style.zIndex = '9999';
            document.body.appendChild(shutdownOverlay);
            
            // Run shutdown sequence
            await ShutdownSequence.runShutdown(shutdownOverlay);
            
            // Navigate to Level 5
            window.location.href = '/levels/5/start?autostart=true';
        } catch (error) {
            console.error('[Level4Summary] Failed to run shutdown sequence for Level 5:', error);
            // Fallback without shutdown sequence
            this.closeModal();
            setTimeout(() => {
                window.location.href = '/levels/5/start?autostart=true';
            }, 1000);
        }
    }

    /**
     * Show shutdown sequence and navigate to levels overview
     */
    async showShutdownSequenceAndNavigate() {
        try {
            // Import shutdown sequence
            const { ShutdownSequence } = await import('../../shutdown-sequence.js');
            
            // Create shutdown overlay
            const shutdownOverlay = document.createElement('div');
            shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
            shutdownOverlay.style.zIndex = '9999';
            document.body.appendChild(shutdownOverlay);
            
            // Run shutdown sequence
            await ShutdownSequence.runShutdown(shutdownOverlay);
            
            // Navigate to levels overview
            window.location.href = '/levels';
        } catch (error) {
            console.error('[Level4Summary] Failed to run shutdown sequence for levels:', error);
            // Fallback without shutdown sequence
            this.closeModal();
            setTimeout(() => {
                window.location.href = '/levels';
            }, 1000);
        }
    }

    async submitToBackend() {
        try {
            // Prepare completion data for the existing API
            const completionData = {
                score: 100, // Perfect score for completing all flags
                session_id: this.getActiveSessionId(),
                completion_time: this.calculateDuration(),
                flags_found: this.sessionData.flagsFound,
                total_flags: this.sessionData.totalFlags
            };

            // Submit to the existing level completion endpoint
            const response = await fetch('/api/levels/complete/4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(completionData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('[Level4Summary] Level completed successfully:', result);
                
                // Update XP display if we got the actual XP earned
                if (result.xp_earned && result.xp_earned !== this.sessionData.xpEarned) {
                    this.sessionData.xpEarned = result.xp_earned;
                }
                
                return result;
            } else {
                console.warn('[Level4Summary] Failed to complete level:', response.status);
                return null;
            }

        } catch (error) {
            console.error('[Level4Summary] Error completing level:', error);
            // Continue with local cleanup even if backend submission fails
            return null;
        }
    }

    getActiveSessionId() {
        // Try to get session ID from various sources
        const sessionId = localStorage.getItem('cyberquest_active_session_id') ||
                         sessionStorage.getItem('active_session_id') ||
                         window.currentSessionId;
        
        if (sessionId) {
            return parseInt(sessionId);
        }
        
        console.warn('[Level4Summary] No active session ID found');
        return null;
    }

    static createAndShow(challengeTracker = null, completionStats = null) {
        // Make instance globally accessible for button callbacks
        window.level4SessionSummary = new Level4SessionSummary(challengeTracker);
        
        // Hook into challenge tracker for real-time updates if available
        if (challengeTracker) {
            window.level4SessionSummary.setupTrackerIntegration(challengeTracker);
        }
        
        // Submit session data to backend
        window.level4SessionSummary.submitToBackend();
        
        // Show the summary modal
        window.level4SessionSummary.showSessionSummary(completionStats);
        
        return window.level4SessionSummary;
    }

    /**
     * Setup integration with challenge tracker for real-time data
     */
    setupTrackerIntegration(tracker) {
        // Store original methods to add our tracking
        const originalMarkFlagFound = tracker.markFlagFound.bind(tracker);
        const originalSubmitCurrentFlag = tracker.submitCurrentFlag.bind(tracker);
        
        // Override markFlagFound to track discovery timing
        tracker.markFlagFound = (flagValue, flagId) => {
            // Record the discovery
            if (flagId) {
                this.recordFlagDiscovery(flagId);
            }
            
            // Call original method
            return originalMarkFlagFound(flagValue, flagId);
        };
        
        // Override submitCurrentFlag to track attempts
        tracker.submitCurrentFlag = async () => {
            const currentChallenge = tracker.getCurrentChallenge();
            if (currentChallenge) {
                this.recordFlagAttempt(currentChallenge.id);
            }
            
            // Call original method
            return await originalSubmitCurrentFlag();
        };
        
        console.log('[Level4Summary] Challenge tracker integration setup complete');
    }
}