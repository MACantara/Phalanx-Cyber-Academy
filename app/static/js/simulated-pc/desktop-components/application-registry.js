export class ApplicationRegistry {
    constructor() {
        this.registry = {
            'browser': {
                module: './desktop-applications/browser-app.js',
                className: 'BrowserApp',
                storageKey: 'cyberquest_browser_opened',
                iconClass: 'bi-globe',
                title: 'Web Browser',
                levelSpecific: 1,
                autoOpen: false
            },
            'terminal': {
                module: '../levels/level-four/apps/terminal-app.js',
                className: 'TerminalApp',
                storageKey: 'cyberquest_terminal_opened',
                iconClass: 'bi-terminal',
                title: 'Terminal',
                levelSpecific: 4,
                autoOpen: false
            },
            'email': {
                module: './desktop-applications/email-app.js',
                className: 'EmailApp',
                storageKey: 'cyberquest_email_opened',
                iconClass: 'bi-envelope',
                title: 'Email Client',
                levelSpecific: 2,
                autoOpen: false
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
            },
            // Level 5 - Digital Forensics Applications
            'evidence-locker': {
                module: '../levels/level-five/apps/evidence-locker-app.js',
                className: 'EvidenceLockerApp',
                storageKey: 'cyberquest_evidencelocker_opened',
                iconClass: 'bi-archive',
                title: 'Evidence Locker',
                levelSpecific: 5,
                autoOpen: false,
                persistent: true
            },
            'disk-analyzer': {
                module: '../levels/level-five/apps/disk-analyzer-app.js',
                className: 'DiskAnalyzerApp',
                storageKey: 'cyberquest_diskanalyzer_opened',
                iconClass: 'bi-hdd-stack',
                title: 'Disk Image Analyzer',
                levelSpecific: 5,
                autoOpen: false
            },
            'memory-forensics': {
                module: '../levels/level-five/apps/memory-forensics-app.js',
                className: 'MemoryForensicsApp',
                storageKey: 'cyberquest_memoryforensics_opened',
                iconClass: 'bi-memory',
                title: 'Memory Analysis',
                levelSpecific: 5,
                autoOpen: false
            },
            'network-analyzer': {
                module: '../levels/level-five/apps/network-analyzer-app.js',
                className: 'NetworkAnalyzerApp',
                storageKey: 'cyberquest_networkanalyzer_opened',
                iconClass: 'bi-diagram-3',
                title: 'Network Forensics',
                levelSpecific: 5,
                autoOpen: false
            },
            'timeline-constructor': {
                module: '../levels/level-five/apps/timeline-constructor-app.js',
                className: 'TimelineConstructorApp',
                storageKey: 'cyberquest_timeline_opened',
                iconClass: 'bi-clock-history',
                title: 'Timeline Analysis',
                levelSpecific: 5,
                autoOpen: false
            },
            'report-generator': {
                module: '../levels/level-five/apps/report-generator-app.js',
                className: 'ReportGeneratorApp',
                storageKey: 'cyberquest_reportgenerator_opened',
                iconClass: 'bi-file-earmark-text',
                title: 'Investigation Report',
                levelSpecific: 5,
                autoOpen: false
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
        const optional = ['storageKey', 'iconClass', 'title', 'category'];
        
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
        const opened = Object.values(this.registry)
            .filter(config => config.storageKey && localStorage.getItem(config.storageKey)).length;

        return {
            total,
            opened,
            unopened: total - opened
        };
    }
}

// Export singleton instance
export const appRegistry = new ApplicationRegistry();

// Export class for testing/custom instances
export default ApplicationRegistry;
