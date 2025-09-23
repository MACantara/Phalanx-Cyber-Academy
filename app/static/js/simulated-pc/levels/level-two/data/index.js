/**
 * Level 2: Shadow in the Inbox - Data exports
 * Central export file for all Level 2 data modules
 * 
 * Data Source: phishing_emails.json + legitimate_emails.json
 * - phishing_emails.json: Contains 20 realistic phishing emails with comprehensive AI analysis
 * - legitimate_emails.json: Contains 20 legitimate emails with educational safety factors
 * 
 * Each email includes detailed AI analysis for educational purposes.
 */

// Email data loader from JSON API
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

// Check JSON data availability
export async function checkEmailDataStatus() {
    try {
        const response = await fetch('/api/emails/csv-status');
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error checking email data status:', error);
        return {
            success: false,
            json_data_available: false,
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
    id: 'phish_001',
    sender: 'security@paypal-verification.com',
    receiver: 'user@example.com',
    date: '2024-03-15 09:32:15',
    subject: 'URGENT: Your PayPal Account Has Been Limited',
    body: 'Dear PayPal User,\n\nWe have detected suspicious activity on your account...',
    is_phishing: 1, // 1 for phishing, 0 for legitimate
    ai_analysis: {
        risk_level: 'high', // 'high', 'medium', or 'low'
        phishing_indicators: [
            'Suspicious domain (@paypal-verification.com vs official @paypal.com)',
            'Generic greeting without personalization',
            'Urgent language creating false sense of emergency',
            'Suspicious URL with non-PayPal domain',
            'Pressure tactics with time limit'
        ],
        safety_factors: [], // Empty for phishing emails, populated for legitimate
        educational_focus: 'This email demonstrates classic phishing tactics including domain spoofing, urgency, and fear-based manipulation.',
        red_flags: [
            'Domain does not match official PayPal domain',
            'Generic greeting instead of personalized name',
            'Creates false urgency with threat of account closure',
            'Suspicious link destination',
            'Poor grammar and formatting'
        ],
        verification_tips: [
            'Always verify sender domain matches official company domain',
            'Look for personalized greetings using your actual name',
            'Be suspicious of urgent deadlines and threats',
            'Hover over links to check destination before clicking',
            'Contact company directly through official channels to verify'
        ]
    }
};

// Data source information
export const dataSourceInfo = {
    phishing_source: 'phishing_emails.json',
    legitimate_source: 'legitimate_emails.json',
    combined_source: 'phishing_emails.json + legitimate_emails.json',
    structure: {
        format: 'JSON',
        email_count: {
            phishing: 20,
            legitimate: 20,
            total: 40
        },
        classification_method: 'pre_classified', // All emails pre-classified with comprehensive AI analysis
        phishing_determination: 'is_phishing_field', // is_phishing: 1 for phishing emails
        legitimate_determination: 'is_phishing_field', // is_phishing: 0 for legitimate emails
        ai_analysis_included: true,
        description: 'Curated dataset of realistic phishing and legitimate emails with detailed AI analysis for educational purposes.'
    }
};

// Future exports will include:
// export { emailTemplates } from './email-templates.js';
// export { securityAlerts } from './security-alerts.js';

// Dataset Statistics:
// - Total emails: 40 (20 phishing + 20 legitimate)
// - Phishing emails: 20 realistic examples covering major attack vectors
// - Legitimate emails: 20 authentic examples from popular services
// - Mixed emails endpoint returns: 8 phishing + 7 legitimate (15 total) for Level 2
// - All emails include comprehensive AI analysis with educational components
// - Phishing emails cover: PayPal, Amazon, Microsoft, banking, social media, crypto, delivery, lottery scams
// - Legitimate emails cover: GitHub, Amazon orders, Microsoft security, Slack, Dropbox, LinkedIn, Spotify, etc.
