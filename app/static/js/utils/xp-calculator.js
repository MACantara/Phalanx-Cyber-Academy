/**
 * Centralized XP Calculator
 * Handles XP calculations, awarding, and performance-based tracking
 * Provides consistent API calls matching the backend XPCalculator and XPManager
 */

class XPCalculator {
    constructor() {
        // Configuration will be loaded from backend
        this.config = null;
        this.configLoaded = false;
        this.configPromise = null;
        
        // Fallback configuration
        this.fallbackConfig = {
            base_xp: {
                'easy': 50,
                'medium': 100,
                'intermediate': 150,
                'hard': 200,
                'expert': 300
            },
            score_multipliers: {
                'perfect': 2.0,     // 100% score
                'excellent': 1.5,   // 90-99% score
                'good': 1.2,        // 80-89% score
                'average': 1.0,     // 70-79% score
                'below_average': 0.8  // <70% score
            },
            time_bonus_thresholds: {
                'lightning': 1.5,   // Completed very quickly
                'fast': 1.2,        // Completed quickly
                'normal': 1.0,      // Normal completion time
                'slow': 0.9         // Took longer than expected
            },
            expected_times: {
                'easy': 300,    // 5 minutes
                'medium': 600,  // 10 minutes
                'hard': 900,    // 15 minutes
                'expert': 1200  // 20 minutes
            },
            first_time_bonus: 25
        };
        
        // Initialize configuration loading
        this.loadConfig();
    }

    /**
     * Load XP configuration from backend API
     * @returns {Promise<Object>} Configuration object
     */
    async loadConfig() {
        if (this.configLoaded && this.config) {
            return this.config;
        }
        
        // Return existing promise if already loading
        if (this.configPromise) {
            return this.configPromise;
        }
        
        this.configPromise = this._fetchConfig();
        return this.configPromise;
    }

    /**
     * Fetch configuration from API
     * @private
     */
    async _fetchConfig() {
        try {
            console.log('[XPCalculator] Loading configuration from backend...');
            
            const response = await fetch('/api/xp/config');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load XP configuration');
            }
            
            this.config = result.config;
            this.configLoaded = true;
            
            console.log('[XPCalculator] Configuration loaded successfully:', this.config);
            return this.config;
            
        } catch (error) {
            console.error('[XPCalculator] Failed to load configuration from backend, using fallback:', error);
            
            // Use fallback configuration
            this.config = { ...this.fallbackConfig };
            this.configLoaded = true;
            
            return this.config;
        }
    }

    /**
     * Get current configuration (async)
     * @returns {Promise<Object>} Configuration object
     */
    async getConfig() {
        if (!this.configLoaded) {
            await this.loadConfig();
        }
        return this.config || this.fallbackConfig;
    }

    /**
     * Get current configuration (sync, may return fallback if not loaded)
     * @returns {Object} Configuration object
     */
    getConfigSync() {
        return this.config || this.fallbackConfig;
    }

    /**
     * Calculate XP for performance (client-side preview)
     * This matches the backend calculation logic exactly
     * @param {number} levelId - Level ID
     * @param {number|null} score - Score (0-100)
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Difficulty level
     * @returns {Object} XP calculation breakdown
     */
    calculatePerformanceBasedXP(levelId, score = null, timeSpent = null, difficulty = 'medium') {
        try {
            const config = this.getConfigSync();
            
            // Get base XP for difficulty
            const baseXP = config.base_xp[difficulty.toLowerCase()] || config.base_xp['medium'];
            
            // Calculate score multiplier
            const scoreMultiplier = this.getScoreMultiplier(score);
            
            // Calculate time multiplier
            const timeMultiplier = this.getTimeMultiplier(levelId, timeSpent, difficulty);
            
            // Apply first-time completion bonus
            const firstTimeBonus = this.getFirstTimeBonus(levelId);
            
            // Calculate final XP
            const xpFromScore = baseXP * scoreMultiplier;
            const xpFromTime = xpFromScore * timeMultiplier;
            const totalXP = Math.floor(xpFromTime + firstTimeBonus);
            
            return {
                xp_earned: totalXP,
                breakdown: {
                    base_xp: baseXP,
                    score_multiplier: scoreMultiplier,
                    time_multiplier: timeMultiplier,
                    first_time_bonus: firstTimeBonus,
                    score_xp: Math.floor(xpFromScore),
                    time_xp: Math.floor(xpFromTime),
                    total_xp: totalXP
                },
                calculation_details: {
                    difficulty: difficulty,
                    score: score,
                    time_spent: timeSpent,
                    score_category: this.getScoreCategory(score),
                    time_category: this.getTimeCategory(levelId, timeSpent, difficulty)
                }
            };
        } catch (error) {
            console.error('[XPCalculator] Error calculating XP:', error);
            
            // Fallback calculation
            const fallbackConfig = this.fallbackConfig;
            const fallbackXP = fallbackConfig.base_xp[difficulty.toLowerCase()] || fallbackConfig.base_xp['medium'];
            return {
                xp_earned: fallbackXP,
                breakdown: {
                    base_xp: fallbackXP,
                    score_multiplier: 1.0,
                    time_multiplier: 1.0,
                    first_time_bonus: 0,
                    score_xp: fallbackXP,
                    time_xp: fallbackXP,
                    total_xp: fallbackXP
                },
                calculation_details: {
                    difficulty: difficulty,
                    score: score,
                    time_spent: timeSpent,
                    error: 'Used fallback calculation'
                }
            };
        }
    }

    /**
     * Get score multiplier based on score
     * @param {number|null} score - Score (0-100)
     * @returns {number} Score multiplier
     */
    getScoreMultiplier(score) {
        if (score === null || score === undefined) {
            return 1.0;
        }
        
        const config = this.getConfigSync();
        const multipliers = config.score_multipliers;
        
        if (score >= 100) {
            return multipliers['perfect'];
        } else if (score >= 90) {
            return multipliers['excellent'];
        } else if (score >= 80) {
            return multipliers['good'];
        } else if (score >= 70) {
            return multipliers['average'];
        } else {
            return multipliers['below_average'];
        }
    }

    /**
     * Get score category for display
     * @param {number|null} score - Score (0-100)
     * @returns {string} Score category
     */
    getScoreCategory(score) {
        if (score === null || score === undefined) {
            return 'unknown';
        }
        
        if (score >= 100) {
            return 'perfect';
        } else if (score >= 90) {
            return 'excellent';
        } else if (score >= 80) {
            return 'good';
        } else if (score >= 70) {
            return 'average';
        } else {
            return 'below_average';
        }
    }

    /**
     * Get time multiplier based on completion time
     * @param {number} levelId - Level ID
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Difficulty level
     * @returns {number} Time multiplier
     */
    getTimeMultiplier(levelId, timeSpent, difficulty) {
        if (timeSpent === null || timeSpent === undefined) {
            return 1.0;
        }
        
        const config = this.getConfigSync();
        const thresholds = config.time_bonus_thresholds;
        const expectedTime = this.getExpectedTime(levelId, difficulty);
        
        if (timeSpent <= expectedTime * 0.5) {
            return thresholds['lightning'];
        } else if (timeSpent <= expectedTime * 0.75) {
            return thresholds['fast'];
        } else if (timeSpent <= expectedTime * 1.5) {
            return thresholds['normal'];
        } else {
            return thresholds['slow'];
        }
    }

    /**
     * Get time category for display
     * @param {number} levelId - Level ID
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Difficulty level
     * @returns {string} Time category
     */
    getTimeCategory(levelId, timeSpent, difficulty) {
        if (timeSpent === null || timeSpent === undefined) {
            return 'unknown';
        }
        
        const expectedTime = this.getExpectedTime(levelId, difficulty);
        
        if (timeSpent <= expectedTime * 0.5) {
            return 'lightning';
        } else if (timeSpent <= expectedTime * 0.75) {
            return 'fast';
        } else if (timeSpent <= expectedTime * 1.5) {
            return 'normal';
        } else {
            return 'slow';
        }
    }

    /**
     * Get expected completion time in seconds
     * @param {number} levelId - Level ID
     * @param {string} difficulty - Difficulty level
     * @returns {number} Expected time in seconds
     */
    getExpectedTime(levelId, difficulty) {
        const config = this.getConfigSync();
        const expectedTimes = config.expected_times;
        
        return expectedTimes[difficulty.toLowerCase()] || expectedTimes['medium'];
    }

    /**
     * Get first-time completion bonus
     * @param {number} levelId - Level ID
     * @returns {number} Bonus XP
     */
    getFirstTimeBonus(levelId) {
        const config = this.getConfigSync();
        // This would typically check the database, but for client-side preview
        // we use the configured first-time bonus
        return config.first_time_bonus || 25;
    }

    /**
     * Calculate XP using backend API (server-side calculation)
     * @param {number} levelId - Level ID
     * @param {number|null} score - Score (0-100)
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Difficulty level
     * @returns {Promise<Object>} XP calculation result
     */
    async calculateXPFromAPI(levelId, score = null, timeSpent = null, difficulty = 'medium') {
        try {
            console.log(`[XPCalculator] Calculating XP via API: Level ${levelId}, Score: ${score}, Time: ${timeSpent}, Difficulty: ${difficulty}`);
            
            const response = await fetch('/api/xp/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level_id: levelId,
                    score: score,
                    time_spent: timeSpent,
                    difficulty: difficulty
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to calculate XP');
            }

            console.log('[XPCalculator] XP calculated via API:', result.calculation);
            return result.calculation;
            
        } catch (error) {
            console.error('[XPCalculator] API calculation failed, using client-side fallback:', error);
            // Fallback to client-side calculation with loaded config
            return await this.calculatePerformanceBasedXPAsync(levelId, score, timeSpent, difficulty);
        }
    }

    /**
     * Calculate XP for performance (client-side preview with async config loading)
     * This ensures configuration is loaded from backend before calculation
     * @param {number} levelId - Level ID
     * @param {number|null} score - Score (0-100)
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Difficulty level
     * @returns {Promise<Object>} XP calculation breakdown
     */
    async calculatePerformanceBasedXPAsync(levelId, score = null, timeSpent = null, difficulty = 'medium') {
        try {
            // Ensure configuration is loaded
            const config = await this.getConfig();
            
            // Get base XP for difficulty
            const baseXP = config.base_xp[difficulty.toLowerCase()] || config.base_xp['medium'];
            
            // Calculate score multiplier
            const scoreMultiplier = this.getScoreMultiplier(score);
            
            // Calculate time multiplier
            const timeMultiplier = this.getTimeMultiplier(levelId, timeSpent, difficulty);
            
            // Apply first-time completion bonus
            const firstTimeBonus = this.getFirstTimeBonus(levelId);
            
            // Calculate final XP
            const xpFromScore = baseXP * scoreMultiplier;
            const xpFromTime = xpFromScore * timeMultiplier;
            const totalXP = Math.floor(xpFromTime + firstTimeBonus);
            
            return {
                xp_earned: totalXP,
                breakdown: {
                    base_xp: baseXP,
                    score_multiplier: scoreMultiplier,
                    time_multiplier: timeMultiplier,
                    first_time_bonus: firstTimeBonus,
                    score_xp: Math.floor(xpFromScore),
                    time_xp: Math.floor(xpFromTime),
                    total_xp: totalXP
                },
                calculation_details: {
                    difficulty: difficulty,
                    score: score,
                    time_spent: timeSpent,
                    score_category: this.getScoreCategory(score),
                    time_category: this.getTimeCategory(levelId, timeSpent, difficulty)
                }
            };
        } catch (error) {
            console.error('[XPCalculator] Error calculating XP (async):', error);
            
            // Fallback calculation
            const fallbackConfig = this.fallbackConfig;
            const fallbackXP = fallbackConfig.base_xp[difficulty.toLowerCase()] || fallbackConfig.base_xp['medium'];
            return {
                xp_earned: fallbackXP,
                breakdown: {
                    base_xp: fallbackXP,
                    score_multiplier: 1.0,
                    time_multiplier: 1.0,
                    first_time_bonus: 0,
                    score_xp: fallbackXP,
                    time_xp: fallbackXP,
                    total_xp: fallbackXP
                },
                calculation_details: {
                    difficulty: difficulty,
                    score: score,
                    time_spent: timeSpent,
                    error: 'Used fallback calculation'
                }
            };
        }
    }

    /**
     * Award XP using backend API
     * @param {number} levelId - Level ID
     * @param {number|null} score - Score (0-100)
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Difficulty level
     * @param {number|null} sessionId - Session ID
     * @param {string} reason - Reason for XP award
     * @returns {Promise<Object>} XP award result
     */
    async awardXP(levelId, score = null, timeSpent = null, difficulty = 'medium', sessionId = null, reason = 'level_completion') {
        try {
            console.log(`[XPCalculator] Awarding XP: Level ${levelId}, Score: ${score}, Time: ${timeSpent}, Session: ${sessionId}`);
            
            const response = await fetch('/api/xp/award', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level_id: levelId,
                    score: score,
                    time_spent: timeSpent,
                    difficulty: difficulty,
                    session_id: sessionId,
                    reason: reason
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to award XP');
            }

            console.log('[XPCalculator] XP awarded successfully:', result.result);
            return result.result;
            
        } catch (error) {
            console.error('[XPCalculator] Failed to award XP:', error);
            throw error;
        }
    }

    /**
     * Award session XP (for levels or Blue Team vs Red Team Mode)
     * @param {string} sessionName - Session name
     * @param {number|null} score - Score (0-100)
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {number|null} levelId - Level ID (null for non-level sessions)
     * @param {number|null} sessionId - Session ID
     * @param {string} reason - Reason for XP award
     * @returns {Promise<Object>} XP award result
     */
    async awardSessionXP(sessionName, score = null, timeSpent = null, levelId = null, sessionId = null, reason = 'session_completion') {
        try {
            console.log(`[XPCalculator] Awarding session XP: ${sessionName}, Score: ${score}, Time: ${timeSpent}, Level: ${levelId}, Session: ${sessionId}`);
            
            const response = await fetch('/api/xp/session/award', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_name: sessionName,
                    score: score,
                    time_spent: timeSpent,
                    level_id: levelId,
                    session_id: sessionId,
                    reason: reason
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to award session XP');
            }

            console.log('[XPCalculator] Session XP awarded successfully:', result.result);
            return result.result;
            
        } catch (error) {
            console.error('[XPCalculator] Failed to award session XP:', error);
            throw error;
        }
    }

    /**
     * Get user XP history
     * @param {number} limit - Number of entries to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Object>} XP history data
     */
    async getXPHistory(limit = 20, offset = 0) {
        try {
            const response = await fetch(`/api/xp/history?limit=${limit}&offset=${offset}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to get XP history');
            }

            return result;
            
        } catch (error) {
            console.error('[XPCalculator] Failed to get XP history:', error);
            throw error;
        }
    }

    /**
     * Get user level information
     * @returns {Promise<Object>} User level data
     */
    async getUserLevel() {
        try {
            const response = await fetch('/api/xp/user-level');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to get user level');
            }

            return result;
            
        } catch (error) {
            console.error('[XPCalculator] Failed to get user level:', error);
            throw error;
        }
    }

    /**
     * Get XP leaderboard
     * @param {number} limit - Number of entries to fetch
     * @returns {Promise<Object>} Leaderboard data
     */
    async getLeaderboard(limit = 10) {
        try {
            const response = await fetch(`/api/xp/leaderboard?limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to get leaderboard');
            }

            return result;
            
        } catch (error) {
            console.error('[XPCalculator] Failed to get leaderboard:', error);
            throw error;
        }
    }

    /**
     * Format XP calculation for display
     * @param {Object} calculation - XP calculation result
     * @returns {Object} Formatted display data
     */
    formatXPDisplay(calculation) {
        if (!calculation || !calculation.breakdown) {
            return {
                totalXP: 0,
                displayText: 'XP calculation unavailable',
                breakdown: []
            };
        }

        const breakdown = [];
        
        // Base XP
        breakdown.push({
            label: 'Base XP',
            value: calculation.breakdown.base_xp,
            description: `${calculation.calculation_details.difficulty} difficulty`
        });
        
        // Score bonus
        if (calculation.calculation_details.score !== null) {
            const scoreBonus = calculation.breakdown.score_xp - calculation.breakdown.base_xp;
            breakdown.push({
                label: 'Score Bonus',
                value: scoreBonus,
                description: `${calculation.calculation_details.score_category} performance (${calculation.calculation_details.score}%)`
            });
        }
        
        // Time bonus
        if (calculation.calculation_details.time_spent !== null) {
            const timeBonus = calculation.breakdown.time_xp - calculation.breakdown.score_xp;
            breakdown.push({
                label: 'Time Bonus',
                value: timeBonus,
                description: `${calculation.calculation_details.time_category} completion`
            });
        }
        
        // First time bonus
        if (calculation.breakdown.first_time_bonus > 0) {
            breakdown.push({
                label: 'First Time Bonus',
                value: calculation.breakdown.first_time_bonus,
                description: 'First completion of this level'
            });
        }

        return {
            totalXP: calculation.xp_earned,
            displayText: `You earned ${calculation.xp_earned} XP!`,
            breakdown: breakdown,
            details: calculation.calculation_details
        };
    }

    /**
     * Pre-load configuration for better performance
     * Call this during application initialization
     * @returns {Promise<boolean>} True if config loaded successfully
     */
    async preloadConfig() {
        try {
            await this.loadConfig();
            return this.configLoaded;
        } catch (error) {
            console.warn('[XPCalculator] Failed to preload configuration:', error);
            return false;
        }
    }

    /**
     * Check if configuration is loaded
     * @returns {boolean} True if config is loaded
     */
    isConfigLoaded() {
        return this.configLoaded;
    }

    /**
     * Reload configuration from backend
     * @returns {Promise<Object>} New configuration
     */
    async reloadConfig() {
        this.config = null;
        this.configLoaded = false;
        this.configPromise = null;
        return await this.loadConfig();
    }
}

// Create singleton instance
const xpCalculator = new XPCalculator();

// Preload configuration on module load
xpCalculator.preloadConfig().then(success => {
    if (success) {
        console.log('[XPCalculator] Configuration preloaded successfully');
    } else {
        console.warn('[XPCalculator] Configuration preload failed, will use fallback');
    }
}).catch(error => {
    console.warn('[XPCalculator] Configuration preload error:', error);
});

// Export for ES6 modules and global access
export { XPCalculator, xpCalculator };

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.XPCalculator = XPCalculator;
    window.xpCalculator = xpCalculator;
}