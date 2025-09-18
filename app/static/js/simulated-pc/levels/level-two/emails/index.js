// Level 2 Email Registry Index
// Email templates and configurations for Shadow in the Inbox
// Now using CEAS_08.csv dataset via API

export { ALL_EMAILS, loadEmailsFromCSV } from './email-registry.js';
export { BaseEmail } from './base-email.js';

// Email categories for Level 2 - Now dynamically loaded from CSV dataset
// The CEAS_08.csv contains 39,126 emails with both legitimate and phishing examples
export const LEVEL_2_EMAILS = {
    DATASET_INFO: {
        source: 'CEAS_08.csv',
        total_emails: 39126,
        phishing_emails: 21829,
        legitimate_emails: 17297,
        fields: ['sender', 'receiver', 'date', 'subject', 'body', 'label']
    },
    CATEGORIES: {
        LEGITIMATE: 'Legitimate emails from the dataset (label: 0)',
        PHISHING: 'Phishing emails from the dataset (label: 1)'
    },
    ENDPOINTS: {
        mixed: '/api/emails/mixed-emails',
        sample: '/api/emails/sample',
        status: '/api/emails/csv-status'
    }
};

console.log('Level 2 Emails loaded: Email registry with CSV dataset from CEAS_08.csv');
