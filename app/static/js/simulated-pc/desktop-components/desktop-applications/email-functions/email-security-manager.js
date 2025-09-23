import { ALL_EMAILS, loadEmailsFromCSV } from '../../../levels/level-two/emails/email-registry.js';

export class EmailSecurityManager {
    constructor(emailApp) {
        this.emailApp = emailApp;
        this.reportedPhishing = new Set();
        this.legitimateEmails = new Set();
        this.spamEmails = new Set();
        this.isLoaded = true; // Always loaded since we're not waiting for server
    }

    // Phishing reporting methods
    async reportAsPhishing(emailId) {
        this.reportedPhishing.add(emailId);
        this.spamEmails.add(emailId); // Move to spam when reported as phishing
        // Remove from legitimate if previously marked
        this.legitimateEmails.delete(emailId);
        
        // Emit event for UI updates
        document.dispatchEvent(new CustomEvent('email-reported-phishing', {
            detail: { 
                emailId, 
                timestamp: new Date().toISOString(),
                totalReported: this.reportedPhishing.size
            }
        }));
    }

    async markAsLegitimate(emailId) {
        this.legitimateEmails.add(emailId);
        this.spamEmails.delete(emailId); // Remove from spam if marked as legitimate
        // Remove from phishing reports if previously reported
        this.reportedPhishing.delete(emailId);
        
        // Save to server
        // Emit event for UI updates
        document.dispatchEvent(new CustomEvent('email-marked-legitimate', {
            detail: { 
                emailId, 
                timestamp: new Date().toISOString(),
                totalLegitimate: this.legitimateEmails.size
            }
        }));
    }

    // Spam folder management
    async moveToSpam(emailId) {
        this.spamEmails.add(emailId);
        // No server persistence needed - in-memory only
    }

    // Email action methods - refactored from email-app.js
    async confirmPhishingReport(emailId, emailApp) {
        const email = ALL_EMAILS.find(e => e.id === emailId);
        if (!email) return;

        // Trigger feedback evaluation for "report" action
        if (emailApp && emailApp.actionHandler && emailApp.actionHandler.feedback) {
            await emailApp.actionHandler.feedback.evaluateAction(email, 'report', 'User reported email as phishing');
        }

        await this.reportAsPhishing(emailId);
        
        // Emit event for network monitoring
        document.dispatchEvent(new CustomEvent('email-reported-phishing', {
            detail: { emailId, timestamp: new Date().toISOString() }
        }));
        
        if (emailApp && emailApp.actionHandler) {
            emailApp.actionHandler.showActionFeedback('Email reported as phishing and moved to spam!', 'success');
            
            // Redirect to inbox and clear selected email
            emailApp.state.setFolder('inbox');
            emailApp.state.selectEmail(null);
            emailApp.updateContent();
        }
    }

    async markEmailAsLegitimate(emailId, emailApp) {
        const email = ALL_EMAILS.find(e => e.id === emailId);
        if (!email) return;

        // Trigger feedback evaluation for "trust" action
        if (emailApp && emailApp.actionHandler && emailApp.actionHandler.feedback) {
            await emailApp.actionHandler.feedback.evaluateAction(email, 'trust', 'User marked email as legitimate');
        }

        await this.markAsLegitimate(emailId);
        
        // Emit event for network monitoring
        document.dispatchEvent(new CustomEvent('email-marked-legitimate', {
            detail: { emailId, timestamp: new Date().toISOString() }
        }));
        
        if (emailApp && emailApp.actionHandler) {
            emailApp.actionHandler.showActionFeedback('Email marked as legitimate!', 'success');
            
            // Stay on current email but update its status
            emailApp.updateContent();
        }
    }

    // New method to handle email deletion with feedback
    async deleteEmail(emailId, emailApp) {
        const email = ALL_EMAILS.find(e => e.id === emailId);
        if (!email) return;

        // Trigger feedback evaluation for "delete" action
        if (emailApp && emailApp.actionHandler && emailApp.actionHandler.feedback) {
            await emailApp.actionHandler.feedback.evaluateAction(email, 'delete', 'User deleted email');
        }

        // Move to spam/trash folder
        this.spamEmails.add(emailId);
        // Emit event for UI updates
        document.dispatchEvent(new CustomEvent('email-marked-spam', {
            detail: { 
                emailId, 
                timestamp: new Date().toISOString(),
                totalSpam: this.spamEmails.size
            }
        }));
        
        if (emailApp && emailApp.actionHandler) {
            emailApp.actionHandler.showActionFeedback('Email deleted!', 'success');
            
            // Redirect to inbox and clear selected email
            emailApp.state.setFolder('inbox');
            emailApp.state.selectEmail(null);
            emailApp.updateContent();
        }
    }

    // New method to handle ignoring/normal processing with feedback
    async ignoreEmail(emailId, emailApp) {
        const email = ALL_EMAILS.find(e => e.id === emailId);
        if (!email) return;

        // Trigger feedback evaluation for "ignore" action
        if (emailApp && emailApp.actionHandler && emailApp.actionHandler.feedback) {
            await emailApp.actionHandler.feedback.evaluateAction(email, 'ignore', 'User processed email normally');
        }

        // Just mark as read, no other action needed for ignore
        if (emailApp && emailApp.readTracker) {
            await emailApp.readTracker.markAsRead(emailId);
        }
        
        // Emit event for network monitoring
        document.dispatchEvent(new CustomEvent('email-processed-normally', {
            detail: { emailId, timestamp: new Date().toISOString() }
        }));
        
        if (emailApp && emailApp.actionHandler) {
            emailApp.actionHandler.showActionFeedback('Email processed normally', 'success');
        }
    }

    // Check if enough emails have been processed to complete training
    checkTrainingCompletion(emailApp) {
        if (!emailApp || !emailApp.actionHandler || !emailApp.actionHandler.feedback) return;

        const totalEmails = ALL_EMAILS.length;
        const processedEmails = this.reportedPhishing.size + this.legitimateEmails.size;
        const completionThreshold = Math.ceil(totalEmails * 0.6); // 60% of emails

        if (processedEmails >= completionThreshold) {
            // Get current session stats
            const sessionStats = emailApp.actionHandler.feedback.getSessionStats();
            const feedbackHistory = emailApp.actionHandler.feedback.feedbackHistory;
            
            // Use completion tracker to handle the completion flow
            setTimeout(() => {
                if (emailApp.actionHandler.completionTracker) {
                    emailApp.actionHandler.completionTracker.checkAndTriggerCompletion(sessionStats, feedbackHistory);
                } else {
                    // Fallback to direct completion
                    emailApp.actionHandler.completeEmailTraining();
                }
            }, 1000);
        }
    }

    // Enhanced method to prevent re-categorization
    canEmailBeRecategorized(emailId) {
        const currentStatus = this.getEmailStatus(emailId);
        return currentStatus === 'unverified';
    }

    // Method to get classification progress for UI display
    getClassificationProgress() {
        const totalEmails = ALL_EMAILS.length;
        const classifiedEmails = this.reportedPhishing.size + this.legitimateEmails.size;
        const percentage = Math.round((classifiedEmails / totalEmails) * 100);
        
        return {
            total: totalEmails,
            classified: classifiedEmails,
            remaining: totalEmails - classifiedEmails,
            percentage: percentage
        };
    }

    // Status checking methods
    isReportedAsPhishing(emailId) {
        return this.reportedPhishing.has(emailId);
    }

    isMarkedAsLegitimate(emailId) {
        return this.legitimateEmails.has(emailId);
    }

    isInSpam(emailId) {
        return this.spamEmails.has(emailId);
    }

    getEmailStatus(emailId) {
        if (this.isReportedAsPhishing(emailId)) return 'phishing';
        if (this.isMarkedAsLegitimate(emailId)) return 'legitimate';
        return 'unverified';
    }

    // Folder filtering
    getEmailsForFolder(allEmails, folderId) {
        switch (folderId) {
            case 'inbox':
                return allEmails.filter(email => !this.isInSpam(email.id));
            case 'spam':
                return allEmails.filter(email => this.isInSpam(email.id));
            default:
                return allEmails;
        }
    }

    // Clear all security states (for testing or reset)
    clearAll() {
        const hadData = this.reportedPhishing.size > 0 || 
                       this.legitimateEmails.size > 0 || 
                       this.spamEmails.size > 0;
        
        this.reportedPhishing.clear();
        this.legitimateEmails.clear();
        this.spamEmails.clear();
        
        if (hadData) {
            document.dispatchEvent(new CustomEvent('email-security-cleared', {
                detail: { timestamp: new Date().toISOString() }
            }));
        }
        
        return hadData;
    }

    // Get current security state (for UI updates)
    getCurrentState() {
        return {
            reportedPhishing: Array.from(this.reportedPhishing),
            legitimateEmails: Array.from(this.legitimateEmails),
            spamEmails: Array.from(this.spamEmails),
            lastUpdated: new Date().toISOString()
        };
    }

    // Statistics and analytics methods
    getSecurityStats() {
        return {
            totalReported: this.reportedPhishing.size,
            totalLegitimate: this.legitimateEmails.size,
            totalSpam: this.spamEmails.size,
            reportedEmails: [...this.reportedPhishing],
            legitimateEmails: [...this.legitimateEmails],
            spamEmails: [...this.spamEmails]
        };
    }

    // UI Helper methods for creating status indicators and badges
    createStatusIndicator(emailId, isRead = false) {
        const emailStatus = this.getEmailStatus(emailId);
        let statusIndicator = '';
        let statusClass = 'bg-gray-400';
        
        switch(emailStatus) {
            case 'phishing':
                statusIndicator = '<i class="bi bi-shield-exclamation text-red-500 text-sm ml-1" title="Reported as Phishing"></i>';
                statusClass = 'bg-red-500';
                break;
            case 'legitimate':
                statusIndicator = '<i class="bi bi-shield-check text-green-500 text-sm ml-1" title="Marked as Legitimate"></i>';
                statusClass = 'bg-green-500';
                break;
            default:
                // Show different indicator for unclassified emails
                statusIndicator = '<i class="bi bi-question-circle text-yellow-500 text-sm ml-1" title="Awaiting Classification"></i>';
                statusClass = isRead ? 'bg-yellow-400' : 'bg-blue-500';
        }

        return { statusIndicator, statusClass };
    }

    createStatusBadge(emailId) {
        const emailStatus = this.getEmailStatus(emailId);
        
        // Only show badge for unverified emails to encourage action
        if (emailStatus === 'unverified') {
            return '<span class="bg-yellow-600 bg-opacity-20 text-white font-medium px-2 py-1 rounded-full inline-flex items-center border border-yellow-600 border-opacity-30 text-sm"><i class="bi bi-clock mr-1"></i>Awaiting Classification</span>';
        }
        
        // No badge for classified emails - status is shown in action buttons
        return '';
    }

    createActionButtons(emailId, currentFolder) {
        const currentStatus = this.getEmailStatus(emailId);
        let buttons = '';
        
        // If email has already been categorized, don't show action buttons
        if (currentStatus === 'phishing' || currentStatus === 'legitimate') {
            return '';
        }
        
        if (currentFolder === 'spam') {
            // No action buttons in spam folder
            return '';
        } else {
            // In inbox, show classification buttons only if not already categorized
            buttons += `
                <button class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors cursor-pointer flex items-center cursor-pointer text-sm" 
                        id="report-phishing-btn" data-email-id="${emailId}">
                    <i class="bi bi-shield-exclamation mr-1"></i>Report Phishing
                </button>
                <button class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors cursor-pointer flex items-center cursor-pointer text-sm" 
                        id="mark-legitimate-btn" data-email-id="${emailId}">
                    <i class="bi bi-shield-check mr-1"></i>Mark Legitimate
                </button>`;
        }
        
        return buttons;
    }

    createPhishingWarning() {
        return `
            <div class="mt-4 mb-4 bg-red-900 border border-red-700 rounded p-4">
                <div class="flex items-center mb-2">
                    <i class="bi bi-exclamation-triangle text-red-400 mr-2"></i>
                    <h4 class="text-red-400 font-semibold">Phishing Email Reported</h4>
                </div>
                <p class="text-red-300 text-sm">
                    This email has been reported as a phishing attempt. It has been flagged for review and will be blocked from future delivery.
                </p>
                <div class="mt-2 text-red-400 text-xs">
                    <strong>Safety Tips:</strong> Never click links or download attachments from suspicious emails. 
                    Always verify sender identity before sharing personal information.
                </div>
            </div>`;
    }

    createLegitimateConfirmation() {
        return `
            <div class="mt-4 mb-4 bg-green-900 border border-green-700 rounded p-4">
                <div class="flex items-center mb-2">
                    <i class="bi bi-shield-check text-green-400 mr-2"></i>
                    <h4 class="text-green-400 font-semibold">Legitimate Email Verified</h4>
                </div>
                <p class="text-green-300 text-sm">
                    This email has been marked as legitimate and trusted. The sender is verified and the content is safe.
                </p>
            </div>`;
    }

    // Bulk operations
    async clearAllSecurityData() {
        this.reportedPhishing.clear();
        this.legitimateEmails.clear();
        this.spamEmails.clear();
        // No server persistence needed - in-memory only
    }

    exportSecurityData() {
        return {
            reportedPhishing: [...this.reportedPhishing],
            markedLegitimate: [...this.legitimateEmails],
            spamEmails: [...this.spamEmails],
            exportDate: new Date().toISOString()
        };
    }

    async importSecurityData(data) {
        if (data.reportedPhishing) {
            this.reportedPhishing = new Set(data.reportedPhishing);
        }
        if (data.markedLegitimate) {
            this.legitimateEmails = new Set(data.markedLegitimate);
        }
        if (data.spamEmails) {
            this.spamEmails = new Set(data.spamEmails);
        }
        await this.saveToServer();
    }

    // Reset security manager to initial state
    async reset() {
        await this.clearAllSecurityData();
        this.isLoaded = false;
        console.log('EmailSecurityManager reset completed');
    }

    // Reset CLIENT-SIDE security state only (preserve server analytics)
    resetClientState() {
        console.log('Resetting client-side security state (preserving server analytics)...');
        this.isLoaded = false;
        console.log('Client-side security state reset completed');
    }
}
