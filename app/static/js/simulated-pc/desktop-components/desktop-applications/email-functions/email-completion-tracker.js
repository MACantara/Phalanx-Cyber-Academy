import { ALL_EMAILS } from '../../../levels/level-two/emails/email-registry.js';
import { EmailSessionSummary } from './email-session-summary.js';

export class EmailCompletionTracker {
    constructor(emailApp) {
        this.emailApp = emailApp;
        this.sessionSummary = new EmailSessionSummary(emailApp);
        // If the email app maintains a feedbackStore, attach it so session summary uses the same in-memory data
        if (emailApp && emailApp.feedbackStore) {
            this.sessionSummary.attachFeedbackStore(emailApp.feedbackStore);
        }
        this.hasTriggeredCompletion = false;
        this.completionCheckInterval = null;
    }

    /**
     * Initialize completion tracking
     */
    initialize() {
        // Load any previous session data
        this.loadPreviousSessionData();
        
        // Set up event listeners for completion triggers
        this.setupCompletionEventListeners();
        
        // Start monitoring email completion status
        this.startCompletionMonitoring();
        
        // Listen for email action events
        this.bindCompletionEvents();
    }

    startCompletionMonitoring() {
        // Check completion status every few seconds
        this.completionCheckInterval = setInterval(() => {
            this.checkCompletionStatus();
        }, 3000);
    }

    bindCompletionEvents() {
        // Listen for email security events
        document.addEventListener('email-reported-phishing', () => {
            setTimeout(() => this.checkCompletionStatus(), 1000);
        });

        document.addEventListener('email-marked-legitimate', () => {
            setTimeout(() => this.checkCompletionStatus(), 1000);
        });

        document.addEventListener('email-moved-to-inbox', () => {
            setTimeout(() => this.checkCompletionStatus(), 1000);
        });
    }

    checkCompletionStatus() {
        if (this.hasTriggeredCompletion) return;

        const allEmailIds = ALL_EMAILS.map(email => email.id);
        const securityManager = this.emailApp.state.securityManager;
        
        // Check if all emails have been categorized
        const processedEmails = allEmailIds.filter(emailId => {
            const status = securityManager.getEmailStatus(emailId);
            return status === 'phishing' || status === 'legitimate';
        });

        const completionPercentage = (processedEmails.length / allEmailIds.length) * 100;
        
        // Trigger completion when all emails are processed
        if (completionPercentage === 100) {
            this.triggerLevelCompletion();
        }
    }

    async triggerLevelCompletion() {
        if (this.hasTriggeredCompletion) return;
        
        this.hasTriggeredCompletion = true;
        
        // Stop monitoring
        if (this.completionCheckInterval) {
            clearInterval(this.completionCheckInterval);
            this.completionCheckInterval = null;
        }

        // Calculate completion score based on session performance
        const completionScore = await this.calculateLevelScore();
        // Capture session stats and history to pass through to the dialogue
        const sessionStats = this.emailApp.actionHandler.feedback.getSessionStats();
        const feedbackHistory = Array.isArray(sessionStats.feedbackHistory) ? sessionStats.feedbackHistory : [];

        // Mark level as completed on server (in-memory for now)
        await this.markLevelCompletedOnServer(completionScore);

        // Delay before showing completion dialogue and pass the session data
        setTimeout(() => {
            this.showLevelCompletionDialogue(sessionStats, feedbackHistory);
        }, 2000);
    }

        showLevelCompletionDialogue(sessionStats = null, feedbackHistory = []) {
        // Import and trigger the Level 2 completion dialogue
        import('../../../levels/level-two/dialogues/email-security-completion-dialogue.js').then(module => {
            const EmailSecurityCompletionDialogue = module.EmailSecurityCompletionDialogue;
            if (EmailSecurityCompletionDialogue.startCompletionDialogue && window.desktop) {
                EmailSecurityCompletionDialogue.startCompletionDialogue(window.desktop, { sessionStats, feedbackHistory });
            }
        }).catch(error => {
            console.error('Failed to load Level 2 completion dialogue:', error);
        });
    }

    /**
     * Display level completion dialogue followed by email session summary
     * @param {Object} sessionStats - Session statistics from EmailFeedback
     * @param {Array} feedbackHistory - Array of all feedback interactions
     */
    showCompletionWithSummary(sessionStats, feedbackHistory = []) {
        // First show the level completion dialogue
        this.showLevelCompletionDialogue();
        
        // Wait for dialogue to complete, then show session summary
        setTimeout(() => {
            this.displayEmailSessionSummary(sessionStats, feedbackHistory);
        }, 3000); // 3 second delay to allow dialogue to be read
    }

    /**
     * Display the email session summary with enhanced level completion context
     * @param {Object} sessionStats - Session statistics from EmailFeedback
     * @param {Array} feedbackHistory - Array of all feedback interactions
     */
    displayEmailSessionSummary(sessionStats, feedbackHistory = []) {
        // Close any existing level completion dialogues
        this.closeLevelCompletionDialogue();
        
        // Show the comprehensive session summary
        this.sessionSummary.showSessionSummary(sessionStats, feedbackHistory);
        
        // Mark Level 2 as completed if criteria are met
        if (sessionStats.accuracy >= 70) {
            this.markLevel2Complete(sessionStats);
        }
    }

    /**
     * Close any open level completion dialogues
     */
    closeLevelCompletionDialogue() {
        // Remove any existing level completion dialogues
        const existingDialogues = document.querySelectorAll('.level-completion-dialogue, .dialogue-modal');
        existingDialogues.forEach(dialogue => dialogue.remove());
    }

    /**
     * Mark Level 2 as completed and store completion data
     * @param {Object} sessionStats - Session statistics
     */
    async markLevel2Complete(sessionStats) {
        const completionData = {
            levelId: 2,
            completed: true,
            score: sessionStats.accuracy,
            timestamp: new Date().toISOString(),
            totalActions: sessionStats.totalActions,
            correctActions: sessionStats.correctActions,
            completionMethod: 'email-training'
        };
        
        // Store completion data on server
        await this.markLevelCompletedOnServer(sessionStats.accuracy);
        
        console.log('Level 2 marked as completed via EmailCompletionTracker:', {
            score: sessionStats.accuracy,
            completionData: completionData
        });
        
        // Emit completion event for other systems
        document.dispatchEvent(new CustomEvent('level-completed', {
            detail: {
                levelId: 2,
                score: sessionStats.accuracy,
                completionData: completionData
            }
        }));
    }

    /**
     * Check if user meets completion criteria and trigger appropriate completion flow
     * @param {Object} sessionStats - Session statistics from EmailFeedback
     * @param {Array} feedbackHistory - Array of all feedback interactions
     */
    checkAndTriggerCompletion(sessionStats, feedbackHistory = []) {
        const minActionsRequired = 5; // Minimum number of email actions
        const minAccuracyRequired = 50; // Minimum accuracy percentage
        
        // Check if user meets minimum requirements for completion
        if (sessionStats.totalActions >= minActionsRequired && 
            sessionStats.accuracy >= minAccuracyRequired) {
            
            // Trigger completion with summary
            this.showCompletionWithSummary(sessionStats, feedbackHistory);
            return true;
        }
        
        return false;
    }

    /**
     * Show a simplified completion notification for lower scores
     * @param {Object} sessionStats - Session statistics
     * @param {Array} feedbackHistory - Feedback history
     */
    showTrainingCompletionOnly(sessionStats, feedbackHistory = []) {
        // For users who don't meet the level completion criteria but have completed training
        this.displayEmailSessionSummary(sessionStats, feedbackHistory);
    }

    /**
     * Get completion status and recommendations
     * @param {Object} sessionStats - Session statistics
     * @returns {Object} Completion status and recommendations
     */
    getCompletionStatus(sessionStats) {
        const status = {
            canCompleteLevel: sessionStats.accuracy >= 70,
            hasCompletedTraining: sessionStats.totalActions >= 5,
            recommendedAction: '',
            nextSteps: []
        };
        
        if (status.canCompleteLevel) {
            status.recommendedAction = 'complete-level';
            status.nextSteps = [
                'Review your performance in the session summary',
                'Continue to Level 3: Malware Mayhem',
                'Practice with additional email scenarios if desired'
            ];
        } else if (status.hasCompletedTraining) {
            status.recommendedAction = 'retry-training';
            status.nextSteps = [
                'Review mistakes in the session summary',
                'Practice with more emails to improve accuracy',
                'Retry the level when ready'
            ];
        } else {
            status.recommendedAction = 'continue-training';
            status.nextSteps = [
                'Continue processing more emails',
                'Focus on identifying red flags in suspicious emails',
                'Practice with both phishing and legitimate emails'
            ];
        }
        
        return status;
    }

    /**
     * Load previous session data from in-memory storage
     */
    loadPreviousSessionData() {
        if (window.cyberQuestLevels && window.cyberQuestLevels[2]) {
            console.log('Loaded Level 2 completion data from memory');
            return window.cyberQuestLevels[2];
        }
        return null;
    }

    /**
     * Set up event listeners for completion-related events
     */
    setupCompletionEventListeners() {
        // Listen for manual completion requests
        document.addEventListener('email-training-complete', (event) => {
            const { sessionStats, feedbackHistory } = event.detail;
            this.checkAndTriggerCompletion(sessionStats, feedbackHistory);
        });
        
        // Listen for level navigation requests
        document.addEventListener('navigate-to-level', (event) => {
            const { levelId } = event.detail;
            if (levelId === 3) {
                // User wants to go to level 3 - completion validation now handled server-side
                console.log('Navigation to Level 3 requested - completion checked server-side');
            }
        });
    }

    /**
     * Calculate the completion score for Level 2 based on email security performance
     */
    calculateLevelScore() {
        try {
            // Get current email security performance data from the feedback system
            const sessionStats = this.emailApp.actionHandler.feedback.getSessionStats();
            
            // Use the accuracy from the feedback system which already calculates correct actions
            let score = sessionStats.accuracy || 0;
            
            // If feedback system doesn't have an accuracy score, calculate it manually
            if (score === 0 && sessionStats.totalActions > 0) {
                score = Math.round((sessionStats.correctActions / sessionStats.totalActions) * 100);
            }
            
            // Default to 70% if no feedback data available
            if (score === 0) {
                score = 70;
            }
            
            // Ensure score is within bounds
            score = Math.max(0, Math.min(100, score));
            
            console.log(`Level 2 completion score: ${score}% based on feedback system`);
            console.log('Session stats:', sessionStats);
            
            return score;
            
        } catch (error) {
            console.error('Error calculating Level 2 score:', error);
            return 70; // Default score on error
        }
    }

    /**
     * Mark Level 2 as completed in memory
     */
    async markLevelCompletedOnServer(score) {
        const completionData = {
            level_id: 2,
            score: score,
            time_spent: this.getTotalTimeSpent(),
            xp_earned: 150, // Level 2 XP reward
            completion_data: {
                sessionData: this.emailApp.actionHandler.feedback.getSessionStats(),
                overallScore: score,
                timestamp: new Date().toISOString()
            }
        };
        
        // Store completion in memory
        if (!window.cyberQuestLevels) {
            window.cyberQuestLevels = {};
        }
        window.cyberQuestLevels[2] = completionData;
        
        console.log('Level 2 completed successfully in memory:', completionData);
    }

    /**
     * Calculate total time spent in Level 2
     */
    getTotalTimeSpent() {
        // Simple calculation based on session activity
        // In a real implementation, you'd track actual time spent
        const emailsProcessed = ALL_EMAILS.length;
        return emailsProcessed * 180; // 3 minutes per email average
    }

    /**
     * Get email action status from server-side tracking or session data
     */
    getEmailActionStatus(emailId) {
        // Try to get from EmailSecurityManager through the email app
        if (this.emailApp && this.emailApp.state && this.emailApp.state.securityManager) {
            const emailData = this.emailApp.state.securityManager.getEmailData(emailId);
            if (emailData) {
                if (emailData.reportedAsPhishing) return 'reported_phishing';
                if (emailData.markedAsSpam) return 'spam';
                if (emailData.markedAsLegitimate) return 'inbox';
            }
        }
        
        // Default to unread if no action found
        return 'unread';
    }

    /**
     * Reset completion tracker to initial state
     */
    reset() {
        this.hasTriggeredCompletion = false;
        
        // Clear any existing completion check interval
        if (this.completionCheckInterval) {
            clearInterval(this.completionCheckInterval);
            this.completionCheckInterval = null;
        }
        
        // Close any open completion dialogues
        this.closeLevelCompletionDialogue();
        
        console.log('EmailCompletionTracker reset completed');
    }

    /**
     * Clean up completion tracker
     */
    cleanup() {
        this.closeLevelCompletionDialogue();
        
        // Remove any global references
        if (window.emailCompletionTracker === this) {
            window.emailCompletionTracker = null;
        }
    }
}
