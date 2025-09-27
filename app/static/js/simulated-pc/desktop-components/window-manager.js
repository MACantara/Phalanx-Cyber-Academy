import { WindowSnapManager } from './window-snap-manager.js';
import { WindowResizeManager } from './window-resize-manager.js';
import { appRegistry } from './application-registry.js';
import { initializeApplicationLauncher } from './application-launcher.js';

export class WindowManager {
    constructor(container, taskbar, tutorialManager = null) {
        this.container = container;
        this.taskbar = taskbar;
        this.tutorialManager = tutorialManager;
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

        // Make window draggable and resizable
        this.makeDraggable(windowElement);
        this.resizeManager.makeResizable(windowElement);

        // Initialize application if it exists
        if (app && typeof app.initialize === 'function') {
            app.initialize();
        }

        return windowElement;
    }

    bindWindowEvents(window, id) {
        // Close button
        window.querySelector('.close').addEventListener('click', () => {
            this.closeWindow(id);
        });

        // Minimize button
        window.querySelector('.minimize').addEventListener('click', () => {
            this.minimizeWindow(id);
        });

        // Maximize button
        window.querySelector('.maximize').addEventListener('click', () => {
            this.maximizeWindow(id);
        });

        // Bring to front on click and set as active
        window.addEventListener('mousedown', () => {
            window.style.zIndex = ++this.zIndex;
            this.taskbar.setActiveWindow(id);
        });
    }

    makeDraggable(window) {
        const header = window.querySelector('.window-header');
        let isDragging = false;
        let dragStarted = false;
        let startX, startY, startLeft, startTop;
        let windowApp = null;
        let currentSnapZone = null;

        // Get the window app instance if it exists
        this.applications.forEach((app, id) => {
            if (app.windowElement === window) {
                windowApp = app;
            }
        });

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            
            isDragging = true;
            dragStarted = false;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = window.offsetLeft;
            startTop = window.offsetTop;
            
            header.style.cursor = 'grabbing';
            
            // Bring window to front
            window.style.zIndex = ++this.zIndex;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Check if this is the start of dragging
            if (!dragStarted) {
                // Check if window is maximized first (WindowBase apps)
                if (windowApp && windowApp.getMaximizedState && windowApp.getMaximizedState()) {
                    const result = windowApp.handleDragStartOnMaximized(e.clientX, e.clientY);
                    if (result) {
                        startLeft = result.left;
                        startTop = result.top;
                        startX = e.clientX;
                        startY = e.clientY;
                    }
                }
                // Check if window is snapped
                else if (this.snapManager.isWindowSnapped(window)) {
                    const snapResult = this.snapManager.handleDragStart(window, e.clientX, e.clientY, windowApp);
                    if (snapResult) {
                        startLeft = snapResult.left;
                        startTop = snapResult.top;
                        startX = e.clientX;
                        startY = e.clientY;
                    }
                }
                // Check legacy maximized state
                else if (window.dataset.maximized === 'true') {
                    // Handle legacy maximized windows
                    const originalWidth = window.dataset.originalWidth;
                    const originalHeight = window.dataset.originalHeight;
                    const originalLeft = window.dataset.originalLeft;
                    const originalTop = window.dataset.originalTop;
                    
                    if (originalWidth && originalHeight) {
                        // Restore original size
                        window.style.width = originalWidth;
                        window.style.height = originalHeight;
                        window.style.left = originalLeft;
                        window.style.top = originalTop;
                        window.dataset.maximized = 'false';
                        
                        // Update start position
                        startLeft = parseInt(originalLeft);
                        startTop = parseInt(originalTop);
                        startX = e.clientX;
                        startY = e.clientY;
                    }
                }
                
                dragStarted = true;
                return; // Don't apply normal drag movement on first frame
            }
            
            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;
            
            // Update window position
            window.style.left = `${newLeft}px`;
            window.style.top = `${newTop}px`;
            
            // Show snap preview
            currentSnapZone = this.snapManager.handleDragMove(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                dragStarted = false;
                header.style.cursor = 'grab';
                
                // Handle window snapping
                if (currentSnapZone) {
                    this.snapManager.handleDragEnd(window, e.clientX, e.clientY, windowApp);
                } else {
                    this.snapManager.hideSnapPreview();
                }
                currentSnapZone = null;
                
                // Double-click detection for maximize/restore
                if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
                    if (windowApp && e.detail === 2) {
                        // Check if window is snapped, if so unsnap first
                        if (this.snapManager.isWindowSnapped(window)) {
                            this.snapManager.unSnapWindow(window, windowApp);
                        } else {
                            windowApp.maximize();
                        }
                    }
                }
            }
        });
    }

    closeWindow(id) {
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
    }

    minimizeWindow(id) {
        const window = this.windows.get(id);
        if (window) {
            window.style.display = 'none';
            this.taskbar.setWindowActive(id, false);
            
            // Clear active state if this was the active window
            if (this.taskbar.activeWindowId === id) {
                this.taskbar.activeWindowId = null;
            }
        }
    }

    maximizeWindow(id) {
        const window = this.windows.get(id);
        const app = this.applications.get(id);
        
        if (app && typeof app.maximize === 'function') {
            // Check if window is snapped first
            if (this.snapManager.isWindowSnapped(window)) {
                this.snapManager.unSnapWindow(window, app);
            } else {
                app.maximize();
            }
        } else if (window) {
            // Legacy maximize for non-app windows
            if (this.snapManager.isWindowSnapped(window)) {
                this.snapManager.unSnapWindow(window);
            } else if (window.dataset.maximized === 'true') {
                // Restore
                window.style.width = window.dataset.originalWidth;
                window.style.height = window.dataset.originalHeight;
                window.style.left = window.dataset.originalLeft;
                window.style.top = window.dataset.originalTop;
                window.dataset.maximized = 'false';
            } else {
                // Maximize
                window.dataset.originalWidth = window.style.width;
                window.dataset.originalHeight = window.style.height;
                window.dataset.originalLeft = window.style.left;
                window.dataset.originalTop = window.style.top;
                
                window.style.width = '100%';
                window.style.height = 'calc(100% - 50px)';
                window.style.left = '0';
                window.style.top = '0';
                window.dataset.maximized = 'true';
            }
        }
    }

    toggleWindow(id) {
        const window = this.windows.get(id);
        
        if (window) {
            if (window.style.display === 'none') {
                window.style.display = 'block';
                window.style.zIndex = ++this.zIndex;
                this.taskbar.setActiveWindow(id);
            } else {
                this.minimizeWindow(id);
            }
        }
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

    async openDisclosureReport() {
        return await this.applicationLauncher.openApplication('disclosure-report', 'Disclosure Report');
    }

    // Utility methods for batch operations
    closeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => this.closeWindow(id));
        this.snapManager.cleanup();
        this.resizeManager.cleanup();
    }

    minimizeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => this.minimizeWindow(id));
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
