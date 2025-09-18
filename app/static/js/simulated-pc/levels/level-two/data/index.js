/**
 * Level 2: Shadow in the Inbox - Data exports
 * Central export file for all Level 2 data modules
 */

// Email data loader from CSV API
export async function loadPhishingEmails() {
    try {
        const response = await fetch('/api/emails/mixed-emails');
        const data = await response.json();
        
        if (data.success) {
            return {
                success: true,
                emails: data.emails,
                summary: data.summary
            };
        } else {
            console.error('Failed to load phishing emails:', data.error);
            return {
                success: false,
                error: data.error,
                emails: []
            };
        }
    } catch (error) {
        console.error('Error loading phishing emails:', error);
        return {
            success: false,
            error: error.message,
            emails: []
        };
    }
}

// Get email statistics
export async function getEmailStats() {
    try {
        const response = await fetch('/api/emails/stats');
        const data = await response.json();
        
        if (data.success) {
            return data.stats;
        } else {
            console.error('Failed to load email stats:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error loading email stats:', error);
        return null;
    }
}

// Check CSV data availability
export async function checkEmailDataStatus() {
    try {
        const response = await fetch('/api/emails/csv-status');
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error checking email data status:', error);
        return {
            success: false,
            csv_data_available: false,
            error: error.message
        };
    }
}

// Get sample emails for testing
export async function getSampleEmails() {
    try {
        const response = await fetch('/api/emails/sample');
        const data = await response.json();
        
        if (data.success) {
            return data.emails;
        } else {
            console.error('Failed to load sample emails:', data.error);
            return [];
        }
    } catch (error) {
        console.error('Error loading sample emails:', error);
        return [];
    }
}

// Legacy export for compatibility
export const level2DataLoaded = true;

// Email data structure documentation for developers
export const emailDataStructure = {
    id: 'email_123',
    sender: 'sender@example.com',
    receiver: 'receiver@example.com', 
    date: 'Tue, 05 Aug 2008 16:31:02 -0700',
    subject: 'Email subject line',
    body: 'Email body content...',
    label: 1, // 1 = phishing, 0 = legitimate (not displayed, for checking only)
    is_phishing: true, // Boolean flag for easy checking
    email_type: 'phishing', // 'phishing' or 'legitimate'
    ai_analysis: {
        risk_level: 'high', // 'high' or 'low'
        phishing_indicators: ['Suspicious sender', 'Urgent language'],
        safety_factors: ['Verified sender', 'Professional formatting'],
        educational_focus: 'This email demonstrates phishing email characteristics.',
        red_flags: ['Poor grammar or spelling', 'Generic greetings'],
        verification_tips: ['Check sender email address carefully', 'Hover over links before clicking']
    }
};

// Future exports will include:
// export { emailTemplates } from './email-templates.js';
// export { securityAlerts } from './security-alerts.js';
