import { BaseModalComponent } from '../../shared/base-modal-component.js';

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
        
        // Auto-close after 15 seconds and navigate
        setTimeout(() => {
            this.closeModal();
            this.navigateToLevels();
        }, 15000);
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
                        Ready for advanced cybersecurity challenges? Continue your journey!
                    </p>
                    <div class="flex space-x-3 justify-center">
                        <button 
                            onclick="window.level4SessionSummary?.navigateToLevels()" 
                            class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded font-medium transition-colors flex items-center space-x-2"
                        >
                            <i class="bi bi-arrow-right-circle"></i>
                            <span>Continue Journey</span>
                        </button>
                        <button 
                            onclick="window.level4SessionSummary?.viewProfile()" 
                            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center space-x-2"
                        >
                            <i class="bi bi-person-circle"></i>
                            <span>View Profile</span>
                        </button>
                    </div>
                </div>

                <!-- Auto-close notice -->
                <div class="text-center mt-4 text-xs text-gray-500">
                    <i class="bi bi-clock mr-1"></i>
                    This summary will automatically close in 15 seconds
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