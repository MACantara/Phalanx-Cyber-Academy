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

        // Initialize application if it exists
        if (app && typeof app.initialize === 'function') {
            app.initialize();
        }

        return windowElement;
    }

    bindWindowEvents(window, id) {
        // Bring to front on click and set as active
        window.addEventListener('mousedown', () => {
            window.style.zIndex = ++this.zIndex;
            this.taskbar.setActiveWindow(id);
        });
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
