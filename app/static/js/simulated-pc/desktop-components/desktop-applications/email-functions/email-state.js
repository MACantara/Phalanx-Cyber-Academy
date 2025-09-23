import { EmailSecurityManager } from './email-security-manager.js';

export class EmailState {
    constructor() {
        this.currentFolder = 'inbox';
        this.selectedEmailId = null;
        this.securityManager = new EmailSecurityManager();
    }

    setFolder(folderId) {
        this.currentFolder = folderId;
        this.selectedEmailId = null;
    }

    selectEmail(emailId) {
        this.selectedEmailId = emailId;
    }

    getCurrentFolder() {
        return this.currentFolder;
    }

    getSelectedEmailId() {
        return this.selectedEmailId;
    }

    // Delegate security operations to EmailSecurityManager
    reportAsPhishing(emailId) {
        return this.securityManager.reportAsPhishing(emailId);
    }

    markAsLegitimate(emailId) {
        return this.securityManager.markAsLegitimate(emailId);
    }

    moveToSpam(emailId) {
        return this.securityManager.moveToSpam(emailId);
    }

    isInSpam(emailId) {
        return this.securityManager.isInSpam(emailId);
    }

    isReportedAsPhishing(emailId) {
        return this.securityManager.isReportedAsPhishing(emailId);
    }

    isMarkedAsLegitimate(emailId) {
        return this.securityManager.isMarkedAsLegitimate(emailId);
    }

    getEmailStatus(emailId) {
        return this.securityManager.getEmailStatus(emailId);
    }

    getEmailsForFolder(allEmails, folderId) {
        return this.securityManager.getEmailsForFolder(allEmails, folderId);
    }

    // Persistence methods
    async loadFromServer() {
        // EmailSecurityManager now uses in-memory storage only
        // No server loading required
        return Promise.resolve();
    }

    // Statistics methods
    getEmailStats() {
        return this.securityManager.getSecurityStats();
    }

    // Access to security manager for advanced operations
    getSecurityManager() {
        return this.securityManager;
    }

    // Reset email state to initial values
    reset() {
        this.currentFolder = 'inbox';
        this.selectedEmailId = null;
        // Note: security manager will be reset separately by the email app
    }
}
