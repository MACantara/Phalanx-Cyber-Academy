// Level 1 Browser Pages Index
// Browser page registry and configurations for The Misinformation Maze

export { PageRegistry } from './page-registry.js';
export { SuspiciousSitePage } from './suspicious-site.js';
export { CyberQuestPage } from './cyberquest.js';
export { ExampleBankPage } from './secure-bank.js';
export { PhishingBankPage } from './bank.js';
export { NewsSitePage } from './news-site.js';

// Base page class for creating new pages
export { BasePage } from './base-page.js';

// Page categories for Level 1
export const LEVEL_1_PAGES = {
    EDUCATIONAL: {
        cyberquest: 'Phalanx Cyber Academy Academy homepage',
        news_site: 'Legitimate news site for comparison'
    },
    TRAINING_TARGETS: {
        suspicious_site: 'Suspicious website for scam detection',
        phishing_bank: 'Fake banking site for phishing training',
        secure_bank: 'Legitimate banking site for comparison'
    },
    REGISTRY: {
        page_registry: 'Central registry for all browser pages'
    }
};

console.log('Level 1 Browser Pages loaded: Registry and all training pages');
