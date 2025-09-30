import { WindowSnapManager } from './window-snap-manager.js';
import { WindowResizeManager } from './window-resize-manager.js';
import { appRegistry } from './application-registry.js';
import { initializeApplicationLauncher } from './application-launcher.js';

export class WindowManager {
    constructor(container, taskbar) {
        this.container = container;
        this.taskbar = taskbar;
        this.windows = new Map();
        this.applications = new Map();
        this.zIndex = 1000;
        
        // Ensure CSS is loaded before creating managers
        this.ensureWindowStylesLoaded();
        this.snapManager = new WindowSnapManager(container);
        this.resizeManager = new WindowResizeManager(this);
        
        // Use application registry
        this.appRegistry = appRegistry;
        
        // Initialize application launcher
        this.applicationLauncher = initializeApplicationLauncher(this);
        
        // Make launcher globally accessible
        window.applicationLauncher = this.applicationLauncher;
        
        // Set up keyboard shortcuts for window switching
        this.setupKeyboardShortcuts();
    }

    // Ensure window styles are loaded
    ensureWindowStylesLoaded() {
        if (document.getElementById('window-scrollbar-styles')) return;

        const link = document.createElement('link');
        link.id = 'window-scrollbar-styles';
        link.rel = 'stylesheet';
        link.href = '/static/css/simulated-pc/windows.css';
        document.head.appendChild(link);
    }

    createWindow(id, title, contentOrApp, options = {}) {
        if (this.windows.has(id)) {
            // Bring existing window to front
            const existingWindow = this.windows.get(id);
            existingWindow.style.zIndex = ++this.zIndex;
            this.taskbar.setActiveWindow(id);
            return existingWindow;
        }

        let windowElement;
        let app = null;

        // Check if contentOrApp is a WindowBase application
        if (contentOrApp && typeof contentOrApp.createWindow === 'function') {
            app = contentOrApp;
            windowElement = app.createWindow();
            this.applications.set(id, app);
        } else {
            // For non-app content, throw error since legacy support is removed
            throw new Error(`Legacy window creation is no longer supported. Use application registry instead.`);
        }

        windowElement.style.zIndex = ++this.zIndex;
        this.container.appendChild(windowElement);
        this.windows.set(id, windowElement);

        // Add to taskbar
        const iconClass = app.getIconClass();
        this.taskbar.addWindow(id, title, iconClass);

        // Bind window events
        this.bindWindowEvents(windowElement, id);

        // Hide all other windows and show this new one
        this.switchToWindow(id);

        // Initialize application if it exists
        if (app && typeof app.initialize === 'function') {
            app.initialize();
        }

        return windowElement;
    }

    bindWindowEvents(window, id) {
        // Bring to front on click/touch and set as active
        const activateWindow = () => {
            window.style.zIndex = ++this.zIndex;
            this.taskbar.setActiveWindow(id);
        };
        
        window.addEventListener('mousedown', activateWindow);
        window.addEventListener('touchstart', activateWindow, { passive: true });
    }

    // Switch to a specific window (bring it to front)
    switchToWindow(id) {
        const window = this.windows.get(id);
        
        if (window) {
            // Hide all other windows
            this.windows.forEach((otherWindow, otherId) => {
                if (otherId !== id) {
                    otherWindow.style.display = 'none';
                }
            });
            
            // Show and bring the selected window to front
            window.style.display = 'block';
            window.style.zIndex = ++this.zIndex;
            this.taskbar.setActiveWindow(id);
        }
    }

    // Toggle window (for taskbar clicks) - now switches to the window
    toggleWindow(id) {
        this.switchToWindow(id);
    }

    // Set up keyboard shortcuts for window switching
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + Tab to cycle through windows (desktop only)
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
            
            // Alt + Number keys (1-9) to switch to specific window (desktop only)
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const windowIndex = parseInt(e.key) - 1;
                const windowIds = Array.from(this.windows.keys());
                if (windowIds[windowIndex]) {
                    this.switchToWindow(windowIds[windowIndex]);
                }
            }
        });
        
        // Add swipe gesture support for mobile window switching
        this.setupTouchGestures();
    }

    // Mobile-friendly touch gestures
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Detect horizontal swipe gestures for window switching
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next window
                    this.cycleWindows();
                } else {
                    // Swipe right - previous window (reverse cycle)
                    this.cycleWindowsReverse();
                }
            }
        }, { passive: true });
    }
    
    // Reverse cycle through windows
    cycleWindowsReverse() {
        const windowIds = Array.from(this.windows.keys());
        if (windowIds.length <= 1) return;
        
        const currentActiveId = this.taskbar.activeWindowId;
        let nextIndex = windowIds.length - 1;
        
        if (currentActiveId) {
            const currentIndex = windowIds.indexOf(currentActiveId);
            nextIndex = currentIndex > 0 ? currentIndex - 1 : windowIds.length - 1;
        }
        
        this.switchToWindow(windowIds[nextIndex]);
    }

    // Cycle through open windows
    cycleWindows() {
        const windowIds = Array.from(this.windows.keys());
        if (windowIds.length <= 1) return;
        
        const currentActiveId = this.taskbar.activeWindowId;
        let nextIndex = 0;
        
        if (currentActiveId) {
            const currentIndex = windowIds.indexOf(currentActiveId);
            nextIndex = (currentIndex + 1) % windowIds.length;
        }
        
        this.switchToWindow(windowIds[nextIndex]);
    }

    // Simplified application launchers that delegate to application launcher
    async openBrowser() {
        return await this.applicationLauncher.openApplication('browser', 'Web Browser');
    }

    async openTerminal() {
        return await this.applicationLauncher.openApplication('terminal', 'Terminal');
    }

    async openFileManager() {
        return await this.applicationLauncher.openApplication('files', 'File Manager');
    }

    async openEmailClient() {
        return await this.applicationLauncher.openApplication('email', 'Email Client');
    }

    async openNetworkMonitor() {
        return await this.applicationLauncher.openApplication('wireshark', 'Network Monitor');
    }

    async openSystemLogs() {
        return await this.applicationLauncher.openApplication('logs', 'System Logs');
    }

    async openProcessMonitor() {
        return await this.applicationLauncher.openApplication('process-monitor', 'Process Monitor');
    }

    async openMalwareScanner() {
        return await this.applicationLauncher.launchMalwareScanner();
    }

    async openRansomwareDecryptor() {
        return await this.applicationLauncher.launchRansomwareDecryptor();
    }

    // Utility methods for batch operations
    closeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => {
            const window = this.windows.get(id);
            const app = this.applications.get(id);
            
            if (window) {
                // Call cleanup if application exists
                if (app && typeof app.cleanup === 'function') {
                    app.cleanup();
                }
                
                window.remove();
                this.windows.delete(id);
                this.applications.delete(id);
                this.taskbar.removeWindow(id);
            }
        });
        this.snapManager.cleanup();
        this.resizeManager.cleanup();
    }

    minimizeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => {
            const window = this.windows.get(id);
            if (window) {
                window.style.display = 'none';
                this.taskbar.setWindowActive(id, false);
                
                // Clear active state if this was the active window
                if (this.taskbar.activeWindowId === id) {
                    this.taskbar.activeWindowId = null;
                }
            }
        });
    }

    // Show all windows (for debugging or overview)
    showAllWindows() {
        this.windows.forEach((window, id) => {
            window.style.display = 'block';
        });
    }

    getOpenWindows() {
        return Array.from(this.windows.keys());
    }

    getOpenApplications() {
        return Array.from(this.applications.keys());
    }

    // Window state management
    saveWindowStates() {
        const states = {};
        this.applications.forEach((app, id) => {
            if (typeof app.getState === 'function') {
                states[id] = app.getState();
            }
        });
        return states;
    }

    restoreWindowStates(states) {
        Object.entries(states).forEach(([id, state]) => {
            const app = this.applications.get(id);
            if (app && typeof app.setState === 'function') {
                app.setState(state);
            }
        });
    }

    // Application registry helpers
    isApplicationRegistered(appId) {
        return this.appRegistry.hasApp(appId);
    }

    getRegisteredApplications() {
        return this.appRegistry.getAllAppIds();
    }

    addApplicationToRegistry(appId, config) {
        this.appRegistry.registerApp(appId, config);
    }

    removeApplicationFromRegistry(appId) {
        return this.appRegistry.unregisterApp(appId);
    }

    // Get application registry instance (for advanced usage)
    getApplicationRegistry() {
        return this.appRegistry;
    }
}
