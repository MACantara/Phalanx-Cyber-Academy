export class ApplicationRegistry {
    constructor() {
        this.registry = {
            'browser': {
                module: './desktop-applications/browser-app.js',
                className: 'BrowserApp',
                storageKey: 'cyberquest_browser_opened',
                tutorialMethod: 'shouldAutoStartBrowser',
                startMethod: 'startBrowserTutorial',
                iconClass: 'bi-globe',
                title: 'Web Browser'
            },
            'terminal': {
                module: '../levels/level-four/apps/terminal-app.js',
                className: 'TerminalApp',
                storageKey: 'cyberquest_terminal_opened',
                tutorialMethod: 'shouldAutoStartTerminal',
                startMethod: 'startTerminalTutorial',
                iconClass: 'bi-terminal',
                title: 'Terminal'
            },
            'files': {
                module: './desktop-applications/file-manager-app.js',
                className: 'FileManagerApp',
                storageKey: 'cyberquest_filemanager_opened',
                tutorialMethod: 'shouldAutoStartFileManager',
                startMethod: 'startFileManagerTutorial',
                iconClass: 'bi-folder',
                title: 'File Manager'
            },
            'email': {
                module: './desktop-applications/email-app.js',
                className: 'EmailApp',
                storageKey: 'cyberquest_email_opened',
                tutorialMethod: 'shouldAutoStartEmail',
                startMethod: 'startEmailTutorial',
                iconClass: 'bi-envelope',
                title: 'Email Client'
            },
            'wireshark': {
                module: './desktop-applications/network-monitor-app.js',
                className: 'NetworkMonitorApp',
                storageKey: 'cyberquest_networkmonitor_opened',
                tutorialMethod: 'shouldAutoStartNetworkMonitor',
                startMethod: 'startNetworkMonitorTutorial',
                iconClass: 'bi-router',
                title: 'Network Monitor'
            },
            'logs': {
                module: './desktop-applications/system-logs-app.js',
                className: 'SystemLogsApp',
                storageKey: 'cyberquest_systemlogs_opened',
                tutorialMethod: 'shouldAutoStartSystemLogs',
                startMethod: 'startSystemLogsTutorial',
                iconClass: 'bi-journal-text',
                title: 'System Logs'
            },
            'process-monitor': {
                module: '../levels/level-three/apps/index.js',
                className: 'Level3ProcessMonitorApp',
                storageKey: 'cyberquest_processmonitor_opened',
                tutorialMethod: null,
                startMethod: null,
                iconClass: 'bi-cpu',
                title: 'Process Monitor',
                levelSpecific: 3,
                autoOpen: false
            },
            'malware-scanner': {
                module: '../levels/level-three/apps/index.js',
                className: 'Level3MalwareScannerApp',
                storageKey: 'cyberquest_malwarescanner_opened',
                tutorialMethod: null,
                startMethod: null,
                iconClass: 'bi-shield-exclamation',
                title: 'Malware Scanner',
                levelSpecific: 3,
                autoOpen: false
            },
            'ransomware-decryptor': {
                module: '../levels/level-three/apps/index.js',
                className: 'Level3RansomwareDecryptorApp',
                storageKey: 'cyberquest_ransomwaredecryptor_opened',
                tutorialMethod: null,
                startMethod: null,
                iconClass: 'bi-unlock',
                title: 'Ransomware Decryptor',
                levelSpecific: 3,
                autoOpen: false
            },
            'level3-timer': {
                module: '../levels/level-three/apps/index.js',
                className: 'Level3TimerApp',
                storageKey: null, // Don't track opened status for timer
                tutorialMethod: null,
                startMethod: null,
                iconClass: 'bi-stopwatch',
                title: 'Mission Status',
                levelSpecific: 3, // Only available in level 3
                autoOpen: true, // Auto-open when available
                persistent: true // Cannot be closed by user
            }
        };
        this.loadedModules = new Map(); // Cache for loaded modules
    }

    // Dynamically load application class
    async loadAppClass(appId) {
        const appConfig = this.registry[appId];
        if (!appConfig) {
            throw new Error(`Application ${appId} not found`);
        }

        // Check if already loaded
        if (this.loadedModules.has(appId)) {
            return this.loadedModules.get(appId);
        }

        try {
            const module = await import(appConfig.module);
            const AppClass = module[appConfig.className];
            this.loadedModules.set(appId, AppClass);
            
            // Also update the registry to include the class for backwards compatibility
            appConfig.class = AppClass;
            
            return AppClass;
        } catch (error) {
            console.error(`Failed to load application ${appId}:`, error);
            throw error;
        }
    }

    // Get application configuration by ID
    getApp(appId) {
        return this.registry[appId] || null;
    }

    // Check if application exists
    hasApp(appId) {
        return this.registry.hasOwnProperty(appId);
    }

    // Get all registered application IDs
    getAllAppIds() {
        return Object.keys(this.registry);
    }

    // Get all registered applications
    getAllApps() {
        return { ...this.registry };
    }

    // Register a new application
    registerApp(appId, config) {
        if (!config.class) {
            throw new Error('Application configuration must include a class property');
        }
        
        const defaultConfig = {
            storageKey: `cyberquest_${appId}_opened`,
            tutorialMethod: null,
            startMethod: null,
            iconClass: 'bi-window',
            title: appId.charAt(0).toUpperCase() + appId.slice(1)
        };

        this.registry[appId] = { ...defaultConfig, ...config };
    }

    // Unregister an application
    unregisterApp(appId) {
        if (this.registry[appId]) {
            delete this.registry[appId];
            return true;
        }
        return false;
    }

    // Update existing application configuration
    updateApp(appId, config) {
        if (this.registry[appId]) {
            this.registry[appId] = { ...this.registry[appId], ...config };
            return true;
        }
        return false;
    }

    // Get icon class for application (with fallback)
    getIconClass(appId) {
        const app = this.registry[appId];
        return app ? app.iconClass : 'bi-window';
    }

    // Get title for application (with fallback)
    getTitle(appId) {
        const app = this.registry[appId];
        return app ? app.title : appId.charAt(0).toUpperCase() + appId.slice(1);
    }

    // Get applications that have tutorial integration
    getTutorialApps() {
        return Object.entries(this.registry)
            .filter(([id, config]) => config.tutorialMethod && config.startMethod)
            .reduce((acc, [id, config]) => {
                acc[id] = config;
                return acc;
            }, {});
    }

    // Get applications by category (if categorization is needed in the future)
    getAppsByCategory(category) {
        return Object.entries(this.registry)
            .filter(([id, config]) => config.category === category)
            .reduce((acc, [id, config]) => {
                acc[id] = config;
                return acc;
            }, {});
    }

    // Validate application configuration
    validateAppConfig(config) {
        const required = ['class'];
        const optional = ['storageKey', 'tutorialMethod', 'startMethod', 'iconClass', 'title', 'category'];
        
        for (const prop of required) {
            if (!config.hasOwnProperty(prop)) {
                throw new Error(`Required property '${prop}' missing from application configuration`);
            }
        }

        const allProps = [...required, ...optional];
        for (const prop in config) {
            if (!allProps.includes(prop)) {
                console.warn(`Unknown property '${prop}' in application configuration`);
            }
        }

        return true;
    }

    // Create application instance
    async createAppInstance(appId) {
        const config = this.registry[appId];
        if (!config) {
            throw new Error(`Application '${appId}' not found in registry`);
        }

        try {
            // Load the class if not already loaded
            const AppClass = await this.loadAppClass(appId);
            return new AppClass();
        } catch (error) {
            throw new Error(`Failed to create instance of application '${appId}': ${error.message}`);
        }
    }

    // Check if app should show tutorial on first open
    shouldShowTutorial(appId) {
        const config = this.registry[appId];
        if (!config || !config.storageKey) {
            return false;
        }

        return !localStorage.getItem(config.storageKey);
    }

    // Mark app as opened
    markAsOpened(appId) {
        const config = this.registry[appId];
        if (config && config.storageKey) {
            localStorage.setItem(config.storageKey, 'true');
        }
    }

    // Reset app opened status (for testing/debugging)
    resetOpenedStatus(appId) {
        const config = this.registry[appId];
        if (config && config.storageKey) {
            localStorage.removeItem(config.storageKey);
        }
    }

    // Reset all app opened statuses
    resetAllOpenedStatuses() {
        Object.values(this.registry).forEach(config => {
            if (config.storageKey) {
                localStorage.removeItem(config.storageKey);
            }
        });
    }

    // Get application statistics
    getStats() {
        const total = Object.keys(this.registry).length;
        const withTutorials = Object.values(this.registry)
            .filter(config => config.tutorialMethod && config.startMethod).length;
        const opened = Object.values(this.registry)
            .filter(config => config.storageKey && localStorage.getItem(config.storageKey)).length;

        return {
            total,
            withTutorials,
            opened,
            unopened: total - opened
        };
    }
}

// Export singleton instance
export const appRegistry = new ApplicationRegistry();

// Export class for testing/custom instances
export default ApplicationRegistry;
