import { SuspiciousSitePage } from './suspicious-site.js';
import { CyberQuestPage } from './cyberquest.js';
import { ExampleBankPage } from './secure-bank.js';
import { PhishingBankPage } from './bank.js';
import { NewsSitePage } from './news-site.js';

// Import Level 1 Challenge Pages
import { Challenge1Page } from '../tools/challenge1/challenge1-page.js';

export class PageRegistry {
    constructor() {
        this.pages = new Map();
        this.initializePages();
    }

    initializePages() {
        // Register all pages
        this.registerPage(SuspiciousSitePage);
        this.registerPage(CyberQuestPage);
        this.registerPage(ExampleBankPage);
        this.registerPage(PhishingBankPage);
        this.registerPage(NewsSitePage);
        
        // Register Level 1 Challenge Pages
        this.registerPage(Challenge1Page);
    }

    registerPage(pageConfig) {
        this.pages.set(pageConfig.url, pageConfig);
    }

    getPage(url) {
        return this.pages.get(url);
    }

    getPageSecurity(url) {
        const page = this.getPage(url);
        return page ? page.security : null;
    }

    getAllPages() {
        return Array.from(this.pages.values());
    }

    createNotFoundPage(url) {
        return {
            url: url,
            title: 'Page Not Found',
            securityLevel: 'neutral',
            security: {
                isHttps: url.startsWith('https://'),
                hasValidCertificate: false,
                certificate: null,
                threats: null,
                riskFactors: ['Unknown website', 'Unverified content']
            },
            createContent: () => `
                <div class="p-6 text-center text-gray-800 bg-gray-100 min-h-full overflow-y-auto">
                    <div class="max-w-md mx-auto">
                        <i class="bi bi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
                        <h1 class="text-2xl font-bold mb-4">Page Not Found</h1>
                        <p class="text-gray-600 mb-4">The page at <code class="bg-gray-200 px-2 py-1 rounded">${url}</code> could not be found.</p>
                        <p class="text-sm text-gray-500">This might be because the website doesn't exist in our simulation or the URL was mistyped.</p>
                        
                        <div class="mt-6">
                            <button onclick="window.browserApp?.navigation.navigateToUrl('https://example.com')" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                Go to Phalanx Cyber Academy Home
                            </button>
                        </div>
                    </div>
                </div>
            `
        };
    }
}
