import { WindowBase } from '../window-base.js';
import { BrowserNavigation } from './browser-functions/navigation.js';
import { PageRenderer } from './browser-functions/page-renderer.js';
import { SecurityChecker } from './browser-functions/security-checker.js';
import { NavigationUtil } from '../shared-utils/navigation-util.js';

export class BrowserApp extends WindowBase {
    constructor() {
        super('browser', 'Web Browser', {
            width: '80%',
            height: '70%'
        });
        
        // Initialize browser components
        this.navigation = null;
        this.pageRenderer = null;
        this.securityChecker = null;
    }

    createContent() {
        return `
            <div class="h-full flex flex-col">
                <div class="flex-1 overflow-auto bg-white" id="browser-content">
                    <div class="flex items-center justify-center h-full text-gray-500">
                        <div class="text-center">
                            <i class="bi bi-hourglass-split text-4xl mb-4 animate-spin"></i>
                            <p>Loading page...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        // Make browser app globally accessible for functions
        window.browserApp = this;
        
        // Initialize browser functionality
        this.navigation = new BrowserNavigation(this);
        this.pageRenderer = new PageRenderer(this);
        this.securityChecker = new SecurityChecker(this);
        
        // Initialize components
        this.navigation.initialize();
        
        // Bind additional events
        this.bindBrowserEvents();
        
        // Show initial loading screen instead of loading suspicious site
        this.showInitialLoadingScreen();

        // Setup dynamic security monitoring
        this.setupSecurityMonitoring();
    }

    showInitialLoadingScreen() {
        const contentElement = this.windowElement?.querySelector('#browser-content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="h-full bg-white flex items-center justify-center">
                    <div class="text-center">
                        <div class="text-6xl mb-4">🌐</div>
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Welcome to CyberQuest Browser</h2>
                        <p class="text-gray-600 mb-4">Enter a URL in the address bar to start browsing</p>
                        <div class="text-sm text-gray-500">
                            <p>🔒 Security monitoring is active</p>
                            <p>📊 Training mode enabled</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Clear the URL bar
        const urlBar = this.windowElement?.querySelector('#browser-url-bar');
        if (urlBar) {
            urlBar.value = '';
            urlBar.placeholder = 'Enter URL or search term...';
        }
    }

    loadInitialPage() {
        // This method is now replaced by showInitialLoadingScreen
        // Keep it for compatibility but make it show the loading screen
        this.showInitialLoadingScreen();
    }

    setupSecurityMonitoring() {
        // Monitor URL changes and update security status
        const urlBar = this.windowElement?.querySelector('#browser-url-bar');
        if (urlBar) {
            urlBar.addEventListener('input', () => {
                // Debounce security checks
                clearTimeout(this.securityCheckTimeout);
                this.securityCheckTimeout = setTimeout(() => {
                    if (urlBar.value) {
                        this.updateSecurityStatus(urlBar.value);
                    }
                }, 500);
            });

            // Also check on focus/blur events
            urlBar.addEventListener('blur', () => {
                if (urlBar.value) {
                    this.updateSecurityStatus(urlBar.value);
                }
            });
        }
    }

    updateSecurityStatus(url) {
        if (this.securityChecker) {
            const securityCheck = this.securityChecker.runSecurityScan(url);
            
            // Update any open security popup
            if (this.securityChecker.securityPopup && this.securityChecker.securityPopup.isVisible) {
                this.securityChecker.securityPopup.refreshContent(securityCheck);
            }
            
            return securityCheck;
        }
    }

    toggleBookmarksBar() {
        const bookmarksBar = this.windowElement?.querySelector('#bookmarks-bar');
        const toggleBtn = this.windowElement?.querySelector('[data-action="toggle-bookmarks"]');
        
        if (bookmarksBar && toggleBtn) {
            const isHidden = bookmarksBar.style.display === 'none';
            
            if (isHidden) {
                bookmarksBar.style.display = 'flex';
                toggleBtn.classList.add('bg-green-600');
                toggleBtn.classList.remove('bg-gray-600');
            } else {
                bookmarksBar.style.display = 'none';
                toggleBtn.classList.remove('bg-green-600');
                toggleBtn.classList.add('bg-gray-600');
            }
        }
    }

    bindBrowserEvents() {
        const windowElement = this.windowElement;
        if (!windowElement) return;

        // Home button
        const homeBtn = windowElement.querySelector('[data-action="home"]');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                const url = 'https://cyberquest.com';
                this.navigation.navigateToUrl(url);
                // Emit navigation event
                document.dispatchEvent(new CustomEvent('browser-navigate', {
                    detail: { url: url }
                }));
            });
        }

        // Toggle bookmarks button
        const bookmarksBtn = windowElement.querySelector('[data-action="toggle-bookmarks"]');
        if (bookmarksBtn) {
            bookmarksBtn.addEventListener('click', () => {
                this.toggleBookmarksBar();
            });
        }

        // Bookmark item clicks
        const bookmarkItems = windowElement.querySelectorAll('.bookmark-item[data-url]');
        bookmarkItems.forEach(item => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                if (url) {
                    this.navigation.navigateToUrl(url);
                    // Emit navigation event
                    document.dispatchEvent(new CustomEvent('browser-navigate', {
                        detail: { url: url }
                    }));
                    // Update security status after navigation
                    setTimeout(() => this.updateSecurityStatus(url), 200);
                }
            });
        });

        // URL bar focus styling and security updates
        const urlBar = windowElement.querySelector('#browser-url-bar');
        if (urlBar) {
            urlBar.addEventListener('focus', () => {
                urlBar.select();
            });
            
            // Handle Enter key in URL bar
            urlBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const url = urlBar.value.trim();
                    if (url) {
                        // Add protocol if missing
                        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                        this.navigation.navigateToUrl(fullUrl);
                        // Emit navigation event
                        document.dispatchEvent(new CustomEvent('browser-navigate', {
                            detail: { url: fullUrl }
                        }));
                        setTimeout(() => this.updateSecurityStatus(fullUrl), 200);
                    }
                }
            });
        }

        // Use shared navigation utility for data-url handling
        NavigationUtil.bindDataUrlHandlers(windowElement, { source: 'browser' });
    }

    cleanup() {
        // Clear any pending security check timeouts
        if (this.securityCheckTimeout) {
            clearTimeout(this.securityCheckTimeout);
        }
        
        // Clean up global reference
        if (window.browserApp === this) {
            window.browserApp = null;
        }
        
        // Clean up only browser-specific modals and popups
        const browserModals = document.querySelectorAll('.security-popup');
        browserModals.forEach(modal => {
            if (modal.parentNode) {
                modal.remove();
            }
        });
        
        // Clean up browser-specific overlays
        const scamModals = document.querySelectorAll('.fixed.inset-0');
        scamModals.forEach(modal => {
            if (modal.innerHTML && (
                modal.innerHTML.includes('SCAM DETECTED') ||
                modal.innerHTML.includes('SECURITY WARNING')
            )) {
                modal.remove();
            }
        });
        
        // Clean up security popup specifically
        if (this.securityChecker && this.securityChecker.securityPopup) {
            this.securityChecker.securityPopup.hide();
        }
        
        super.cleanup();
    }
}