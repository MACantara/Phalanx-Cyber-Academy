import { PageRegistry } from '../../../levels/level-one/pages/page-registry.js';

export class PageRenderer {
    constructor(browserApp) {
        this.browserApp = browserApp;
        this.pageRegistry = new PageRegistry();
    }

    async renderPage(url) {
        const pageConfig = this.pageRegistry.getPage(url) || this.pageRegistry.createNotFoundPage(url);
        const contentElement = this.browserApp.windowElement?.querySelector('#browser-content');
        
        if (contentElement) {
            this.showLoadingState(contentElement);
            
            try {
                let htmlContent;
                
                // For challenge1 page, use the page's createContent method
                if (url === 'https://daily-politico-news.com/breaking-news') {
                    htmlContent = await pageConfig.createContent();
                } else {
                    htmlContent = pageConfig.createContent();
                }
                
                contentElement.innerHTML = htmlContent;
                
                this.updatePageTitle(pageConfig.title);
                this.bindPageEvents(url);
                
            } catch (error) {
                console.error('Error rendering page:', error);
                contentElement.innerHTML = this.createErrorContent(error.message);
            }
        }
    }

    showLoadingState(contentElement) {
        contentElement.innerHTML = `
            <div class="min-h-screen bg-white flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">Loading page...</h2>
                    <p class="text-gray-600 mb-4">Please wait while we fetch the content</p>
                    <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createErrorContent(errorMessage) {
        return `
            <div class="min-h-screen bg-white flex items-center justify-center">
                <div class="text-center max-w-md mx-auto p-6">
                    <div class="text-red-500 mb-4">
                        <i class="bi bi-exclamation-triangle text-6xl"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">Error Loading Page</h2>
                    <p class="text-gray-600 mb-4">${errorMessage}</p>
                    <button onclick="window.location.reload()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    updatePageTitle(title) {
        const windowTitle = this.browserApp.windowElement?.querySelector('.window-title span');
        if (windowTitle) {
            windowTitle.textContent = `Web Browser - ${title}`;
        }
    }
    
    bindPageEvents(url) {
        const contentElement = this.browserApp.windowElement?.querySelector('#browser-content');
        if (!contentElement) return;

        // Get the page configuration for event binding
        const pageConfig = this.pageRegistry.getPage(url);
        
        // Bind page-specific events if the page has a bindEvents method
        if (pageConfig && typeof pageConfig.bindEvents === 'function') {
            pageConfig.bindEvents(contentElement);
        }

        // Handle scam button clicks
        const scamButton = contentElement.querySelector('#scam-button');
        if (scamButton) {
            scamButton.addEventListener('click', () => {
                this.showScamWarning();
            });
        }

        // Handle form submissions
        const forms = contentElement.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form, url);
            });
        });

        // Handle link clicks
        const links = contentElement.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    this.browserApp.navigation.navigateToUrl(href);
                }
            });
        });
    }

    showScamWarning() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <div class="text-center">
                    <i class="bi bi-shield-x text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-xl font-bold text-red-600 mb-4">🚨 SCAM DETECTED! 🚨</h2>
                    <p class="text-gray-700 mb-4">
                        Good job! You've identified a scam website. In real life, clicking this button would 
                        likely lead to identity theft or financial fraud.
                    </p>
                    <div class="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p class="text-sm text-red-700">
                            <strong>Red flags you should notice:</strong><br>
                            • Too good to be true offers<br>
                            • Urgent/pressure language<br>
                            • Suspicious domain name<br>
                            • Poor grammar/spelling
                        </p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors">
                        Continue Training
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    handleFormSubmission(form, url) {
        // Show warning for sensitive forms
        if (url.includes('suspicious') || form.querySelector('input[type="password"]')) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                    <div class="text-center">
                        <i class="bi bi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
                        <h2 class="text-xl font-bold text-yellow-600 mb-4">⚠️ SECURITY WARNING</h2>
                        <p class="text-gray-700 mb-4">
                            You're about to submit sensitive information. In a real scenario, 
                            make sure you trust the website and verify the URL before proceeding.
                        </p>
                        <div class="space-x-3">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                Continue (Training)
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }
}