import { WindowBase } from '../window-base.js';
import { EmailState } from './email-functions/email-state.js';
import { EmailActionHandler } from './email-functions/email-action-handler.js';
import { EmailReadTracker } from './email-functions/email-read-tracker.js';
import { EmailCompletionTracker } from './email-functions/email-completion-tracker.js';
import { ALL_EMAILS, loadEmailsFromCSV } from '../../levels/level-two/emails/email-registry.js';
import { InMemoryFeedbackStore } from './email-functions/email-session-summary.js';

export class EmailApp extends WindowBase {
    constructor() {
        super('email', 'Email Client', {
            width: '80%',
            height: '70%'
        });
        this.state = new EmailState();
        this.readTracker = new EmailReadTracker();
        // Shared in-memory feedback store for this email app session
        this.feedbackStore = new InMemoryFeedbackStore();
        this.actionHandler = new EmailActionHandler(this);
        this.completionTracker = new EmailCompletionTracker(this);
        
        // Flag to track initialization
        this.isInitialized = false;
        this.initializationPromise = null;
        
        // Expose debug methods globally for testing
        window.emailAppDebug = {
            debugState: () => this.debugCurrentState(),
            forceReset: () => this.debugForceReset(),
            debugReadTracker: () => this.readTracker.debugCurrentState(),
            forceReloadReadTracker: () => this.readTracker.forceReload()
        };
    }

    async ensureInitialized() {
        if (this.isInitialized) {
            return;
        }
        
        if (this.initializationPromise) {
            await this.initializationPromise;
            return;
        }
        
        this.initializationPromise = this.initializeState();
        try {
            await this.initializationPromise;
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize email app:', error);
            this.initializationPromise = null; // Allow retry
        }
    }

    async initializeState() {
        try {
            // First ensure JSON email data is loaded
            await loadEmailsFromCSV(); // Keeping old name for backward compatibility
            console.log('EmailApp: Email data loaded from JSON API');
            
            await this.state.loadFromServer();
            await this.readTracker.ensureLoaded();
            await this.actionHandler.feedback.loadSessionData();
            
            // Check if this is a fresh Level 2 start
            await this.checkForFreshStart();
        } catch (error) {
            console.warn('Failed to load some email state data:', error);
        }
    }

    async checkForFreshStart() {
        // Check if Level 2 was just started fresh (dialogue completed)
        const level2Started = localStorage.getItem('cyberquest_level_2_started');
        const level2FreshStart = localStorage.getItem('cyberquest_level_2_fresh_start');
        
        if (level2Started && level2FreshStart === 'true') {
            console.log('Detected fresh Level 2 start - resetting email app state...');
            await this.reset();
            
            // Clear read states for a fresh start
            try {
                await this.readTracker.clearReadStates();
                console.log('Email read states cleared for new session');
            } catch (error) {
                console.error('Failed to clear email read states:', error);
            }
            
            // Clear the fresh start flag
            localStorage.removeItem('cyberquest_level_2_fresh_start');
        }
    }

    createContent() {
        // Check if data is loaded, if not show loading message
        if (!this.isInitialized) {
            // Start initialization if not already started
            if (!this.initializationPromise) {
                this.initializationPromise = this.ensureInitialized().then(() => {
                    // Update content once initialized
                    this.updateContent();
                });
            }
            
            return `
                <div class="h-full flex items-center justify-center">
                    <div class="text-center">
                        <div class="text-lg font-medium text-gray-300 mb-2">Loading Email Data...</div>
                        <div class="text-sm text-gray-500">Fetching emails from JSON database</div>
                        <div class="mt-4">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const currentFolder = this.state.getCurrentFolder();
        const selectedEmailId = this.state.getSelectedEmailId();
        
        // Get all emails and filter by folder
        const allEmails = [...ALL_EMAILS];
        const emails = this.state.getEmailsForFolder(allEmails, currentFolder);
        
        // Sort emails by timestamp (most recent first)
        emails.sort((a, b) => {
            const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : this.parseTimeForSorting(a.time);
            const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : this.parseTimeForSorting(b.time);
            return timestampB - timestampA; // Descending order (newest first)
        });
        
        const selectedEmail = selectedEmailId ? allEmails.find(e => e.id === selectedEmailId) : null;
        const inboxCount = this.state.getEmailsForFolder(allEmails, 'inbox').length;
        const spamCount = this.state.getEmailsForFolder(allEmails, 'spam').length;

        return `
            <div class="h-full flex">
                <div class="w-48 bg-gray-700 border-r border-gray-600 p-3 flex flex-col">
                    <div class="email-folder px-3 py-2 rounded text-sm font-medium mb-1 cursor-pointer transition-colors duration-200
                        ${currentFolder === 'inbox' ? 'bg-green-400 text-black' : 'text-gray-300 hover:bg-gray-600'}"
                        data-folder="inbox">
                        📧 Inbox (${inboxCount})
                    </div>
                    <div class="email-folder px-3 py-2 rounded text-sm font-medium mb-1 cursor-pointer transition-colors duration-200
                        ${currentFolder === 'spam' ? 'bg-red-400 text-black' : 'text-gray-300 hover:bg-gray-600'}"
                        data-folder="spam">
                        🗑️ Spam (${spamCount})
                    </div>
                </div>
                <div class="flex-1 flex flex-col">
                    <div class="flex-1 overflow-y-auto" id="email-list">
                        ${selectedEmail
                            ? this.createEmailDetail(selectedEmail, currentFolder)
                            : emails.map(email => this.createEmailListItem(email)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Parse time strings for sorting when timestamp is not available
    parseTimeForSorting(timeString) {
        const now = Date.now();
        const lowerTime = timeString.toLowerCase();
        
        if (lowerTime.includes('min ago')) {
            const minutes = parseInt(lowerTime) || 0;
            return now - (minutes * 60 * 1000);
        } else if (lowerTime.includes('hour ago') || lowerTime.includes('hours ago')) {
            const hours = parseInt(lowerTime) || 0;
            return now - (hours * 60 * 60 * 1000);
        } else if (lowerTime.includes('yesterday')) {
            return now - (24 * 60 * 60 * 1000);
        } else if (lowerTime.includes('day ago') || lowerTime.includes('days ago')) {
            const days = parseInt(lowerTime) || 0;
            return now - (days * 24 * 60 * 60 * 1000);
        } else if (lowerTime.includes('last week')) {
            return now - (7 * 24 * 60 * 60 * 1000);
        } else {
            // Try to parse as date
            const parsed = new Date(timeString);
            return isNaN(parsed.getTime()) ? now : parsed.getTime();
        }
    }

    createEmailListItem(email) {
        const isRead = this.readTracker.isRead(email.id);
        const { statusIndicator, statusClass } = this.state.securityManager.createStatusIndicator(email.id, isRead);

        // Get both date and time display
        const displayDateTime = this.getDateTimeDisplay(email);

        return `
            <div class="email-item p-3 border-b border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors duration-200 flex items-center"
                 data-email-id="${email.id}">
                <span class="inline-block w-2 h-2 rounded-full mr-3 ${statusClass}"></span>
                <div class="flex-1">
                    <div class="font-medium text-white text-sm flex items-center">
                        ${email.sender}
                        ${statusIndicator}
                    </div>
                    <div class="text-sm mb-1 ${isRead ? 'text-gray-300 font-normal' : 'text-white font-bold'}">${email.subject}</div>
                    <div class="text-gray-400 text-xs">${displayDateTime}</div>
                </div>
            </div>
        `;
    }

    // Get formatted date and time for email list display
    getDateTimeDisplay(email) {
        if (email.timestamp) {
            const date = new Date(email.timestamp);
            const now = new Date();
            const diffInHours = (now - date) / (1000 * 60 * 60);
            
            // If today, show time only
            if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
                return date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
            }
            
            // If yesterday, show "Yesterday" + time
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return `Yesterday ${date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })}`;
            }
            
            // If this year, show month/day + time
            if (date.getFullYear() === now.getFullYear()) {
                return `${date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })} ${date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })}`;
            }
            
            // If older, show full date + time
            return `${date.toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'short', 
                day: 'numeric' 
            })} ${date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })}`;
        }
        
        // Fallback to original time string if no timestamp
        return email.time;
    }

    createEmailDetail(email, folderId) {
        // Mark as read when viewing detail
        this.readTracker.markAsRead(email.id);
        
        const statusBadge = this.state.securityManager.createStatusBadge(email.id);
        const emailStatus = this.state.getEmailStatus(email.id);

        // Use full date time if available, otherwise format the time
        const displayTime = email.fullDateTime || this.formatDetailTime(email);

        return `
            <div class="p-6">
                <!-- Action buttons and status in streamlined header -->
                <div class="mb-4 flex items-start justify-between">
                    <div class="flex items-center space-x-2">
                        <button class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-sm cursor-pointer flex items-center" id="back-btn">
                            <i class="bi bi-arrow-left mr-1 text-md"></i>Back
                        </button>
                        ${this.state.securityManager.createActionButtons(email.id, this.state.getCurrentFolder())}
                    </div>
                    ${statusBadge ? `<div class="flex-shrink-0">${statusBadge}</div>` : ''}
                </div>
                
                <!-- Security alerts -->
                ${emailStatus === 'phishing' ? this.state.securityManager.createPhishingWarning() : ''}
                ${emailStatus === 'legitimate' ? this.state.securityManager.createLegitimateConfirmation() : ''}
                
                <!-- Email information -->
                <div class="mb-4">
                    <div class="font-medium text-lg text-white">${email.subject}</div>
                    <div class="bg-gray-700 rounded p-3 mt-3 text-sm">
                        <div class="grid grid-cols-1 gap-2">
                            <div class="flex">
                                <span class="text-gray-400 w-16 flex-shrink-0">From:</span>
                                <span class="text-white break-all">${this.formatSenderDetails(email.sender)}</span>
                            </div>
                            <div class="flex">
                                <span class="text-gray-400 w-16 flex-shrink-0">To:</span>
                                <span class="text-white">${email.receiver || 'user@company.com'}</span>
                            </div>
                            <div class="flex">
                                <span class="text-gray-400 w-16 flex-shrink-0">Date:</span>
                                <span class="text-white">${email.date || displayTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-800 text-white text-sm p-4 rounded border border-gray-600">
                    <div class="whitespace-pre-wrap break-words">
${this.formatEmailBody(email.body)}
                    </div>
                </div>
            </div>
        `;
    }

    // Format time for detail view when fullDateTime is not available
    formatDetailTime(email) {
        if (email.timestamp) {
            const date = new Date(email.timestamp);
            return date.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            });
        }
        return email.time;
    }

    // Format sender details to show full email address
    formatSenderDetails(sender) {
        if (!sender) return 'Unknown Sender';
        
        // If the sender already contains angle brackets, return as-is
        if (sender.includes('<') && sender.includes('>')) {
            return sender;
        }
        
        // If it's just an email address, return the full email address
        if (sender.includes('@')) {
            return sender;
        }
        
        // If it's already a display name without email, return as-is
        return sender;
    }

    // Format email body to preserve CSV formatting and handle special characters
    formatEmailBody(body) {
        if (!body) return '<em class="text-gray-400">No content available</em>';
        
        // Convert to string and handle potential undefined/null values
        const bodyText = String(body).trim();
        
        if (!bodyText) return '<em class="text-gray-400">Empty message</em>';
        
        // Escape HTML characters to prevent XSS while preserving content
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        // Escape the body content first
        let formattedBody = escapeHtml(bodyText);
        
        // Convert newlines to HTML line breaks for proper display
        formattedBody = formattedBody.replace(/\n/g, '<br>');
        
        // Handle multiple consecutive line breaks (preserve spacing but limit excessive spacing)
        formattedBody = formattedBody.replace(/(<br>\s*){4,}/g, '<br><br><br>');
        
        // Handle URLs that might be present in the email body
        // This will make URLs clickable but still safe (they're already escaped)
        const urlRegex = /(https?:\/\/[^\s<>]+)/gi;
        formattedBody = formattedBody.replace(urlRegex, (url) => {
            // Re-escape any HTML entities that might have been in the URL
            const safeUrl = url.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">${url}</a>`;
        });
        
        return formattedBody;
    }

    initialize() {
        super.initialize();
        
        // Initialize action handler
        this.actionHandler.initialize();
        
        // Initialize completion tracker
        this.completionTracker.initialize();
        
        // Clean up old read status for emails that no longer exist
        const currentEmailIds = ALL_EMAILS.map(email => email.id);
        this.readTracker.cleanupOldReadStatus(currentEmailIds);
        
        this.bindEvents();
    }

    cleanup() {
        // Clean up completion tracker
        this.completionTracker.cleanup();
        
        // Clean up action handler
        this.actionHandler.cleanup();
        
        super.cleanup();
    }

    updateContent() {
        // Re-render content and re-bind events to ensure UI updates and handlers are attached
        if (this.windowElement) {
            const contentElement = this.windowElement.querySelector('.window-content');
            if (contentElement) {
                contentElement.innerHTML = this.createContent();
                this.bindEvents();
            }
        }
    }

    bindEvents() {
        const windowElement = this.windowElement;
        if (!windowElement) return;

        // Folder switching
        windowElement.querySelectorAll('.email-folder').forEach(folderEl => {
            folderEl.addEventListener('click', () => {
                const folderId = folderEl.getAttribute('data-folder');
                this.actionHandler.handleFolderSwitch(folderId);
            });
        });

        // Email list item click
        windowElement.querySelectorAll('.email-item').forEach(emailEl => {
            emailEl.addEventListener('click', () => {
                const emailId = emailEl.getAttribute('data-email-id');
                this.actionHandler.handleEmailOpen(emailId);
            });
        });

        // Back button
        const backBtn = windowElement.querySelector('#back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.actionHandler.handleBackNavigation();
            });
        }

        // Report phishing button
        const reportPhishingBtn = windowElement.querySelector('#report-phishing-btn');
        if (reportPhishingBtn) {
            reportPhishingBtn.addEventListener('click', () => {
                const emailId = reportPhishingBtn.getAttribute('data-email-id');
                this.actionHandler.reportPhishingEmail(emailId);
            });
        }

        // Mark legitimate button
        const markLegitimateBtn = windowElement.querySelector('#mark-legitimate-btn');
        if (markLegitimateBtn) {
            markLegitimateBtn.addEventListener('click', () => {
                const emailId = markLegitimateBtn.getAttribute('data-email-id');
                this.actionHandler.markEmailAsLegitimate(emailId);
            });
        }

        // Move to inbox button
        const moveToInboxBtn = windowElement.querySelector('#move-to-inbox-btn');
        if (moveToInboxBtn) {
            moveToInboxBtn.addEventListener('click', () => {
                const emailId = moveToInboxBtn.getAttribute('data-email-id');
                this.actionHandler.moveEmailToInbox(emailId);
            });
        }
    }

    // Get comprehensive email statistics including completion status
    getEmailStats() {
        const allEmails = [...ALL_EMAILS];
        const readingStats = this.readTracker.getReadingStats(allEmails);
        const securityStats = this.state.securityManager.getSecurityStats();
        const completionStats = this.completionTracker.getCompletionStats();
        
        return {
            ...readingStats,
            ...securityStats,
            ...completionStats,
            lastUpdate: this.readTracker.getLastUpdateTimestamp()
        };
    }

    // Utility method to mark all emails as read
    markAllEmailsAsRead() {
        const allEmails = [...ALL_EMAILS];
        this.readTracker.markAllAsRead(allEmails);
        this.updateContent();
    }

    // Utility method to mark all emails as unread
    markAllEmailsAsUnread() {
        const allEmails = [...ALL_EMAILS];
        this.readTracker.markAllAsUnread(allEmails);
        this.updateContent();
    }

    // Reset method to clear CLIENT-SIDE email app state only (preserve server data)
    async reset() {
        try {
            console.log('Resetting email app CLIENT-SIDE state (preserving server data)...');
            
            // Clear all read tracking (client-side only)
            this.readTracker.clearClientState();
            
            // Reset email state (folder, selection, etc.)
            this.state.reset();
            
            // Reset security manager (client-side only)
            this.state.securityManager.resetClientState();
            
            // Reset action handler and feedback (client-side only)
            this.actionHandler.resetClientState();
            
            // Reset completion tracker
            this.completionTracker.reset();
            
            // Refresh the UI
            this.updateContent();
            
            console.log('Email app CLIENT-SIDE state reset completed (server data preserved)');
        } catch (error) {
            console.error('Failed to reset email app:', error);
        }
    }

    // Debug methods for troubleshooting
    debugCurrentState() {
        const readTrackerState = this.readTracker.debugCurrentState();
        const securityManagerState = this.state.securityManager.exportSecurityData();
        
        console.log('=== EMAIL APP DEBUG STATE ===');
        console.log('Read Tracker:', readTrackerState);
        console.log('Security Manager:', securityManagerState);
        console.log('Current Folder:', this.state.getCurrentFolder());
        console.log('Selected Email:', this.state.getSelectedEmailId());
        console.log('===============================');
        
        return {
            readTracker: readTrackerState,
            securityManager: securityManagerState,
            currentFolder: this.state.getCurrentFolder(),
            selectedEmail: this.state.getSelectedEmailId()
        };
    }

    // Force reset method for manual debugging
    async debugForceReset() {
        console.log('=== FORCING EMAIL APP RESET ===');
        localStorage.setItem('cyberquest_level_2_fresh_start', 'true');
        await this.reset();
        console.log('=== RESET COMPLETED ===');
    }

}

// For backward compatibility, also expose readEmails as a getter
Object.defineProperty(EmailApp.prototype, 'readEmails', {
    get: function() {
        return {
            has: (emailId) => this.readTracker.isRead(emailId),
            add: (emailId) => this.readTracker.markAsRead(emailId),
            size: this.readTracker.getReadCount()
        };
    }
});