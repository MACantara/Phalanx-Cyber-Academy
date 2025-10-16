// Centralized registry for all emails - now using JSON data

// Import data loading functions
import { loadPhishingEmails } from '../data/index.js';

// Global email storage that will be populated from JSON API
let emailData = [];
let emailsLoaded = false;
let loadingPromise = null;

// Load emails from JSON API
async function loadEmailsFromJSON() {
    if (loadingPromise) {
        return loadingPromise;
    }
    
    loadingPromise = (async () => {
        try {
            console.log('Loading emails from JSON API...');
            const result = await loadPhishingEmails();
            
            if (result.success && result.emails) {
                emailData = result.emails.map((email, index) => ({
                    id: email.id || `email_${index + 1}`,
                    folder: 'inbox',
                    sender: email.sender || 'unknown@example.com',
                    receiver: email.receiver || 'user@example.com',
                    subject: email.subject || 'No Subject',
                    body: email.body || 'No content available.',
                    time: email.date ? formatEmailTime(email.date) : formatEmailTime(new Date()),
                    fullDateTime: email.date ? formatFullDateTime(email.date) : formatFullDateTime(new Date()),
                    timestamp: email.date ? new Date(email.date) : new Date(),
                    suspicious: email.is_phishing === 1, // 1 = phishing, 0 = legitimate
                    priority: email.is_phishing === 1 ? 'high' : 'normal',
                    attachments: [],
                    // Additional JSON data for reference
                    email_type: email.is_phishing === 1 ? 'phishing' : 'legitimate',
                    originalIsPhishing: email.is_phishing,
                    ai_analysis: email.ai_analysis || {}
                }));
                
                emailsLoaded = true;
                console.log(`Loaded ${emailData.length} emails from JSON API (${result.summary?.phishing_count || 0} phishing, ${result.summary?.legitimate_count || 0} legitimate)`);
                return emailData;
            } else {
                console.error('Failed to load emails from JSON API:', result.error);
                // Fallback to empty array if JSON loading fails
                emailData = [];
                emailsLoaded = true;
                return emailData;
            }
        } catch (error) {
            console.error('Error loading emails from JSON API:', error);
            // Fallback to empty array on error
            emailData = [];
            emailsLoaded = true;
            return emailData;
        }
    })();
    
    return loadingPromise;
}

// Helper function to format email time
function formatEmailTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
        return 'Just now';
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Helper function to format full date time
function formatFullDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Export ALL_EMAILS as a getter that ensures data is loaded
export const ALL_EMAILS = new Proxy([], {
    get(target, prop) {
        if (!emailsLoaded) {
            console.warn('Emails not yet loaded from JSON API. Use await loadEmailsFromCSV() first.');
            // Return empty array for most operations to prevent errors
            if (prop === 'length') return 0;
            if (prop === Symbol.iterator) {
                return function* () {
                    // Empty iterator
                };
            }
            if (typeof prop === 'string' && !isNaN(prop)) return undefined;
            if (prop === 'map' || prop === 'filter' || prop === 'find' || prop === 'forEach') {
                return function() { return []; };
            }
            return [][prop];
        }
        
        if (prop === 'length') {
            return emailData.length;
        }
        
        if (prop === Symbol.iterator) {
            return emailData[Symbol.iterator].bind(emailData);
        }
        
        if (typeof prop === 'string' && !isNaN(prop)) {
            return emailData[parseInt(prop)];
        }
        
        // Handle array methods
        if (typeof emailData[prop] === 'function') {
            return emailData[prop].bind(emailData);
        }
        
        return emailData[prop];
    },
    
    has(target, prop) {
        if (!emailsLoaded) return false;
        return prop in emailData;
    },
    
    ownKeys(target) {
        if (!emailsLoaded) return [];
        return Object.keys(emailData);
    }
});

// Initialize email loading when module is imported
loadEmailsFromJSON();

// Export the loading function for manual initialization  
export { loadEmailsFromJSON };

// Also export the old name for backward compatibility
export { loadEmailsFromJSON as loadEmailsFromCSV };
