/**
 * Centralized Session Manager
 * Handles session lifecycle management for all levels and Blue Team vs Red Team Mode
 * Provides consistent API calls and error handling
 */

class SessionManager {
    constructor() {
        this.activeSession = null;
        this.sessionStartTime = null;
        this.sessionData = {};
        
        // Initialize from localStorage if available
        this.loadSessionState();
    }

    /**
     * Start a new session
     * @param {string} sessionName - Name of the session (level name or mode name)
     * @param {number|null} levelId - Level ID if this is a level session
     * @returns {Promise<Object>} Session data
     */
    async startSession(sessionName, levelId = null) {
        try {
            console.log(`[SessionManager] Starting session: ${sessionName}, Level ID: ${levelId}`);
            
            const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_name: sessionName,
                    level_id: levelId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to start session');
            }

            // Store session data
            this.activeSession = {
                id: result.session_id,
                name: sessionName,
                levelId: levelId,
                startTime: Date.now()
            };
            
            this.sessionStartTime = Date.now();
            this.sessionData = {};
            
            // Persist to localStorage
            this.saveSessionState();
            
            // Store in various localStorage keys for compatibility
            localStorage.setItem('cyberquest_active_session_id', result.session_id.toString());
            localStorage.setItem('active_session_id', result.session_id.toString());
            if (typeof window !== 'undefined') {
                window.currentSessionId = result.session_id;
            }
            
            console.log(`[SessionManager] Session started successfully: ${result.session_id}`);
            return this.activeSession;
            
        } catch (error) {
            console.error('[SessionManager] Failed to start session:', error);
            
            // Fallback: create a local session
            const fallbackSessionId = Date.now();
            this.activeSession = {
                id: fallbackSessionId,
                name: sessionName,
                levelId: levelId,
                startTime: Date.now(),
                isLocal: true
            };
            
            this.sessionStartTime = Date.now();
            this.sessionData = {};
            this.saveSessionState();
            
            localStorage.setItem('cyberquest_active_session_id', fallbackSessionId.toString());
            localStorage.setItem('active_session_id', fallbackSessionId.toString());
            if (typeof window !== 'undefined') {
                window.currentSessionId = fallbackSessionId;
            }
            
            console.warn('[SessionManager] Using fallback local session:', fallbackSessionId);
            return this.activeSession;
        }
    }

    /**
     * End the current session
     * @param {number|null} score - Final score (0-100)
     * @param {Object} additionalData - Additional session data
     * @returns {Promise<Object>} Session completion data
     */
    async endSession(score = null, additionalData = {}) {
        try {
            if (!this.activeSession) {
                console.warn('[SessionManager] No active session to end');
                return null;
            }

            const sessionId = this.activeSession.id;
            const timeSpent = this.getSessionDuration();
            
            console.log(`[SessionManager] Ending session: ${sessionId}, Score: ${score}, Time: ${timeSpent}s`);
            
            // Don't make API call if this is a local fallback session
            if (this.activeSession.isLocal) {
                console.log('[SessionManager] Local session ended, no API call needed');
                this.clearSession();
                return {
                    sessionId: sessionId,
                    score: score,
                    timeSpent: timeSpent,
                    isLocal: true
                };
            }
            
            const response = await fetch('/api/session/end', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    score: score,
                    time_spent: timeSpent,
                    ...additionalData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to end session');
            }

            console.log('[SessionManager] Session ended successfully:', result);
            
            // Clear session state
            this.clearSession();
            
            return result;
            
        } catch (error) {
            console.error('[SessionManager] Failed to end session:', error);
            
            // Still clear the session state even if API call failed
            this.clearSession();
            
            // Return basic completion data
            return {
                sessionId: this.activeSession ? this.activeSession.id : null,
                score: score,
                timeSpent: this.getSessionDuration(),
                error: error.message
            };
        }
    }

    /**
     * Get the current active session
     * @returns {Object|null} Active session data
     */
    getActiveSession() {
        return this.activeSession;
    }

    /**
     * Get the active session ID
     * @returns {number|null} Session ID
     */
    getActiveSessionId() {
        if (this.activeSession) {
            return this.activeSession.id;
        }
        
        // Fallback: check localStorage
        const storedId = localStorage.getItem('cyberquest_active_session_id') || 
                        localStorage.getItem('active_session_id');
        
        if (storedId) {
            return parseInt(storedId, 10);
        }
        
        // Fallback: check window.currentSessionId
        if (typeof window !== 'undefined' && window.currentSessionId) {
            return window.currentSessionId;
        }
        
        return null;
    }

    /**
     * Get session duration in seconds
     * @returns {number} Duration in seconds
     */
    getSessionDuration() {
        if (!this.sessionStartTime) {
            return 0;
        }
        return Math.floor((Date.now() - this.sessionStartTime) / 1000);
    }

    /**
     * Update session data
     * @param {Object} data - Data to store in session
     */
    updateSessionData(data) {
        this.sessionData = { ...this.sessionData, ...data };
        this.saveSessionState();
    }

    /**
     * Get session data
     * @returns {Object} Current session data
     */
    getSessionData() {
        return { ...this.sessionData };
    }

    /**
     * Clear the current session
     */
    clearSession() {
        this.activeSession = null;
        this.sessionStartTime = null;
        this.sessionData = {};
        
        // Clear localStorage
        localStorage.removeItem('cyberquest_active_session_id');
        localStorage.removeItem('active_session_id');
        localStorage.removeItem('cyberquest_session_state');
        
        if (typeof window !== 'undefined') {
            window.currentSessionId = null;
        }
        
        console.log('[SessionManager] Session cleared');
    }

    /**
     * Check if there's an active session
     * @returns {boolean} True if session is active
     */
    hasActiveSession() {
        return this.activeSession !== null;
    }

    /**
     * Save session state to localStorage
     * @private
     */
    saveSessionState() {
        const state = {
            activeSession: this.activeSession,
            sessionStartTime: this.sessionStartTime,
            sessionData: this.sessionData
        };
        
        localStorage.setItem('cyberquest_session_state', JSON.stringify(state));
    }

    /**
     * Load session state from localStorage
     * @private
     */
    loadSessionState() {
        try {
            const storedState = localStorage.getItem('cyberquest_session_state');
            if (storedState) {
                const state = JSON.parse(storedState);
                this.activeSession = state.activeSession;
                this.sessionStartTime = state.sessionStartTime;
                this.sessionData = state.sessionData || {};
                
                console.log('[SessionManager] Session state loaded from localStorage');
            }
        } catch (error) {
            console.warn('[SessionManager] Failed to load session state:', error);
            // Clear corrupted state
            localStorage.removeItem('cyberquest_session_state');
        }
    }

    /**
     * Get session summary for display
     * @returns {Object} Session summary
     */
    getSessionSummary() {
        if (!this.activeSession) {
            return null;
        }

        return {
            sessionId: this.activeSession.id,
            sessionName: this.activeSession.name,
            levelId: this.activeSession.levelId,
            duration: this.getSessionDuration(),
            startTime: this.activeSession.startTime,
            isLocal: this.activeSession.isLocal || false,
            data: this.sessionData
        };
    }

    /**
     * Migrate from old session management
     * This helps transition from individual level session management to centralized
     * @param {string} sessionName - Name of the session
     * @param {number|null} levelId - Level ID if applicable
     */
    async migrateExistingSession(sessionName, levelId = null) {
        // Check if there's already an active session in new format
        if (this.hasActiveSession()) {
            console.log('[SessionManager] Active session already exists, no migration needed');
            return this.activeSession;
        }

        // Check for existing session IDs in localStorage
        const existingSessionId = localStorage.getItem('cyberquest_active_session_id') || 
                                  localStorage.getItem('active_session_id') ||
                                  (typeof window !== 'undefined' ? window.currentSessionId : null);

        if (existingSessionId) {
            console.log(`[SessionManager] Migrating existing session: ${existingSessionId}`);
            
            // Create session object from existing ID
            this.activeSession = {
                id: parseInt(existingSessionId, 10),
                name: sessionName,
                levelId: levelId,
                startTime: Date.now(), // We don't know the real start time
                isMigrated: true
            };
            
            this.sessionStartTime = Date.now();
            this.sessionData = {};
            this.saveSessionState();
            
            return this.activeSession;
        }

        // No existing session found, start a new one
        return await this.startSession(sessionName, levelId);
    }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Export for ES6 modules and global access
export { SessionManager, sessionManager };

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.SessionManager = SessionManager;
    window.sessionManager = sessionManager;
}