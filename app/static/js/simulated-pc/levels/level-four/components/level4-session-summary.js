import { BaseModalComponent } from '../../../shared/base-modal-component.js';

export class Level4SessionSummary extends BaseModalComponent {
    constructor(challengeTracker = null) {
        super();
        this.challengeTracker = challengeTracker;
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

                <!-- Assessment Categories -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                        <i class="bi bi-shield-check mr-2"></i>
                        Security Assessment Areas
                    </h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${this.sessionData.categories.map(category => `
                            <div class="bg-gray-800 rounded px-3 py-2 text-sm border border-gray-700 flex items-center">
                                <i class="bi bi-check-circle text-green-400 mr-2"></i>
                                ${category}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Achievements -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
                        <i class="bi bi-trophy mr-2"></i>
                        Achievements Unlocked
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        ${this.sessionData.achievements.map(achievement => `
                            <span class="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                <i class="bi bi-award mr-1"></i>
                                ${achievement}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Professional Summary -->
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
                    <h3 class="text-lg font-semibold text-green-300 mb-2 flex items-center">
                        <i class="bi bi-briefcase mr-2"></i>
                        Professional Assessment
                    </h3>
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Your systematic approach to penetration testing demonstrates professional-level cybersecurity skills. 
                        You've successfully identified critical vulnerabilities across multiple attack vectors using industry-standard 
                        methodologies including OSINT, configuration analysis, and forensic investigation techniques.
                    </p>
                </div>

                <!-- Next Steps -->
                <div class="text-center">
                    <p class="text-gray-400 text-sm mb-4">
                        <i class="bi bi-lightbulb mr-1"></i>
                        Outstanding performance! You've mastered ethical hacking fundamentals.
                    </p>
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
                        <button 
                            id="view-profile-btn"
                            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center"
                        >
                            <i class="bi bi-person-circle mr-2"></i>
                            <span>View Profile</span>
                        </button>
                    </div>
                    <div class="mt-4 text-center">
                        <p class="text-gray-500 text-xs">
                            <i class="bi bi-trophy mr-1"></i>
                            Level 4 completed! You've earned ${this.sessionData.xpEarned} XP in Advanced Penetration Testing
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    navigateToLevels() {
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
        const profileBtn = document.getElementById('view-profile-btn');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.continueToLevel5());
        }
        
        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => this.navigateToLevelsOverview());
        }
        
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.viewProfile());
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
        
        // Submit session data to backend
        window.level4SessionSummary.submitToBackend();
        
        // Show the summary modal
        window.level4SessionSummary.showSessionSummary(completionStats);
        
        return window.level4SessionSummary;
    }
}