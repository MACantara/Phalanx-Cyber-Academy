export class EmailReadTracker {
    constructor() {
        this.readEmails = new Set();
        this.isLoaded = true; // Always loaded since we're not waiting for server
    }

    // Mark an email as read (in memory only)
    markAsRead(emailId) {
        if (!emailId) return false;
        
        this.readEmails.add(emailId);
        
        // Emit event for any listeners
        document.dispatchEvent(new CustomEvent('email-marked-read', {
            detail: { 
                emailId, 
                timestamp: new Date().toISOString(),
                totalRead: this.readEmails.size
            }
        }));
        
        return true;
    }

    /**
     * Mark multiple emails as read (in-memory only)
     * @param {string[]} emailIds - Array of email IDs to mark as read
     * @returns {boolean} True if any emails were marked as read, false otherwise
     */
    markMultipleAsRead(emailIds) {
        if (!Array.isArray(emailIds)) return false;
        
        const newlyRead = emailIds.filter(id => id && !this.readEmails.has(id));
        
        if (newlyRead.length > 0) {
            newlyRead.forEach(id => this.readEmails.add(id));
            
            // Emit bulk event
            document.dispatchEvent(new CustomEvent('emails-marked-read', {
                detail: { 
                    emailIds: newlyRead,
                    timestamp: new Date().toISOString(),
                    totalRead: this.readEmails.size
                }
            }));
            
            return true;
        }
        
        return false;
    }

    /**
     * Check if an email is marked as read
     * @param {string} emailId - The ID of the email to check
     * @returns {boolean} True if the email is marked as read, false otherwise
     */
    isRead(emailId) {
        return emailId ? this.readEmails.has(emailId) : false;
    }

    // Mark an email as unread (in memory only)
    markAsUnread(emailId) {
        if (!emailId || !this.readEmails.has(emailId)) return false;
        
        this.readEmails.delete(emailId);
        
        // Emit event
        document.dispatchEvent(new CustomEvent('email-marked-unread', {
            detail: { 
                emailId, 
                timestamp: new Date().toISOString(),
                totalRead: this.readEmails.size
            }
        }));
        
        return true;
    }

    /**
     * Get all read email IDs
     * @returns {string[]} Array of email IDs that are marked as read
     */
    getReadEmails() {
        return Array.from(this.readEmails);
    }

    // Get unread emails from a list
    getUnreadEmails(allEmails) {
        return allEmails.filter(email => !this.isRead(email.id));
    }

    // Get read emails from a list
    getReadEmailsFromList(allEmails) {
        return allEmails.filter(email => this.isRead(email.id));
    }

    // Get read count
    getReadCount() {
        return this.readEmails.size;
    }

    // Get unread count from a list of emails
    getUnreadCount(allEmails) {
        return allEmails.filter(email => !this.isRead(email.id)).length;
    }

    // Check if all emails are read
    areAllRead(allEmails) {
        return allEmails.every(email => this.isRead(email.id));
    }

    // Get reading statistics
    getReadingStats(allEmails) {
        const total = allEmails.length;
        const read = allEmails.filter(email => this.isRead(email.id)).length;
        const unread = total - read;
        const readPercentage = total > 0 ? Math.round((read / total) * 100) : 0;
        
        return {
            total,
            read,
            unread,
            readPercentage,
            allRead: read === total
        };
    }

    // Filter emails by read status
    filterByReadStatus(allEmails, readStatus) {
        switch (readStatus) {
            case 'read':
                return this.getReadEmailsFromList(allEmails);
            case 'unread':
                return this.getUnreadEmails(allEmails);
            default:
                return allEmails;
        }
    }

    // Mark all emails as read (in memory only)
    markAllAsRead(allEmails) {
        let changed = false;
        
        allEmails.forEach(email => {
            if (!this.readEmails.has(email.id)) {
                this.readEmails.add(email.id);
                changed = true;
            }
        });
        
        if (changed) {
            // Emit event
            document.dispatchEvent(new CustomEvent('all-emails-marked-read', {
                detail: { 
                    emailIds: allEmails.map(e => e.id),
                    timestamp: new Date().toISOString(),
                    totalRead: this.readEmails.size
                }
            }));
        }
        
        return changed;
    }

    // Mark all emails as unread (in memory only)
    markAllAsUnread(allEmails) {
        let changed = false;
        
        allEmails.forEach(email => {
            if (this.readEmails.has(email.id)) {
                this.readEmails.delete(email.id);
                changed = true;
            }
        });
        
        if (changed) {
            // Emit event
            document.dispatchEvent(new CustomEvent('all-emails-marked-unread', {
                detail: { 
                    emailIds: allEmails.map(e => e.id),
                    timestamp: new Date().toISOString(),
                    totalRead: this.readEmails.size
                }
            }));
        }
        
        return changed;
    }

    /**
     * Clear all read states (in memory only)
     */
    clearReadStates() {
        this.readEmails.clear();
        console.log('Email read states cleared');
        
        // Emit event to update UI
        document.dispatchEvent(new CustomEvent('read-states-cleared', {
            detail: {
                timestamp: new Date().toISOString()
            }
        }));
        
        return true;
    }

    // Auto-mark as read when email is opened (with delay)
    autoMarkAsRead(emailId, delay = 0) {
        if (delay > 0) {
            setTimeout(() => {
                this.markAsRead(emailId);
            }, delay);
        } else {
            this.markAsRead(emailId);
        }
    }

    // No server persistence - all operations are in-memory only
    ensureLoaded() {
        return Promise.resolve();
    }

    // Get last update timestamp
    getLastUpdateTimestamp() {
        // Since we're now using in-memory storage, this method can return null
        return null;
    }

    // Export data for backup/migration
    exportData() {
        return {
            readEmails: Array.from(this.readEmails),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Import data from backup
    async importData(data) {
        try {
            if (data && Array.isArray(data.readEmails)) {
                this.readEmails = new Set(data.readEmails);
                
                // Emit import event
                document.dispatchEvent(new CustomEvent('read-emails-imported', {
                    detail: { 
                        count: this.readEmails.size,
                        timestamp: new Date().toISOString()
                    }
                }));
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import read emails data:', error);
            return false;
        }
    }

    // Clear all read status
    async clearAllReadStatus() {
        const hadEmails = this.readEmails.size > 0;
        this.readEmails.clear();
        
        if (hadEmails) {
            // Emit clear event
            document.dispatchEvent(new CustomEvent('read-emails-cleared', {
                detail: { 
                    timestamp: new Date().toISOString()
                }
            }));
        }
        
        return hadEmails;
    }

    // Clear CLIENT-SIDE read status only (preserve server analytics)
    clearClientState() {
        console.log('Clearing client-side read status (preserving server analytics)...');
        this.readEmails.clear();
        console.log('Client-side read status cleared');
    }

    // Force reload from server (for debugging/testing)
    async forceReload() {
        this.isLoaded = false;
        this.readEmails.clear();
        await this.loadFromServer();
        console.log('Forced reload completed. Read emails:', Array.from(this.readEmails));
        return this.readEmails.size;
    }

    // Debug method to check current state
    debugCurrentState() {
        console.log('EmailReadTracker Debug Info:');
        console.log('  isLoaded:', this.isLoaded);
        console.log('  readEmails count:', this.readEmails.size);
        console.log('  readEmails:', Array.from(this.readEmails));
        return {
            isLoaded: this.isLoaded,
            readEmailsCount: this.readEmails.size,
            readEmails: Array.from(this.readEmails)
        };
    }

    // Cleanup old read status for emails that no longer exist
    async cleanupOldReadStatus(currentEmailIds) {
        const currentSet = new Set(currentEmailIds);
        let removed = 0;
        
        for (const emailId of this.readEmails) {
            if (!currentSet.has(emailId)) {
                this.readEmails.delete(emailId);
                removed++;
            }
        }
        
        if (removed > 0) {
            await this.saveToServer();
            
            // Emit cleanup event
            document.dispatchEvent(new CustomEvent('read-emails-cleaned', {
                detail: { 
                    removedCount: removed,
                    timestamp: new Date().toISOString()
                }
            }));
        }
        
        return removed;
    }

    // Get read status summary for debugging
    getSummary(allEmails = []) {
        const stats = this.getReadingStats(allEmails);
        const lastUpdate = this.getLastUpdateTimestamp();
        
        return {
            ...stats,
            lastUpdate,
            storageKey: this.storageKey,
            readEmailIds: Array.from(this.readEmails)
        };
    }

    // Create visual indicator for read/unread status
    createReadStatusIndicator(emailId, options = {}) {
        const isRead = this.isRead(emailId);
        const {
            readClass = 'bg-gray-400',
            unreadClass = 'bg-blue-500',
            size = 'w-2 h-2',
            shape = 'rounded-full',
            title = isRead ? 'Read' : 'Unread'
        } = options;
        
        const statusClass = isRead ? readClass : unreadClass;
        
        return `<span class="inline-block ${size} ${shape} ${statusClass} mr-3" title="${title}"></span>`;
    }

    // Batch operations for performance
    async batchOperation(operations) {
        let changed = false;
        
        operations.forEach(({ action, emailId }) => {
            switch (action) {
                case 'read':
                    if (!this.readEmails.has(emailId)) {
                        this.readEmails.add(emailId);
                        changed = true;
                    }
                    break;
                case 'unread':
                    if (this.readEmails.has(emailId)) {
                        this.readEmails.delete(emailId);
                        changed = true;
                    }
                    break;
            }
        });
        
        if (changed) {
            await this.saveToServer();
        }
        
        return changed;
    }
}
