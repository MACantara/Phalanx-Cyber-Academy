import { appRegistry } from './application-registry.js';

export class ApplicationLauncher {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.appRegistry = appRegistry;
        this.tutorialManager = windowManager.tutorialManager;
        this.currentLevel = null; // Will be set by desktop
    }

    // Set current level (called by desktop)
    setLevel(level) {
        this.currentLevel = level;
        console.log('[ApplicationLauncher] Level set to:', level);
        
        // Auto-open level-specific applications
        this.autoOpenLevelApps();
    }

    // Auto-open applications specific to current level
    async autoOpenLevelApps() {
        if (!this.currentLevel) return;

        const levelApps = Object.entries(this.appRegistry.getAllApps())
            .filter(([id, config]) => 
                config.levelSpecific === this.currentLevel || 
                config.levelSpecific === this.currentLevel.toString()
            )
            .filter(([id, config]) => config.autoOpen)
            .filter(([id, config]) => id !== 'level3-timer'); // Don't auto-open timer, wait for dialogue

        console.log(`[ApplicationLauncher] Auto-opening ${levelApps.length} apps for level ${this.currentLevel}`);

        for (const [appId, config] of levelApps) {
            try {
                await this.launchLevelSpecificApp(appId);
            } catch (error) {
                console.error(`[ApplicationLauncher] Failed to auto-open ${appId}:`, error);
            }
        }
    }

    // Core application opening functionality moved from window manager
    async openApplication(appId, windowTitle) {
        const appConfig = this.appRegistry.getApp(appId);
        if (!appConfig) {
            throw new Error(`Application '${appId}' not found in registry`);
        }

        // Check level restrictions
        if (appConfig.levelSpecific && 
            this.currentLevel !== appConfig.levelSpecific && 
            this.currentLevel !== appConfig.levelSpecific.toString()) {
            console.warn(`[ApplicationLauncher] App ${appId} is level-specific (${appConfig.levelSpecific}) but current level is ${this.currentLevel}`);
            return null;
        }

        const isFirstTime = appConfig.storageKey ? !localStorage.getItem(appConfig.storageKey) : false;
        const app = await this.appRegistry.createAppInstance(appId);
        
        const windowOptions = {};
        
        // Handle level-specific window positioning and properties
        if (appConfig.levelSpecific) {
            if (appId === 'level3-timer') {
                // Level 3 timer is a static element, not a window
                // Get the desktop container (desktop element or document body as fallback)
                const desktopContainer = this.windowManager.container || 
                                       this.windowManager.desktopElement || 
                                       document.body;
                
                app.appendTo(desktopContainer);
                app.initialize();
                
                // Store reference for later access
                this.level3TimerInstance = app;
                
                return app;
            }
        }

        const window = this.windowManager.createWindow(appId, windowTitle || appConfig.title, app, windowOptions);
        
        // Apply level-specific window modifications
        if (window && appConfig.persistent) {
            const closeBtn = window.querySelector('.close');
            const minimizeBtn = window.querySelector('.minimize');
            const maximizeBtn = window.querySelector('.maximize');
            if (closeBtn) closeBtn.style.display = 'none';
            if (minimizeBtn) minimizeBtn.style.display = 'none';
            
            // Hide maximize button and resize handles for non-resizable windows
            if (windowOptions.resizable === false) {
                if (maximizeBtn) maximizeBtn.style.display = 'none';
                const resizeHandles = window.querySelectorAll('.resize-handle');
                resizeHandles.forEach(handle => handle.style.display = 'none');
            }
        }

        // Position window if specified
        if (window && windowOptions.position) {
            window.style.left = windowOptions.position.left;
            window.style.top = windowOptions.position.top;
            if (windowOptions.zIndex) {
                window.style.zIndex = windowOptions.zIndex;
            }
        }

        if (appConfig.storageKey) {
            this.appRegistry.markAsOpened(appId);
        }

        // Handle tutorial auto-start if it's the first time and tutorial manager is available
        if (isFirstTime && this.tutorialManager && appConfig.tutorialMethod && appConfig.startMethod) {
            await this.handleTutorialAutoStart(appConfig.tutorialMethod, appConfig.startMethod);
        }

        return app;
    }

    // Shared tutorial auto-start logic moved from window manager
    async handleTutorialAutoStart(tutorialCheckMethod, tutorialStartMethod) {
        try {
            // Check if the tutorial manager has the required methods
            if (typeof this.tutorialManager[tutorialCheckMethod] !== 'function') {
                console.warn(`Tutorial method ${tutorialCheckMethod} not found on tutorial manager`);
                return;
            }

            if (typeof this.tutorialManager[tutorialStartMethod] !== 'function') {
                console.warn(`Tutorial method ${tutorialStartMethod} not found on tutorial manager`);
                return;
            }

            const shouldStart = await this.tutorialManager[tutorialCheckMethod]();
            if (shouldStart) {
                setTimeout(async () => {
                    await this.tutorialManager[tutorialStartMethod]();
                }, 1500);
            }
        } catch (error) {
            console.warn(`Tutorial auto-start failed: ${error.message}`);
        }
    }

    // Generic application launcher
    async launchApplication(appId, windowTitle = null) {
        try {
            await this.openApplication(appId, windowTitle);
            return true;
        } catch (error) {
            console.error(`Failed to launch application '${appId}':`, error);
            return false;
        }
    }

    // Specific application launchers
    async launchBrowser() {
        return await this.launchApplication('browser');
    }

    async launchEmail() {
        return await this.launchApplication('email');
    }

    async launchTerminal() {
        return await this.launchApplication('terminal');
    }

    async launchFileManager() {
        return await this.launchApplication('files');
    }

    async launchNetworkMonitor() {
        return await this.launchApplication('wireshark');
    }

    async launchSystemLogs() {
        return await this.launchApplication('logs');
    }

    async launchProcessMonitor() {
        return await this.launchApplication('process-monitor');
    }

    async launchMalwareScanner() {
        return await this.launchApplication('malware-scanner');
    }

    async launchRansomwareDecryptor() {
        return await this.launchApplication('ransomware-decryptor');
    }


    // Level-specific application launcher
    async launchLevelSpecificApp(appId) {
        const appConfig = this.appRegistry.getApp(appId);
        if (!appConfig) {
            throw new Error(`Application '${appId}' not found`);
        }

        // Verify level restriction
        if (appConfig.levelSpecific && 
            this.currentLevel !== appConfig.levelSpecific && 
            this.currentLevel !== appConfig.levelSpecific.toString()) {
            console.warn(`[ApplicationLauncher] Skipping ${appId} - not available for level ${this.currentLevel}`);
            return false;
        }

        const app = await this.launchApplication(appId);
        console.log(`[ApplicationLauncher] Level-specific app ${appId} launched for level ${this.currentLevel}`);
        return app;
    }

    // Launch Level 3 timer specifically
    async launchLevel3Timer() {
        if (this.currentLevel === 3 || this.currentLevel === '3') {
            return await this.launchLevelSpecificApp('level3-timer');
        }
        console.warn('[ApplicationLauncher] Level 3 timer requested but not in level 3');
        return false;
    }

    // Level-specific app launching with logging
    async launchForLevel(levelId, appId, appName = null) {
        const success = await this.launchApplication(appId, appName);
        if (success) {
            console.log(`${appName || appId} opened for Level ${levelId}`);
        } else {
            console.error(`Failed to open ${appName || appId} for Level ${levelId}`);
        }
        return success;
    }

    // Batch application launching
    async launchMultiple(appIds) {
        const results = [];
        for (const appId of appIds) {
            try {
                const success = await this.launchApplication(appId);
                results.push({ appId, success });
            } catch (error) {
                results.push({ appId, success: false, error: error.message });
            }
        }
        return results;
    }

    // Check if application is already open
    isApplicationOpen(appId) {
        return this.windowManager.windows.has(appId);
    }

    // Get open applications
    getOpenApplications() {
        return this.windowManager.getOpenApplications();
    }

    // Close application
    closeApplication(appId) {
        return this.windowManager.closeWindow(appId);
    }

    // Get application info
    getApplicationInfo(appId) {
        return this.appRegistry.getApp(appId);
    }

    // Check if application exists
    applicationExists(appId) {
        return this.appRegistry.hasApp(appId);
    }

    // Get level-specific applications
    getLevelApps(level = null) {
        const targetLevel = level || this.currentLevel;
        return Object.entries(this.appRegistry.getAllApps())
            .filter(([id, config]) => 
                config.levelSpecific === targetLevel || 
                config.levelSpecific === targetLevel?.toString()
            )
            .reduce((acc, [id, config]) => {
                acc[id] = config;
                return acc;
            }, {});
    }

    // Get Level 3 timer instance
    getLevel3Timer() {
        // For Level 3 timer, we store it as a property since it's not a window
        return this.level3TimerInstance || null;
    }

    // Level 3 timer control methods (delegated from desktop)
    addReputationDamage(amount) {
        const timer = this.getLevel3Timer();
        if (timer && (this.currentLevel === 3 || this.currentLevel === '3')) {
            timer.addReputationDamage(amount);
            return true;
        }
        console.warn('[ApplicationLauncher] addReputationDamage called but Level 3 timer not available');
        return false;
    }

    addFinancialDamage(amount) {
        const timer = this.getLevel3Timer();
        if (timer && (this.currentLevel === 3 || this.currentLevel === '3')) {
            timer.addFinancialDamage(amount);
            return true;
        }
        console.warn('[ApplicationLauncher] addFinancialDamage called but Level 3 timer not available');
        return false;
    }

    getTimerStatus() {
        const timer = this.getLevel3Timer();
        if (timer && (this.currentLevel === 3 || this.currentLevel === '3')) {
            return timer.getStatus();
        }
        return null;
    }
}

// Create singleton instance (will be initialized by window manager)
let applicationLauncher = null;

export function initializeApplicationLauncher(windowManager) {
    applicationLauncher = new ApplicationLauncher(windowManager);
    return applicationLauncher;
}

export function getApplicationLauncher() {
    if (!applicationLauncher) {
        throw new Error('Application launcher not initialized. Call initializeApplicationLauncher first.');
    }
    return applicationLauncher;
}

// Export for convenience
export default ApplicationLauncher;
