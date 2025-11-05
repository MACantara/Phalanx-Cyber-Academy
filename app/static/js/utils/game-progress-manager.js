/**
 * Unified Game Progress Manager
 * Combines session management and XP tracking for easy use across all levels
 * Provides a simple, consistent interface for level developers
 */

// Import the individual managers
import { sessionManager } from './session-manager.js';
import { xpCalculator } from './xp-calculator.js';

class GameProgressManager {
    constructor() {
        this.sessionManager = sessionManager;
        this.xpCalculator = xpCalculator;
        this.currentLevel = null;
        this.startTime = null;
    }

    /**
     * Start a new level session with integrated XP tracking
     * @param {number|Object} levelId - Level ID or options object
     * @param {string} levelName - Level name (if levelId is not an object)
     * @param {string} difficulty - Level difficulty (if levelId is not an object)
     * @returns {Promise<Object>} Session and level data
     */
    async startLevel(levelId, levelName, difficulty = 'medium') {
        try {
            // Support both object-based and parameter-based calling conventions
            let options = {};
            if (typeof levelId === 'object' && levelId !== null) {
                // Object-based call (e.g., from Blue Team vs Red Team mode)
                options = levelId;
                levelId = options.levelId;
                levelName = options.sessionName || options.levelName || levelId;
                difficulty = options.difficulty || 'medium';
            }
            
            console.log(`[GameProgressManager] Starting level ${levelId}: ${levelName} (${difficulty})`);
            
            // For non-level modes (like Blue Team vs Red Team), pass null as level_id
            const sessionLevelId = (typeof levelId === 'number') ? levelId : null;
            
            // Start session
            const session = await this.sessionManager.startSession(levelName, sessionLevelId);
            
            // Store level data
            this.currentLevel = {
                id: levelId,
                name: levelName,
                difficulty: difficulty,
                sessionId: session.id,
                startTime: Date.now()
            };
            
            this.startTime = Date.now();
            
            // Store level info in localStorage for persistence
            localStorage.setItem('cyberquest_current_level', JSON.stringify(this.currentLevel));
            
            console.log('[GameProgressManager] Level started successfully:', this.currentLevel);
            return {
                success: true,
                session: session,
                session_id: session.id,
                level: this.currentLevel
            };
            
        } catch (error) {
            console.error('[GameProgressManager] Failed to start level:', error);
            throw error;
        }
    }

    /**
     * Attach to an existing session that was started externally
     * @param {number} sessionId - Existing session ID
     * @param {number} levelId - Level ID
     * @param {string} levelName - Level name
     * @param {string} difficulty - Level difficulty
     * @param {number} startTime - Session start time (timestamp)
     * @returns {Object} Level data
     */
    attachToExistingSession(sessionId, levelId, levelName, difficulty = 'medium', startTime = null) {
        try {
            console.log(`[GameProgressManager] Attaching to existing session ${sessionId} for level ${levelId}`);
            
            // Set up level data to match existing session
            this.currentLevel = {
                id: levelId,
                name: levelName,
                difficulty: difficulty,
                sessionId: sessionId,
                startTime: startTime || Date.now()
            };
            
            this.startTime = startTime || Date.now();
            
            // Update session manager's active session
            this.sessionManager.setActiveSessionId(sessionId);
            
            // Store level info in localStorage for persistence
            localStorage.setItem('cyberquest_current_level', JSON.stringify(this.currentLevel));
            
            console.log('[GameProgressManager] Successfully attached to existing session:', this.currentLevel);
            return this.currentLevel;
            
        } catch (error) {
            console.error('[GameProgressManager] Failed to attach to existing session:', error);
            throw error;
        }
    }

    /**
     * Complete the current level with XP calculation and awarding
     * @param {number|null} score - Final score (0-100)
     * @param {Object} additionalData - Additional completion data
     * @returns {Promise<Object>} Completion result with XP data
     */
    async completeLevel(score = null, additionalData = {}) {
        try {
            if (!this.currentLevel) {
                throw new Error('No active level to complete');
            }

            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            
            console.log(`[GameProgressManager] Completing level ${this.currentLevel.id}: Score ${score}, Time ${timeSpent}s`);
            
            // Calculate XP preview
            const xpPreview = await this.xpCalculator.calculateXPFromAPI(
                this.currentLevel.id,
                score,
                timeSpent,
                this.currentLevel.difficulty
            );
            
            // End session (this will automatically award XP via backend with 'session_completion' reason)
            const sessionResult = await this.sessionManager.endSession(score, {
                level_id: this.currentLevel.id,
                difficulty: this.currentLevel.difficulty,
                time_spent: timeSpent,
                ...additionalData
            });
            
            // Extract XP result from session end response
            // Session.end_session() already awards XP, so we don't need to call awardXP() again
            const xpResult = {
                xp_awarded: sessionResult.xp_awarded || 0,
                calculation_details: sessionResult.xp_calculation || xpPreview,
                new_total: sessionResult.new_total_xp
            };
            
            // Mark level as completed
            localStorage.setItem(`cyberquest_level_${this.currentLevel.id}_completed`, 'true');
            localStorage.setItem(`cyberquest_level_${this.currentLevel.id}_completion_time`, Date.now().toString());
            
            if (score !== null) {
                localStorage.setItem(`cyberquest_level_${this.currentLevel.id}_best_score`, score.toString());
            }
            
            // Clear current level
            const completedLevel = this.currentLevel;
            this.currentLevel = null;
            this.startTime = null;
            localStorage.removeItem('cyberquest_current_level');
            
            const result = {
                level: completedLevel,
                session: sessionResult,
                xp: xpResult,
                xp_preview: xpPreview,
                score: score,
                time_spent: timeSpent,
                completion_time: Date.now()
            };
            
            console.log('[GameProgressManager] Level completed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('[GameProgressManager] Failed to complete level:', error);
            throw error;
        }
    }

    /**
     * Start a non-level session (e.g., Blue Team vs Red Team Mode)
     * @param {string} sessionName - Session name
     * @returns {Promise<Object>} Session data
     */
    async startSession(sessionName) {
        try {
            console.log(`[GameProgressManager] Starting session: ${sessionName}`);
            
            const session = await this.sessionManager.startSession(sessionName);
            this.startTime = Date.now();
            
            console.log('[GameProgressManager] Session started successfully:', session);
            return session;
            
        } catch (error) {
            console.error('[GameProgressManager] Failed to start session:', error);
            throw error;
        }
    }

    /**
     * Complete a non-level session with XP awarding
     * @param {string} sessionName - Session name
     * @param {number|null} score - Final score (0-100)
     * @param {Object} additionalData - Additional session data
     * @returns {Promise<Object>} Completion result with XP data
     */
    async completeSession(sessionName, score = null, additionalData = {}) {
        try {
            const sessionId = this.sessionManager.getActiveSessionId();
            const timeSpent = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : null;
            
            console.log(`[GameProgressManager] Completing session: ${sessionName}, Score: ${score}, Time: ${timeSpent}s`);
            
            // End session (this will automatically award XP via backend with 'session_completion' reason)
            const sessionResult = await this.sessionManager.endSession(score, additionalData);
            
            // Extract XP result from session end response
            // Session.end_session() already awards XP, so we don't need to call awardSessionXP() again
            const xpResult = {
                xp_awarded: sessionResult.xp_awarded || 0,
                calculation_details: sessionResult.xp_calculation || {},
                new_total: sessionResult.new_total_xp
            };
            
            this.startTime = null;
            
            const result = {
                session_name: sessionName,
                session: sessionResult,
                xp: xpResult,
                score: score,
                time_spent: timeSpent,
                completion_time: Date.now()
            };
            
            console.log('[GameProgressManager] Session completed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('[GameProgressManager] Failed to complete session:', error);
            throw error;
        }
    }

    /**
     * Get current level information
     * @returns {Object|null} Current level data
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get current session information
     * @returns {Object|null} Current session data
     */
    getCurrentSession() {
        return this.sessionManager.getActiveSession();
    }

    /**
     * Get current session ID
     * @returns {number|null} Session ID
     */
    getCurrentSessionId() {
        return this.sessionManager.getActiveSessionId();
    }

    /**
     * Calculate XP preview without awarding
     * @param {number} levelId - Level ID
     * @param {number|null} score - Score (0-100)
     * @param {number|null} timeSpent - Time spent in seconds
     * @param {string} difficulty - Level difficulty
     * @returns {Promise<Object>} XP calculation preview
     */
    async previewXP(levelId, score = null, timeSpent = null, difficulty = 'medium') {
        return await this.xpCalculator.calculateXPFromAPI(levelId, score, timeSpent, difficulty);
    }

    /**
     * Get time spent on current level/session
     * @returns {number} Time in seconds
     */
    getTimeSpent() {
        if (!this.startTime) {
            return 0;
        }
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * Format time for display
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        if (!seconds || seconds < 0) {
            return '0 seconds';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes === 0) {
            return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
        } else if (minutes === 1 && remainingSeconds === 0) {
            return '1 minute';
        } else if (remainingSeconds === 0) {
            return `${minutes} minutes`;
        } else {
            return `${minutes}m ${remainingSeconds}s`;
        }
    }

    /**
     * Get user progress summary
     * @returns {Promise<Object>} Progress data
     */
    async getUserProgress() {
        try {
            const [levelInfo, xpHistory] = await Promise.all([
                this.xpCalculator.getUserLevel(),
                this.xpCalculator.getXPHistory(5, 0)
            ]);
            
            return {
                level: levelInfo,
                recent_xp: xpHistory.history || [],
                summary: xpHistory.summary || {}
            };
        } catch (error) {
            console.error('[GameProgressManager] Failed to get user progress:', error);
            return {
                level: { total_xp: 0, level_info: { level: 1, xp_for_next: 100 } },
                recent_xp: [],
                summary: {}
            };
        }
    }

    /**
     * Restore session state if available
     */
    restoreState() {
        try {
            const storedLevel = localStorage.getItem('cyberquest_current_level');
            if (storedLevel) {
                this.currentLevel = JSON.parse(storedLevel);
                this.startTime = this.currentLevel.startTime || Date.now();
                console.log('[GameProgressManager] Level state restored:', this.currentLevel);
            }
        } catch (error) {
            console.warn('[GameProgressManager] Failed to restore state:', error);
            localStorage.removeItem('cyberquest_current_level');
        }
    }

    /**
     * Clear all progress state (for debugging or reset)
     */
    clearState() {
        this.currentLevel = null;
        this.startTime = null;
        this.sessionManager.clearSession();
        
        // Clear level-specific localStorage
        localStorage.removeItem('cyberquest_current_level');
        
        console.log('[GameProgressManager] State cleared');
    }
}

// Create singleton instance
const gameProgressManager = new GameProgressManager();

// Initialize state on load
gameProgressManager.restoreState();

// Export for ES6 modules and global access
export { GameProgressManager, gameProgressManager };

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.GameProgressManager = GameProgressManager;
    window.gameProgressManager = gameProgressManager;
}

// Convenience functions for easy level integration
export const startLevel = (levelId, levelName, difficulty) => gameProgressManager.startLevel(levelId, levelName, difficulty);
export const completeLevel = (score, additionalData) => gameProgressManager.completeLevel(score, additionalData);
export const startSession = (sessionName) => gameProgressManager.startSession(sessionName);
export const completeSession = (sessionName, score, additionalData) => gameProgressManager.completeSession(sessionName, score, additionalData);
export const getCurrentSessionId = () => gameProgressManager.getCurrentSessionId();
export const getTimeSpent = () => gameProgressManager.getTimeSpent();
export const previewXP = (levelId, score, timeSpent, difficulty) => gameProgressManager.previewXP(levelId, score, timeSpent, difficulty);

// Make convenience functions available globally
if (typeof window !== 'undefined') {
    window.startLevel = startLevel;
    window.completeLevel = completeLevel;
    window.startSession = startSession;
    window.completeSession = completeSession;
    window.getCurrentSessionId = getCurrentSessionId;
    window.getTimeSpent = getTimeSpent;
    window.previewXP = previewXP;
}