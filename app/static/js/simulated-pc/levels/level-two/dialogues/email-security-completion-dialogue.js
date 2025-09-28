import { BaseDialogue } from '../../../dialogues/base-dialogue.js';
import { EmailSessionSummary } from '../../../desktop-components/desktop-applications/email-functions/email-session-summary.js';

export class EmailSecurityCompletionDialogue extends BaseDialogue {
    constructor(desktop, character = 'instructor', options = {}) {
        super(desktop, character);
        this.options = options || {};
        this.messages = [
            {
                text: "Outstanding work, Agent! You've successfully completed Level 2: Shadow Inbox. Your email security analysis skills are now at professional level."
            },
            {
                text: "You've demonstrated exceptional ability to identify sophisticated phishing attempts, distinguish legitimate communications, and protect sensitive information from cybercriminals."
            },
            {
                text: "Your analysis helped prevent multiple potential security breaches. You correctly identified advanced threats including spear-phishing, credential harvesting, and social engineering attacks."
            },
            {
                text: "You've earned 150 XP in Cybersecurity and unlocked the 'Email Security Expert' badge. These skills are crucial for protecting both personal and organizational digital assets."
            },
            {
                text: "Remember: Email remains the primary attack vector for cybercriminals. Your vigilance and expertise in email security make you a valuable defender against digital threats."
            },
            {
                text: "You're now ready for advanced cybersecurity challenges. Keep applying these skills - verify sender authenticity, scrutinize links and attachments, and help others recognize email-based threats!"
            }
        ];
    }

    async onComplete() {
        // Mark Level 2 as completed and update progress
        localStorage.setItem('cyberquest_level_2_completed', 'true');
        localStorage.setItem('cyberquest_current_level', '3');
        
        // End the current session with the backend
        await this.endCurrentSession();
        
        const badges = JSON.parse(localStorage.getItem('cyberquest_badges') || '[]');
        if (!badges.includes('email-security-expert')) {
            badges.push('email-security-expert');
            localStorage.setItem('cyberquest_badges', JSON.stringify(badges));
        }
        
        // Show email session summary (if session data passed via options, use it)
        this.showEmailSessionSummary(this.options || {});
        
        // Navigate back to levels overview after a delay
        setTimeout(() => {
            if (this.desktop?.windowManager) {
                try {
                    const browserApp = this.desktop.windowManager.applications.get('browser');
                    if (browserApp) {
                        browserApp.navigation.navigateToUrl('/levels');
                    }
                } catch (error) {
                    console.error('Failed to navigate to levels overview:', error);
                    window.location.href = '/levels';
                }
            } else {
                window.location.href = '/levels';
            }
        }, 1000);
    }

    /**
     * End the current session with backend using centralized utilities
     */
    async endCurrentSession() {
        try {
            console.log('[EmailSecurityCompletion] Ending current session with centralized system');

            const sessionId = this.getActiveSessionId();
            
            if (!sessionId) {
                console.warn('[EmailSecurityCompletion] No session ID available - cannot end session');
                return;
            }

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            // First, attach to the existing session that was started externally
            const startTime = parseInt(localStorage.getItem('cyberquest_level_2_start_time') || Date.now());
            progressManager.attachToExistingSession(
                sessionId,
                2, // Level ID
                'Shadow-in-the-Inbox', // Level name
                'medium', // Difficulty
                startTime
            );

            // Calculate Level 2 performance score
            let emailTrainingScore = 0;
            
            // Debug: Check what global objects are available
            console.log('[EmailSecurityCompletion] Debug - window.emailCompletionTracker:', window.emailCompletionTracker);
            console.log('[EmailSecurityCompletion] Debug - window.emailAppInstance:', window.emailAppInstance);
            console.log('[EmailSecurityCompletion] Debug - window.emailActionHandler:', window.emailActionHandler);
            console.log('[EmailSecurityCompletion] Debug - Available window properties:', Object.keys(window).filter(key => key.includes('email')));
            
            // Try to access the feedback system through emailActionHandler (which is available globally)
            if (window.emailActionHandler && window.emailActionHandler.feedback && typeof window.emailActionHandler.feedback.getSessionStats === 'function') {
                const sessionStats = window.emailActionHandler.feedback.getSessionStats();
                console.log('[EmailSecurityCompletion] Debug - Direct feedback sessionStats:', sessionStats);
                emailTrainingScore = sessionStats.accuracy || 0;
                if (emailTrainingScore === 0 && sessionStats.totalActions > 0) {
                    emailTrainingScore = Math.round((sessionStats.correctActions / sessionStats.totalActions) * 100);
                }
                console.log('[EmailSecurityCompletion] Calculated from emailActionHandler feedback:', emailTrainingScore);
            }
            // First fallback: try to use the EmailCompletionTracker which has the correct data
            else if (window.emailCompletionTracker && typeof window.emailCompletionTracker.calculateLevelScore === 'function') {
                emailTrainingScore = window.emailCompletionTracker.calculateLevelScore();
                console.log('[EmailSecurityCompletion] Using EmailCompletionTracker score:', emailTrainingScore);
            }
            // If no completion tracker, try to access the email app directly  
            else if (window.emailAppInstance && window.emailAppInstance.completionTracker && typeof window.emailAppInstance.completionTracker.calculateLevelScore === 'function') {
                emailTrainingScore = window.emailAppInstance.completionTracker.calculateLevelScore();
                console.log('[EmailSecurityCompletion] Using emailAppInstance.completionTracker score:', emailTrainingScore);
            }
            // Try to access the feedback system directly
            else if (window.emailAppInstance && window.emailAppInstance.actionHandler && window.emailAppInstance.actionHandler.feedback) {
                const sessionStats = window.emailAppInstance.actionHandler.feedback.getSessionStats();
                console.log('[EmailSecurityCompletion] Debug - Direct feedback sessionStats:', sessionStats);
                emailTrainingScore = sessionStats.accuracy || 0;
                if (emailTrainingScore === 0 && sessionStats.totalActions > 0) {
                    emailTrainingScore = Math.round((sessionStats.correctActions / sessionStats.totalActions) * 100);
                }
                console.log('[EmailSecurityCompletion] Calculated from direct feedback system:', emailTrainingScore);
            }
            // Fallback to the previous calculation methods
            else {
                const sessionStats = this.getStoredSessionStats();
                let feedbackHistory = this.getStoredFeedbackHistory();
                
                console.log('[EmailSecurityCompletion] Debug - Fallback sessionStats:', sessionStats);
                console.log('[EmailSecurityCompletion] Debug - Fallback feedbackHistory:', feedbackHistory);
                
                if (feedbackHistory && feedbackHistory.length > 0) {
                    const totalActions = feedbackHistory.length;
                    const correctActions = feedbackHistory.filter(f => f.isCorrect).length;
                    emailTrainingScore = Math.round((correctActions / totalActions) * 100);
                    console.log('[EmailSecurityCompletion] Calculated from feedbackHistory - total:', totalActions, 'correct:', correctActions, 'score:', emailTrainingScore);
                } else if (sessionStats.totalActions > 0) {
                    emailTrainingScore = Math.round((sessionStats.correctActions / sessionStats.totalActions) * 100);
                    console.log('[EmailSecurityCompletion] Calculated from sessionStats:', emailTrainingScore);
                } else {
                    emailTrainingScore = parseInt(localStorage.getItem('cyberquest_email_training_score') || '0');
                    console.log('[EmailSecurityCompletion] Using stored score as fallback:', emailTrainingScore);
                }
            }
            
            console.log('[EmailSecurityCompletion] Final calculated score:', emailTrainingScore);
            
            // Complete level using centralized system
            const sessionResult = await progressManager.completeLevel(emailTrainingScore, {
                accuracy: emailTrainingScore,
                totalActions: this.getStoredSessionStats().totalActions,
                correctActions: this.getStoredSessionStats().correctActions,
                completionTime: Date.now() - startTime
            });

            if (sessionResult) {
                console.log('[EmailSecurityCompletion] Session ended successfully with centralized system:', sessionResult);
                
                // Clear session from storage
                localStorage.removeItem('cyberquest_active_session_id');
                sessionStorage.removeItem('active_session_id');
                window.currentSessionId = null;

                // Show XP earned notification
                if (window.ToastManager && sessionResult.xp && sessionResult.xp.xp_awarded) {
                    window.ToastManager.showToast(
                        `Level completed! You earned ${sessionResult.xp.xp_awarded} XP!`, 
                        'success'
                    );
                } else if (window.ToastManager && sessionResult.session && sessionResult.session.xp_awarded) {
                    window.ToastManager.showToast(
                        `Level completed! You earned ${sessionResult.session.xp_awarded} XP!`, 
                        'success'
                    );
                }
                
                return sessionResult;
            } else {
                console.error('[EmailSecurityCompletion] Centralized session end failed: no result returned');
            }
        } catch (error) {
            console.error('[EmailSecurityCompletion] Error ending session with centralized system:', error);
        }
    }

    /**
     * Get active session ID from storage
     */
    getActiveSessionId() {
        const sessionId = localStorage.getItem('cyberquest_active_session_id') ||
                         sessionStorage.getItem('active_session_id') ||
                         window.currentSessionId;
        
        if (sessionId) {
            const numericSessionId = parseInt(sessionId);
            if (!isNaN(numericSessionId)) {
                return numericSessionId;
            }
        }
        
        return null;
    }

    showEmailSessionSummary(options = {}) {
        try {
            // If sessionStats and feedbackHistory were passed in options, use them
            const sessionStats = options.sessionStats || this.getStoredSessionStats();
            const feedbackHistory = options.feedbackHistory || this.getStoredFeedbackHistory();

            // Create a temporary email session summary instance and pass the data
            const sessionSummary = new EmailSessionSummary(null);
            sessionSummary.showSessionSummary(sessionStats, feedbackHistory);
        } catch (error) {
            console.error('Failed to show email session summary:', error);
        }
    }

    getStoredSessionStats() {
        // Reconstruct session stats from stored data
        const phishingReports = JSON.parse(localStorage.getItem('cyberquest_email_phishing_reports') || '[]');
        const legitimateMarks = JSON.parse(localStorage.getItem('cyberquest_email_legitimate_marks') || '[]');
        const feedbackHistory = this.getStoredFeedbackHistory();
        
        const totalActions = phishingReports.length + legitimateMarks.length;
        
        // Calculate accuracy properly from feedback history if available
        let emailTrainingScore = parseInt(localStorage.getItem('cyberquest_email_training_score') || '0');
        let correctActions = Math.round((emailTrainingScore / 100) * totalActions);
        
        if (emailTrainingScore === 0 && feedbackHistory.length > 0) {
            correctActions = feedbackHistory.filter(f => f.isCorrect).length;
            emailTrainingScore = Math.round((correctActions / feedbackHistory.length) * 100);
        } else if (emailTrainingScore === 0 && totalActions > 0) {
            // If no feedback history, assume all actions were correct for fallback
            correctActions = totalActions;
            emailTrainingScore = 100;
        }
        
        return {
            accuracy: emailTrainingScore,
            totalActions: totalActions,
            correctActions: correctActions,
            totalReported: phishingReports.length,
            totalLegitimate: legitimateMarks.length
        };
    }

    getStoredFeedbackHistory() {
        // Try to get feedback history from localStorage
        const feedbackHistory = JSON.parse(localStorage.getItem('cyberquest_email_feedback_history') || '[]');
        
        // If no stored history, create a basic one from security manager data
        if (feedbackHistory.length === 0) {
            const phishingReports = JSON.parse(localStorage.getItem('cyberquest_email_phishing_reports') || '[]');
            const legitimateMarks = JSON.parse(localStorage.getItem('cyberquest_email_legitimate_marks') || '[]');
            
            const mockHistory = [];
            phishingReports.forEach((emailId, index) => {
                mockHistory.push({
                    emailId: emailId,
                    timestamp: new Date().toISOString(),
                    playerAction: 'report',
                    isSuspicious: true,
                    isCorrect: true,
                    emailSender: `sender_${index}@example.com`,
                    emailSubject: `Suspicious Email ${index + 1}`
                });
            });
            
            legitimateMarks.forEach((emailId, index) => {
                mockHistory.push({
                    emailId: emailId,
                    timestamp: new Date().toISOString(),
                    playerAction: 'trust',
                    isSuspicious: false,
                    isCorrect: true,
                    emailSender: `legitimate_${index}@company.com`,
                    emailSubject: `Business Email ${index + 1}`
                });
            });
            
            return mockHistory;
        }
        
        return feedbackHistory;
    }

    getFinalButtonText() {
        return 'Continue Advanced Training';
    }

    static shouldAutoStart() {
        const levelCompleted = localStorage.getItem('cyberquest_level_2_completed');
        const allEmailsProcessed = localStorage.getItem('cyberquest_email_training_completed');
        return allEmailsProcessed && !levelCompleted;
    }

    static startCompletionDialogue(desktop, options = {}) {
        const dialogue = new EmailSecurityCompletionDialogue(desktop, 'instructor', options);
        dialogue.start();
    }
}
