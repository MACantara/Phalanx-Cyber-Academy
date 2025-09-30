import { ALL_EMAILS, loadEmailsFromCSV } from '../../../levels/level-two/emails/email-registry.js';
import { EmailFeedback } from './email-feedback.js';
import { EmailSessionSummary } from './email-session-summary.js';
import { EmailCompletionTracker } from './email-completion-tracker.js';

export class EmailActionHandler {
    constructor(emailApp) {
        this.emailApp = emailApp;
        this.feedback = new EmailFeedback(emailApp);
        this.sessionSummary = new EmailSessionSummary(emailApp);
        if (emailApp && emailApp.feedbackStore) {
            this.sessionSummary.attachFeedbackStore(emailApp.feedbackStore);
        }
        this.completionTracker = new EmailCompletionTracker(emailApp);
        this.sessionStartTime = new Date().toISOString();
        
        // Initialize completion tracker
        this.completionTracker.initialize();
    }

    // Handle reporting an email as phishing
    reportPhishingEmail(emailId) {
        const email = ALL_EMAILS.find(e => e.id === emailId);
        if (!email) return;

        // Get the email app window element
        const emailWindow = this.emailApp.windowElement;
        if (!emailWindow) return;

        // Remove any existing modals within the email window
        const existingModals = emailWindow.querySelectorAll('.email-modal');
        existingModals.forEach(modal => modal.remove());

        // Create modal within email window
        const modal = document.createElement('div');
        modal.className = 'email-modal absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-2 sm:p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded border border-gray-600 shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="bg-gradient-to-r from-red-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
                    <div class="flex items-center space-x-2 sm:space-x-3">
                        <div class="text-2xl sm:text-3xl flex-shrink-0">🛡️</div>
                        <div class="min-w-0">
                            <h2 class="text-base sm:text-lg font-bold text-white truncate">Report Phishing Email</h2>
                            <p class="text-xs sm:text-sm text-white/90">Security Action Required</p>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-4 sm:p-6">
                    <div class="bg-gray-700/50 rounded p-3 sm:p-4 border border-gray-600/50 mb-3 sm:mb-4">
                        <h3 class="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center">
                            📧 <span class="ml-1">Email Details</span>
                        </h3>
                        <div class="space-y-2 text-xs sm:text-sm">
                            <div class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                                <span class="text-gray-400 font-medium">From:</span>
                                <span class="text-white font-medium break-all">${email.sender}</span>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                                <span class="text-gray-400 font-medium">Subject:</span>
                                <span class="text-white break-words">${email.subject}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-red-900/20 rounded p-3 sm:p-4 border border-red-600/30 mb-4 sm:mb-6">
                        <h3 class="text-xs sm:text-sm font-semibold text-red-400 mb-2 flex items-center">
                            ⚠️ <span class="ml-1">Confirmation</span>
                        </h3>
                        <p class="text-red-300 text-xs sm:text-sm leading-relaxed">
                            Are you sure you want to report this email as phishing? This will flag the email as dangerous and help protect other users.
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button onclick="this.closest('.email-modal').remove()" 
                                class="w-full sm:flex-1 bg-gray-600 text-white py-2.5 sm:py-2 px-4 rounded hover:bg-gray-700 active:bg-gray-700 transition-all duration-300 font-medium text-xs sm:text-sm cursor-pointer touch-manipulation">
                            Cancel
                        </button>
                        <button onclick="window.emailActionHandler?.confirmPhishingReport('${emailId}'); this.closest('.email-modal').remove()" 
                                class="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 sm:py-2 px-4 rounded hover:shadow-lg active:from-red-700 active:to-red-800 transition-all duration-300 font-medium text-xs sm:text-sm cursor-pointer touch-manipulation">
                            <span class="hidden sm:inline">Report Phishing</span><span class="sm:hidden">Report</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Append to email window instead of body
        emailWindow.appendChild(modal);
    }

    // Confirm phishing report and execute the action
    confirmPhishingReport(emailId) {
        // Use security manager to handle the action
        this.emailApp.state.securityManager.confirmPhishingReport(emailId, this.emailApp);
    }

    // Handle marking an email as legitimate
    markEmailAsLegitimate(emailId) {
        // Use security manager to handle the action
        this.emailApp.state.securityManager.markEmailAsLegitimate(emailId, this.emailApp);
    }

    // Show toast notification for user feedback within the email client
    showActionFeedback(message, type) {
        // Use centralized toast utility if available
        if (window.toastManager && window.toastManager.showToast) {
            window.toastManager.showToast(message, type);
        } else {
            // Fallback to console log if toast manager not available
            console.log(`Email Action Feedback [${type}]: ${message}`);
        }
    }

    // Handle email opening actions
    handleEmailOpen(emailId) {
        this.emailApp.state.selectEmail(emailId);
        
        // Mark as read using the read tracker
        this.emailApp.readTracker.markAsRead(emailId);
        
        // Find the email and emit event for network monitoring
        const email = ALL_EMAILS.find(e => e.id === emailId);
        if (email) {
            document.dispatchEvent(new CustomEvent('email-opened', {
                detail: { 
                    sender: email.sender, 
                    subject: email.subject,
                    suspicious: email.suspicious 
                }
            }));
        }
        
        this.emailApp.updateContent();
    }

    // Handle folder switching
    handleFolderSwitch(folderId) {
        this.emailApp.state.setFolder(folderId);
        this.emailApp.updateContent();
    }

    // Handle back navigation
    handleBackNavigation() {
        this.emailApp.state.selectEmail(null);
        this.emailApp.updateContent();
    }

    // Load read email status from localStorage
    loadReadEmailStatus() {
        // This is now handled by EmailReadTracker automatically
        return true;
    }

    // Save read email status to localStorage
    saveReadEmailStatus() {
        // This is now handled by EmailReadTracker automatically
        return true;
    }

    // Check if all emails have been processed (opened and categorized)
    checkEmailCompletionStatus() {
        const allEmailIds = ALL_EMAILS.map(email => email.id);
        const processedEmails = allEmailIds.filter(emailId => {
            const status = this.emailApp.state.getEmailStatus(emailId);
            return status === 'phishing' || status === 'legitimate';
        });
        
        
        return {
            total: allEmailIds.length,
            processed: processedEmails.length,
            percentage: Math.round((processedEmails.length / allEmailIds.length) * 100)
        };
    }


    // Get email statistics for progress tracking
    getEmailStatistics() {
        const stats = this.feedback.getSessionStats();
        return {
            categorized: stats.totalReported + stats.totalLegitimate,
            phishingDetected: stats.totalReported,
            legitimateConfirmed: stats.totalLegitimate,
            categorizedPercentage: Math.round(((stats.totalReported + stats.totalLegitimate) / ALL_EMAILS.length) * 100),
            emailSecurityAccuracy: stats.accuracy
        };
    }

    // Export user actions for analysis
    exportUserActions() {
        const stats = this.getEmailStatistics();
        
        return {
            timestamp: new Date().toISOString(),
            userStats: stats,
            feedbackHistory: this.feedback.feedbackHistory,
            sessionData: {
                startTime: this.sessionStartTime,
                endTime: new Date().toISOString()
            }
        };
    }

    /**
     * Complete email security training session
     */
    completeEmailTraining() {
        const sessionStats = this.feedback.getSessionStats();
        const feedbackHistory = this.feedback.feedbackHistory;
        
        // Use completion tracker to handle the full completion flow
        const completionTriggered = this.completionTracker.checkAndTriggerCompletion(sessionStats, feedbackHistory);
        
        if (!completionTriggered) {
            // If level completion criteria not met, just show training completion
            this.completionTracker.showTrainingCompletionOnly(sessionStats, feedbackHistory);
        }
    }

    // Initialize action handler
    initialize() {
        // Load saved state
        this.loadReadEmailStatus();
        this.sessionStartTime = new Date().toISOString();
        
        // Store global reference for modal callbacks
        window.emailActionHandler = this;
    }

    // Reset email action handler to initial state
    async reset() {
        try {
            // Reset feedback system
            await this.feedback.reset();
            
            // Reset session summary
            this.sessionSummary.reset();
            
            // Reset completion tracker
            this.completionTracker.reset();
            
            // Reset session start time
            this.sessionStartTime = new Date().toISOString();
            
            console.log('EmailActionHandler reset completed');
        } catch (error) {
            console.error('Failed to reset EmailActionHandler:', error);
        }
    }

    // Reset CLIENT-SIDE action handler state only (preserve server analytics)
    resetClientState() {
        try {
            console.log('Resetting client-side action handler state (preserving server analytics)...');
            
            // Reset completion tracker (client-side only)
            this.completionTracker.reset();
            
            // Reset session start time
            this.sessionStartTime = new Date().toISOString();
            
            console.log('Client-side action handler state reset completed');
        } catch (error) {
            console.error('Failed to reset client-side action handler state:', error);
        }
    }

    // Cleanup when email app is closed
    cleanup() {
        // Save current state
        this.saveReadEmailStatus();
        
        // Clean up global reference
        if (window.emailActionHandler === this) {
            window.emailActionHandler = null;
        }
        
        // Remove any remaining toasts and modals from the email window
        if (this.emailApp.windowElement) {
            const toasts = this.emailApp.windowElement.querySelectorAll('.email-action-toast');
            toasts.forEach(toast => toast.remove());
            
            const modals = this.emailApp.windowElement.querySelectorAll('.email-modal');
            modals.forEach(modal => modal.remove());
        }

        // Clean up completion tracker
        this.completionTracker.cleanup();
    }

}