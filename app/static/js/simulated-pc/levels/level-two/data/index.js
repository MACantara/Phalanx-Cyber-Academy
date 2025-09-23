/**
 * Level 2: Shadow in the Inbox - Data exports
 * Central export file for all Level 2 data modules
 * 
 * Data Source: phishing.csv + legit.csv
 * - phishing.csv: Contains confirmed phishing emails 
 * - legit.csv: Contains legitimate emails
 * 
 * Note: The 'label' column in CSV files indicates human vs LLM generation,
 * NOT phishing vs legitimate classification. Email type is determined by source file.
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
    sender: 'Jesus Miguel Recuenco Ezquerra <JMRECU@teleline.es>',
    receiver: 'handy board <handyboard@media.mit.edu>', 
    date: '29/10/2019 22:53',
    subject: 'Starting IC with wizard',
    body: 'Hi\n\n\t\tI am running the IR test program from Max Davies. To do this I need to start\nIC with thw wizard option. As I have a macintosh, there is a wizard option for\nthe mac version of IC?\n\nJesus\n\n',
    urls: '0', // URL indicator from CSV
    original_label: 0, // Human vs LLM generation indicator (not phishing classification)
    is_phishing: false, // Boolean flag based on source file (legit.csv = false, phishing.csv = true)
    email_type: 'legitimate', // 'phishing' or 'legitimate' - determined by source file
    ai_analysis: {
        risk_level: 'low', // 'high' or 'low'
        phishing_indicators: [], // Empty for legitimate emails
        safety_factors: ['Verified sender', 'Professional formatting', 'Technical discussion'],
        educational_focus: 'This email demonstrates legitimate email characteristics.',
        red_flags: [], // Empty for legitimate emails
        verification_tips: ['Check sender email address carefully', 'Hover over links before clicking', 'Verify sender through alternative means']
    }
};

// Data source information
export const dataSourceInfo = {
    phishing_source: 'phishing.csv',
    legitimate_source: 'legit.csv',
    combined_source: 'phishing.csv + legit.csv',
    structure: {
        columns: ['sender', 'receiver', 'date', 'subject', 'body', 'urls', 'label'],
        classification_method: 'source_file', // Classification based on which file email comes from
        label_meaning: 'human_vs_llm_generation', // NOT phishing classification
        phishing_determination: 'emails_from_phishing_csv',
        legitimate_determination: 'emails_from_legit_csv',
        description: 'Combined dataset from separate phishing and legitimate email CSV files. Email type determined by source file, not label column.'
    }
};

// Future exports will include:
// export { emailTemplates } from './email-templates.js';
// export { securityAlerts } from './security-alerts.js';

// Dataset Statistics (as of current load):
// - Total emails: 1,929 (after filtering invalid entries)
// - Phishing emails: 998 (from phishing.csv - classification by source file)
// - Legitimate emails: 931 (from legit.csv - classification by source file)  
// - Mixed emails endpoint returns: 8 phishing + 7 legitimate (15 total) for Level 2
// - Original 'label' column indicates human (0) vs LLM (1) generation, NOT phishing classification
