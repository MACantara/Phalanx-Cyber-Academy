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
            flagsFound: 3,
            totalFlags: 3,
            completionRate: 100,
            categories: ['Environment Analysis', 'Configuration Review', 'Log Investigation', 'Forensic Analysis'],
            xpEarned: 0, // Will be calculated dynamically or from backend
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
     * Calculate performance-based XP award
     */
    calculatePerformanceBasedXP() {
        const LEVEL_ID = 4;
        const DIFFICULTY = 'hard'; // Level 4 difficulty
        
        // Base XP values by difficulty
        const BASE_XP = {
            'easy': 50,
            'medium': 100,
            'intermediate': 150,
            'hard': 200,
            'expert': 300
        };
        
        // Score multipliers
        const SCORE_MULTIPLIERS = {
            'perfect': 2.0,     // 100% score
            'excellent': 1.5,   // 90-99% score
            'good': 1.2,        // 80-89% score
            'average': 1.0,     // 70-79% score
            'below_average': 0.8  // <70% score
        };
        
        // Time bonus thresholds
        const TIME_BONUS_THRESHOLDS = {
            'lightning': 1.5,   // Completed very quickly
            'fast': 1.2,        // Completed quickly
            'normal': 1.0,      // Normal completion time
            'slow': 0.9         // Took longer than expected
        };
        
        // Get base XP for difficulty
        const baseXP = BASE_XP[DIFFICULTY.toLowerCase()] || BASE_XP['medium'];
        
        // Calculate performance score and get score multiplier
        const performanceScore = this.calculatePerformanceScore();
        const scoreMultiplier = this.getScoreMultiplier(performanceScore, SCORE_MULTIPLIERS);
        
        // Calculate time multiplier
        const duration = this.sessionData.endTime - this.sessionData.startTime;
        const timeSpentSeconds = Math.round(duration / 1000);
        const timeMultiplier = this.getTimeMultiplier(LEVEL_ID, timeSpentSeconds, DIFFICULTY, TIME_BONUS_THRESHOLDS);
        
        // Apply first-time completion bonus
        const firstTimeBonus = this.getFirstTimeBonus(LEVEL_ID);
        
        // Calculate final XP
        const xpFromScore = baseXP * scoreMultiplier;
        const xpFromTime = xpFromScore * timeMultiplier;
        const totalXP = Math.round(xpFromTime + firstTimeBonus);
        
        console.log('[Level4Summary] XP calculation:', {
            baseXP,
            performanceScore: performanceScore + '%',
            scoreMultiplier,
            timeSpentSeconds,
            timeMultiplier,
            firstTimeBonus,
            xpFromScore: Math.round(xpFromScore),
            xpFromTime: Math.round(xpFromTime),
            totalXP
        });
        
        return {
            xpEarned: totalXP,
            breakdown: {
                baseXP,
                scoreMultiplier,
                timeMultiplier,
                firstTimeBonus,
                scoreXP: Math.round(xpFromScore),
                timeXP: Math.round(xpFromTime),
                totalXP
            }
        };
    }

    /**
     * Get score-based multiplier
     */
    getScoreMultiplier(score, scoreMultipliers) {
        if (score == null) {
            return 1.0;
        }
        
        if (score >= 100) {
            return scoreMultipliers['perfect'];
        } else if (score >= 90) {
            return scoreMultipliers['excellent'];
        } else if (score >= 80) {
            return scoreMultipliers['good'];
        } else if (score >= 70) {
            return scoreMultipliers['average'];
        } else {
            return scoreMultipliers['below_average'];
        }
    }

    /**
     * Get time-based multiplier
     */
    getTimeMultiplier(levelId, timeSpentSeconds, difficulty, timeBonusThresholds) {
        if (timeSpentSeconds == null) {
            return 1.0;
        }
        
        // Get expected time for this level/difficulty
        const expectedTime = this.getExpectedTime(levelId, difficulty);
        
        if (timeSpentSeconds <= expectedTime * 0.5) {
            return timeBonusThresholds['lightning'];
        } else if (timeSpentSeconds <= expectedTime * 0.75) {
            return timeBonusThresholds['fast'];
        } else if (timeSpentSeconds <= expectedTime * 1.5) {
            return timeBonusThresholds['normal'];
        } else {
            return timeBonusThresholds['slow'];
        }
    }

    /**
     * Get expected completion time in seconds
     */
    getExpectedTime(levelId, difficulty) {
        // Base times by difficulty (in seconds) - matching Python
        const baseTimes = {
            'easy': 300,    // 5 minutes
            'medium': 600,  // 10 minutes
            'hard': 900,    // 15 minutes
            'expert': 1200  // 20 minutes
        };
        
        return baseTimes[difficulty.toLowerCase()] || baseTimes['medium'];
    }

    /**
     * Get first-time completion bonus
     */
    getFirstTimeBonus(levelId) {
        // For now, return fixed bonus
        // In real implementation, this would check if user has completed this level before
        return 25; // Flat 25 XP bonus for first completion
    }

    /**
     * Calculate performance-based score for Level 4
     * Based on efficiency (attempts per flag) and completion time
     */
    calculatePerformanceScore() {
        const totalAttempts = this.calculateTotalAttempts();
        const totalFlags = this.sessionData.flagsFound;
        const duration = this.sessionData.endTime - this.sessionData.startTime;
        const minutesTaken = duration / (1000 * 60);
        
        // Base score for completing all flags
        let score = 100;
        
        // Efficiency scoring based on attempts per flag
        const avgAttemptsPerFlag = totalFlags > 0 ? totalAttempts / totalFlags : 1;
        
        if (avgAttemptsPerFlag <= 1.0) {
            // Perfect efficiency - all flags found on first try
            score *= 1.25; // 25% bonus
            console.log('[Level4Summary] Perfect efficiency bonus: 25%');
        } else if (avgAttemptsPerFlag <= 1.5) {
            // Excellent efficiency - very few failed attempts
            score *= 1.15; // 15% bonus
            console.log('[Level4Summary] Excellent efficiency bonus: 15%');
        } else if (avgAttemptsPerFlag <= 2.5) {
            // Good efficiency - some trial and error
            score *= 1.05; // 5% bonus
            console.log('[Level4Summary] Good efficiency bonus: 5%');
        } else if (avgAttemptsPerFlag > 4.0) {
            // Poor efficiency - many failed attempts
            score *= 0.8; // 20% penalty
            console.log('[Level4Summary] Poor efficiency penalty: -20%');
        } else if (avgAttemptsPerFlag > 3.0) {
            // Below average efficiency
            score *= 0.9; // 10% penalty
            console.log('[Level4Summary] Below average efficiency penalty: -10%');
        }
        // Normal efficiency (2.5-3.0 attempts) gets no modifier
        
        // Time performance scoring
        // Expected time ranges: Fast (< 20min), Good (20-30min), Normal (30-45min), Slow (> 45min)
        if (minutesTaken <= 15) {
            // Lightning fast completion
            score *= 1.3; // 30% time bonus
            console.log('[Level4Summary] Lightning fast completion bonus: 30%');
        } else if (minutesTaken <= 20) {
            // Very fast completion
            score *= 1.2; // 20% time bonus
            console.log('[Level4Summary] Very fast completion bonus: 20%');
        } else if (minutesTaken <= 30) {
            // Fast completion
            score *= 1.1; // 10% time bonus
            console.log('[Level4Summary] Fast completion bonus: 10%');
        } else if (minutesTaken <= 45) {
            // Normal completion time - no modifier
            console.log('[Level4Summary] Normal completion time - no modifier');
        } else if (minutesTaken <= 60) {
            // Slow completion
            score *= 0.95; // 5% time penalty
            console.log('[Level4Summary] Slow completion penalty: -5%');
        } else {
            // Very slow completion
            score *= 0.85; // 15% time penalty
            console.log('[Level4Summary] Very slow completion penalty: -15%');
        }
        
        // Ensure score stays within reasonable bounds
        const finalScore = Math.max(50, Math.min(100, Math.round(score)));
        
        console.log('[Level4Summary] Performance calculation:', {
            totalAttempts,
            totalFlags,
            avgAttemptsPerFlag: Math.round(avgAttemptsPerFlag * 10) / 10,
            minutesTaken: Math.round(minutesTaken),
            rawScore: Math.round(score),
            finalScore
        });
        
        return finalScore;
    }

    /**
     * Get efficiency rating based on attempts per flag
     */
    getEfficiencyRating(totalAttempts, totalFlags) {
        const avgAttempts = totalFlags > 0 ? totalAttempts / totalFlags : 1;
        
        if (avgAttempts <= 1.0) return 'Perfect';
        if (avgAttempts <= 1.5) return 'Excellent';
        if (avgAttempts <= 2.5) return 'Good';
        if (avgAttempts <= 3.5) return 'Average';
        return 'Poor';
    }

    /**
     * Get time performance rating
     */
    getTimeRating(minutes) {
        if (minutes <= 15) return 'Lightning';
        if (minutes <= 20) return 'Very Fast';
        if (minutes <= 30) return 'Fast';
        if (minutes <= 45) return 'Normal';
        if (minutes <= 60) return 'Slow';
        return 'Very Slow';
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
                <div class="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
                    <div class="text-gray-400 text-sm sm:text-base break-words">
                        <i class="bi bi-info-circle mr-2"></i>
                        <span>Flag details not available - tracker data missing</span>
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
                <div class="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 min-h-0 overflow-hidden">
                    <div class="flex items-center space-x-3 min-w-0 flex-1">
                        <div class="flex items-center flex-shrink-0">
                            ${isCompleted ? 
                                '<i class="bi bi-check-circle-fill text-green-400 text-lg sm:text-xl"></i>' : 
                                '<i class="bi bi-circle text-gray-500 text-lg sm:text-xl"></i>'
                            }
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="font-semibold text-white text-sm sm:text-base truncate">${flag.name || flag.id}</div>
                            <div class="text-xs sm:text-sm text-gray-400 truncate">${flag.id}</div>
                            ${flag.category ? `<div class="text-xs text-gray-500 truncate">${flag.category}</div>` : ''}
                        </div>
                    </div>
                    <div class="text-left sm:text-right flex-shrink-0">
                        ${isCompleted ? `
                            <div class="text-sm text-green-400 font-semibold flex items-center sm:justify-end">
                                <i class="bi bi-trophy mr-1"></i>
                                <span>Found!</span>
                            </div>
                            <div class="text-xs sm:text-sm text-gray-400 mt-1">
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
            <div class="text-xs mt-1 flex sm:justify-end">
                <span class="${color} px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
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
        
        // Apply responsive styling to modal after it's shown
        setTimeout(() => {
            this.applyResponsiveModalStyling();
            this.bindNavigationEvents();
        }, 100);
    }

    /**
     * Apply responsive styling to the modal container
     */
    applyResponsiveModalStyling() {
        const modal = document.getElementById('level4-summary-modal');
        if (modal) {
            // Ensure modal is responsive across all screen sizes
            modal.className = modal.className.replace(
                /max-w-\S+/g, 
                'max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'
            );
            
            // Add responsive width classes if not present
            if (!modal.className.includes('max-w-')) {
                modal.classList.add('max-w-xs', 'sm:max-w-lg', 'md:max-w-2xl', 'lg:max-w-4xl', 'xl:max-w-5xl');
            }
            
            // Ensure proper mobile padding and margins
            modal.classList.add('mx-2', 'sm:mx-4', 'lg:mx-auto');
            
            // Set appropriate height constraints for mobile
            modal.style.maxHeight = '95vh';
            modal.style.overflowY = 'auto';
            
            // Apply webkit scrolling for smooth mobile experience
            modal.style.webkitOverflowScrolling = 'touch';
        }

        // Apply responsive styling to modal backdrop
        const backdrop = document.querySelector('.modal-backdrop, [class*="modal"]');
        if (backdrop && !backdrop.classList.contains('responsive-applied')) {
            backdrop.classList.add('p-2', 'sm:p-4', 'lg:p-8', 'responsive-applied');
            backdrop.style.overflowY = 'auto';
        }
    }

    createSummaryContent() {
        const duration = this.calculateDuration();
        const totalAttempts = this.calculateTotalAttempts();
        const avgAttemptsPerFlag = this.sessionData.flagsFound > 0 ? totalAttempts / this.sessionData.flagsFound : 0;
        const performanceScore = this.calculatePerformanceScore();
        const xpCalculation = this.calculatePerformanceBasedXP();
        const performanceBasedXP = xpCalculation.xpEarned;
        
        return `
            <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-3 sm:p-4 lg:p-6 rounded-lg max-w-full overflow-hidden">
                <!-- Header Section -->
                <div class="text-center mb-4 sm:mb-6">
                    <div class="text-3xl sm:text-4xl mb-2">🎉</div>
                    <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400 mb-2 break-words">Assessment Complete!</h2>
                    <p class="text-sm sm:text-base text-gray-300 px-2">White Hat Penetration Test Successfully Completed</p>
                </div>

                <!-- Performance-Based XP Banner -->
                <div class="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 border border-purple-500/30">
                    <div class="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4 text-center sm:text-left">
                        <i class="bi bi-trophy-fill text-3xl sm:text-4xl text-yellow-400 mb-2 sm:mb-0 sm:mr-3"></i>
                        <div class="min-w-0 flex-1">
                            <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-white break-words">Performance-Based XP Awarded!</h3>
                            <p class="text-sm sm:text-base text-green-100 break-words">Your reward reflects efficiency, speed, and CTF expertise</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div class="bg-green-900/50 rounded-lg p-3 text-center">
                            <div class="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">${Math.round(avgAttemptsPerFlag * 10) / 10}</div>
                            <div class="text-xs sm:text-sm text-green-200 break-words">Avg Attempts/Flag</div>
                            <div class="text-xs text-gray-300 capitalize break-words">${this.getEfficiencyRating(totalAttempts, this.sessionData.flagsFound)}</div>
                        </div>
                        <div class="bg-blue-900/50 rounded-lg p-3 text-center">
                            <div class="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">${duration}</div>
                            <div class="text-xs sm:text-sm text-blue-200">Completion Time</div>
                            <div class="text-xs text-gray-300 capitalize break-words">${this.getTimeRating((this.sessionData.endTime - this.sessionData.startTime) / (1000 * 60))}</div>
                        </div>
                        <div class="bg-purple-900/50 rounded-lg p-3 text-center">
                            <div class="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">${performanceScore}%</div>
                            <div class="text-xs sm:text-sm text-purple-200">Performance Score</div>
                            <div class="text-xs text-gray-300 break-words">Dynamic XP Multiplier</div>
                        </div>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 text-center border border-gray-700 min-h-0">
                        <div class="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 break-words">${this.sessionData.flagsFound}/${this.sessionData.totalFlags}</div>
                        <div class="text-xs sm:text-sm text-gray-400 break-words">Flags Discovered</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 text-center border border-gray-700 min-h-0">
                        <div class="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">${duration}</div>
                        <div class="text-xs sm:text-sm text-gray-400">Completion Time</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 text-center border border-gray-700 min-h-0">
                        <div class="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">${this.sessionData.completionRate}%</div>
                        <div class="text-xs sm:text-sm text-gray-400">Success Rate</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 text-center border border-gray-700 min-h-0">
                        <div class="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">${this.sessionData.xpEarned || performanceBasedXP}</div>
                        <div class="text-xs sm:text-sm text-gray-400">XP Earned</div>
                        <div class="text-xs text-gray-500 mt-1">Performance-Based</div>
                    </div>
                </div>

                <!-- Flag Details -->
                <div class="mb-4 sm:mb-6 overflow-hidden">
                    <h3 class="text-base sm:text-lg lg:text-xl font-semibold text-blue-300 mb-3 flex items-center break-words">
                        <i class="bi bi-flag-fill mr-2 flex-shrink-0"></i>
                        <span class="min-w-0">Flag Discovery Details</span>
                    </h3>
                    <div class="space-y-2 max-w-full overflow-hidden">
                        ${this.generateFlagDetails()}
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="text-center px-2 sm:px-0">
                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch max-w-full">
                        <button 
                            id="continue-level5-btn"
                            class="flex-1 sm:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 active:from-green-700 active:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center text-sm sm:text-base lg:text-lg touch-manipulation min-h-[48px] sm:min-h-[52px]"
                        >
                            <i class="bi bi-arrow-right-circle mr-2 flex-shrink-0"></i>
                            <span class="min-w-0 truncate">Continue to Level 5</span>
                        </button>
                        <button 
                            id="levels-overview-btn"
                            class="flex-1 sm:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center text-sm sm:text-base lg:text-lg touch-manipulation min-h-[48px] sm:min-h-[52px]"
                        >
                            <i class="bi bi-grid mr-2 flex-shrink-0"></i>
                            <span class="min-w-0 truncate">Back to Levels</span>
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
            const { ShutdownSequence } = await import('../../../shutdown-sequence.js');
            
            // Create shutdown overlay
            const shutdownOverlay = document.createElement('div');
            shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
            shutdownOverlay.style.zIndex = '10000';
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
            const { ShutdownSequence } = await import('../../../shutdown-sequence.js');
            
            // Create shutdown overlay
            const shutdownOverlay = document.createElement('div');
            shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
            shutdownOverlay.style.zIndex = '10000';
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
            console.log('[Level4Summary] Submitting to backend with centralized system');

            const sessionId = this.getActiveSessionId();
            
            if (!sessionId) {
                console.warn('[Level4Summary] No session ID available - cannot submit to backend');
                return null;
            }

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            // First, attach to the existing session that was started externally
            const startTime = parseInt(localStorage.getItem('cyberquest_level_4_start_time') || Date.now());
            progressManager.attachToExistingSession(
                sessionId,
                4, // Level ID
                'The-White-Hat-Test', // Level name
                'hard', // Difficulty
                startTime
            );

            // Calculate performance-based score and XP
            const performanceScore = this.calculatePerformanceScore();
            const xpCalculation = this.calculatePerformanceBasedXP();
            const performanceBasedXP = xpCalculation.xpEarned;
            const totalAttempts = this.calculateTotalAttempts();
            const duration = this.sessionData.endTime - this.sessionData.startTime;
            const timeSpentSeconds = Math.round(duration / 1000);
            
            // Complete level using centralized system
            const sessionResult = await progressManager.completeLevel(performanceScore, {
                flagsFound: this.sessionData.flagsFound,
                totalFlags: this.sessionData.totalFlags,
                totalAttempts: totalAttempts,
                averageAttemptsPerFlag: Math.round((totalAttempts / this.sessionData.flagsFound) * 10) / 10,
                completionTimeMinutes: Math.round(duration / (1000 * 60)),
                efficiencyRating: this.getEfficiencyRating(totalAttempts, this.sessionData.flagsFound),
                timeRating: this.getTimeRating(duration / (1000 * 60)),
                categoriesCompleted: this.categorizeCompletedChallenges(),
                performanceScore: performanceScore,
                calculatedXP: performanceBasedXP,
                xpBreakdown: xpCalculation.breakdown,
                timeSpent: timeSpentSeconds,
                flagTimings: Object.fromEntries(this.flagTimings),
                flagAttempts: Object.fromEntries(this.flagAttempts),
                completionTime: duration
            });

            if (sessionResult) {
                console.log('[Level4Summary] Session ended successfully with centralized system:', sessionResult);
                
                // Update XP display with the actual XP earned from session completion
                const xpAwarded = sessionResult.xp ? sessionResult.xp.xp_awarded : 
                                 (sessionResult.session ? sessionResult.session.xp_awarded : null);
                
                if (xpAwarded && xpAwarded !== this.sessionData.xpEarned) {
                    this.sessionData.xpEarned = xpAwarded;
                    
                    // Update the displayed XP value in real-time
                    const xpDisplay = document.querySelector('#level4-summary-modal .text-yellow-400');
                    if (xpDisplay) {
                        xpDisplay.textContent = xpAwarded;
                    }
                    
                    console.log(`[Level4Summary] XP updated from ${this.sessionData.xpEarned} to ${xpAwarded} based on performance`);
                }
                
                // Clear the active session since it's now completed
                localStorage.removeItem('cyberquest_active_session_id');
                sessionStorage.removeItem('active_session_id');
                window.currentSessionId = null;
                
                // Mark Level 4 as completed in localStorage
                localStorage.setItem('cyberquest_level_4_completed', 'true');
                localStorage.setItem('cyberquest_level_4_completion_time', Date.now());

                // Show XP earned notification
                if (window.ToastManager && xpAwarded) {
                    window.ToastManager.showToast(
                        `Level completed! You earned ${xpAwarded} XP!`, 
                        'success'
                    );
                }
                
                return sessionResult;
            } else {
                console.error('[Level4Summary] Centralized session end failed: no result returned');
            }
        } catch (error) {
            console.error('[Level4Summary] Error submitting with centralized system:', error);
        }
    }

    getActiveSessionId() {
        // Try to get session ID from various sources
        const sessionId = localStorage.getItem('cyberquest_active_session_id') ||
                         sessionStorage.getItem('active_session_id') ||
                         window.currentSessionId;
        
        console.log('[Level4Summary] Session ID debugging:', {
            localStorage_session: localStorage.getItem('cyberquest_active_session_id'),
            sessionStorage_session: sessionStorage.getItem('active_session_id'),
            window_session: window.currentSessionId,
            resolved_session: sessionId
        });
        
        if (sessionId) {
            const numericSessionId = parseInt(sessionId);
            if (isNaN(numericSessionId)) {
                console.warn('[Level4Summary] Session ID is not numeric:', sessionId);
                return null;
            }
            return numericSessionId;
        }
        
        console.warn('[Level4Summary] No active session ID found - session may not have been started properly');
        return null;
    }

    static createAndShow(challengeTracker = null, completionStats = null) {
        // Make instance globally accessible for button callbacks
        window.level4SessionSummary = new Level4SessionSummary(challengeTracker);
        
        // Hook into challenge tracker for real-time updates if available
        if (challengeTracker) {
            window.level4SessionSummary.setupTrackerIntegration(challengeTracker);
        }
        
        // Submit session data to backend immediately
        console.log('[Level4Summary] Attempting to submit completion data to backend...');
        window.level4SessionSummary.submitToBackend()
            .then(result => {
                if (result) {
                    console.log('[Level4Summary] Backend submission successful:', result);
                } else {
                    console.warn('[Level4Summary] Backend submission failed or returned null');
                }
            })
            .catch(error => {
                console.error('[Level4Summary] Backend submission error:', error);
            });
        
        // Show the summary modal
        window.level4SessionSummary.showSessionSummary(completionStats);
        
        // Add responsive event listeners for orientation changes and viewport resizing
        window.level4SessionSummary.addResponsiveEventListeners();
        
        return window.level4SessionSummary;
    }

    /**
     * Add event listeners for responsive behavior
     */
    addResponsiveEventListeners() {
        // Handle orientation changes and window resizing
        const handleResize = () => {
            setTimeout(() => {
                this.applyResponsiveModalStyling();
            }, 100);
        };

        // Listen for orientation changes (mobile devices)
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', handleResize);
        }

        // Listen for window resize (all devices)
        window.addEventListener('resize', handleResize);

        // Store cleanup function for later removal
        this.cleanupResponsiveListeners = () => {
            if (window.screen && window.screen.orientation) {
                window.screen.orientation.removeEventListener('change', handleResize);
            }
            window.removeEventListener('resize', handleResize);
        };
    }

    /**
     * Clean up responsive event listeners
     */
    cleanup() {
        if (this.cleanupResponsiveListeners) {
            this.cleanupResponsiveListeners();
        }
        
        // Call parent cleanup if it exists
        if (super.cleanup) {
            super.cleanup();
        }
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