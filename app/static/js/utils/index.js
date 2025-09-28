/**
 * Centralized Utilities Index
 * Provides easy access to all utility modules
 */

// Import all utilities
import { SessionManager, sessionManager } from './session-manager.js';
import { XPCalculator, xpCalculator } from './xp-calculator.js';
import { 
    GameProgressManager, 
    gameProgressManager,
    startLevel,
    completeLevel,
    startSession,
    completeSession,
    getCurrentSessionId,
    getTimeSpent,
    previewXP
} from './game-progress-manager.js';

// Export everything for ES6 modules
export {
    // Classes
    SessionManager,
    XPCalculator,
    GameProgressManager,
    
    // Singleton instances
    sessionManager,
    xpCalculator,
    gameProgressManager,
    
    // Convenience functions
    startLevel,
    completeLevel,
    startSession,
    completeSession,
    getCurrentSessionId,
    getTimeSpent,
    previewXP
};

// Make everything available globally for compatibility
if (typeof window !== 'undefined') {
    // Classes
    window.SessionManager = SessionManager;
    window.XPCalculator = XPCalculator;
    window.GameProgressManager = GameProgressManager;
    
    // Instances
    window.sessionManager = sessionManager;
    window.xpCalculator = xpCalculator;
    window.gameProgressManager = gameProgressManager;
    
    // Convenience functions
    window.startLevel = startLevel;
    window.completeLevel = completeLevel;
    window.startSession = startSession;
    window.completeSession = completeSession;
    window.getCurrentSessionId = getCurrentSessionId;
    window.getTimeSpent = getTimeSpent;
    window.previewXP = previewXP;
    
    // Create a single utilities namespace
    window.CyberQuestUtils = {
        SessionManager,
        XPCalculator,
        GameProgressManager,
        sessionManager,
        xpCalculator,
        gameProgressManager,
        startLevel,
        completeLevel,
        startSession,
        completeSession,
        getCurrentSessionId,
        getTimeSpent,
        previewXP
    };
    
    console.log('[CyberQuestUtils] Utilities loaded and available globally');
}