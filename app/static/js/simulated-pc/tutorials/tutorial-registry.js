export class TutorialRegistry {
    constructor() {
        this.tutorials = new Map();
        this.initializeTutorials();
    }

    // Initialize all tutorial configurations
    initializeTutorials() {
        this.registerTutorial('initial', {
            className: 'InitialTutorial',
            globalVarName: 'initialTutorial',
            title: 'Desktop Introduction',
            description: 'Learn the basics of navigating the desktop environment',
            category: 'Getting Started',
            estimatedTime: '5 minutes',
            storageKey: 'cyberquest_tutorial_completed',
            tutorialMethod: 'shouldAutoStartInitial',
            startMethod: 'startInitialTutorial',
            restartMethod: 'restartInitialTutorial'
        });

        this.registerTutorial('email', {
            className: 'EmailTutorial',
            globalVarName: 'emailTutorial',
            title: 'Email Security',
            description: 'Identify phishing attempts and practice safe email protocols',
            category: 'Email Security',
            estimatedTime: '8 minutes',
            storageKey: 'cyberquest_email_tutorial_completed',
            tutorialMethod: 'shouldAutoStartEmail',
            startMethod: 'startEmailTutorial',
            restartMethod: 'restartEmailTutorial'
        });

        this.registerTutorial('browser', {
            className: 'BrowserTutorial',
            globalVarName: 'browserTutorial',
            title: 'Web Security',
            description: 'Recognize suspicious websites and avoid online scams',
            category: 'Web Security',
            estimatedTime: '10 minutes',
            storageKey: 'cyberquest_browser_tutorial_completed',
            tutorialMethod: 'shouldAutoStartBrowser',
            startMethod: 'startBrowserTutorial',
            restartMethod: 'restartBrowserTutorial'
        });

        this.registerTutorial('file-manager', {
            className: 'FileManagerTutorial',
            globalVarName: 'fileManagerTutorial',
            title: 'File Security',
            description: 'Identify suspicious files and practice safe file handling',
            category: 'File Security',
            estimatedTime: '7 minutes',
            storageKey: 'cyberquest_filemanager_tutorial_completed',
            tutorialMethod: 'shouldAutoStartFileManager',
            startMethod: 'startFileManagerTutorial',
            restartMethod: 'restartFileManagerTutorial'
        });

        this.registerTutorial('process-monitor', {
            className: 'ProcessMonitorTutorial',
            globalVarName: 'processMonitorTutorial',
            title: 'Process Management',
            description: 'Monitor system processes and identify suspicious activity',
            category: 'System Monitoring',
            estimatedTime: '12 minutes',
            storageKey: 'cyberquest_processmonitor_tutorial_completed',
            tutorialMethod: 'shouldAutoStartProcessMonitor',
            startMethod: 'startProcessMonitorTutorial',
            restartMethod: 'restartProcessMonitorTutorial'
        });

        this.registerTutorial('network-monitor', {
            className: 'NetworkMonitorTutorial',
            globalVarName: 'networkMonitorTutorial',
            title: 'Network Analysis',
            description: 'Analyze network traffic and detect security threats',
            category: 'Network Security',
            estimatedTime: '15 minutes',
            storageKey: 'cyberquest_networkmonitor_tutorial_completed',
            tutorialMethod: 'shouldAutoStartNetworkMonitor',
            startMethod: 'startNetworkMonitorTutorial',
            restartMethod: 'restartNetworkMonitorTutorial'
        });

        this.registerTutorial('system-logs', {
            className: 'SystemLogsTutorial',
            globalVarName: 'systemLogsTutorial',
            title: 'Log Analysis',
            description: 'Analyze system logs to identify security incidents',
            category: 'Log Analysis',
            estimatedTime: '10 minutes',
            storageKey: 'cyberquest_systemlogs_tutorial_completed',
            tutorialMethod: 'shouldAutoStartSystemLogs',
            startMethod: 'startSystemLogsTutorial',
            restartMethod: 'restartSystemLogsTutorial'
        });

        this.registerTutorial('terminal', {
            className: 'TerminalTutorial',
            globalVarName: 'terminalTutorial',
            title: 'Command Line',
            description: 'Learn essential command line tools for cybersecurity',
            category: 'Command Line',
            estimatedTime: '12 minutes',
            storageKey: 'cyberquest_terminal_tutorial_completed',
            tutorialMethod: 'shouldAutoStartTerminal',
            startMethod: 'startTerminalTutorial',
            restartMethod: 'restartTerminalTutorial'
        });

        this.registerTutorial('malware-scanner', {
            className: 'MalwareScannerTutorial',
            globalVarName: 'malwareScannerTutorial',
            title: 'Malware Scanning',
            description: 'Learn to detect, analyze, and remove malware threats from systems',
            category: 'Security Tools',
            estimatedTime: '10 minutes',
            storageKey: 'cyberquest_malwarescanner_tutorial_completed',
            tutorialMethod: 'shouldAutoStartMalwareScanner',
            startMethod: 'startMalwareScannerTutorial',
            restartMethod: 'restartMalwareScannerTutorial'
        });

        this.registerTutorial('level5-forensics', {
            className: 'Level5ForensicsTutorial',
            globalVarName: 'level5ForensicsTutorial',
            title: 'Level 5: The Hunt for The Null',
            description: 'Master digital forensics to identify and catch the elusive hacker known as The Null',
            category: 'Investigation',
            estimatedTime: '20 minutes',
            storageKey: 'cyberquest_level5_forensics_tutorial_completed',
            tutorialMethod: 'shouldAutoStartLevel5Forensics',
            startMethod: 'startLevel5ForensicsTutorial',
            restartMethod: 'restartLevel5ForensicsTutorial'
        });
    }

    // Register a new tutorial
    registerTutorial(name, config) {
        const requiredFields = ['className', 'globalVarName', 'title'];
        const defaultConfig = {
            description: 'No description available',
            category: 'General',
            estimatedTime: 'Unknown',
            storageKey: `cyberquest_${name}_tutorial_completed`,
            tutorialMethod: null,
            startMethod: null,
            restartMethod: null
        };

        // Validate required fields
        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`Tutorial registration missing required field: ${field}`);
            }
        }

        // Merge with defaults
        const tutorialConfig = { ...defaultConfig, ...config, name };
        this.tutorials.set(name, tutorialConfig);
    }

    // Get tutorial configuration by name
    getTutorial(name) {
        return this.tutorials.get(name) || null;
    }

    // Check if tutorial exists
    hasTutorial(name) {
        return this.tutorials.has(name);
    }

    // Get all tutorial names
    getAllTutorialNames() {
        return Array.from(this.tutorials.keys());
    }

    // Get all tutorials
    getAllTutorials() {
        return Array.from(this.tutorials.values());
    }

    // Get tutorials by category
    getTutorialsByCategory(category) {
        return Array.from(this.tutorials.values())
            .filter(tutorial => tutorial.category === category);
    }

    // Get all unique categories
    getCategories() {
        const categories = new Set();
        this.tutorials.forEach(tutorial => categories.add(tutorial.category));
        return Array.from(categories);
    }

    // Update tutorial configuration
    updateTutorial(name, updates) {
        const existing = this.tutorials.get(name);
        if (existing) {
            this.tutorials.set(name, { ...existing, ...updates });
            return true;
        }
        return false;
    }

    // Remove tutorial
    removeTutorial(name) {
        return this.tutorials.delete(name);
    }

    // Check if tutorial is completed
    isTutorialCompleted(name) {
        const tutorial = this.getTutorial(name);
        if (!tutorial || !tutorial.storageKey) return false;
        return localStorage.getItem(tutorial.storageKey) === 'true';
    }

    // Mark tutorial as completed
    markTutorialCompleted(name) {
        const tutorial = this.getTutorial(name);
        if (tutorial && tutorial.storageKey) {
            localStorage.setItem(tutorial.storageKey, 'true');
        }
    }

    // Reset tutorial completion status
    resetTutorial(name) {
        const tutorial = this.getTutorial(name);
        if (tutorial && tutorial.storageKey) {
            localStorage.removeItem(tutorial.storageKey);
        }
    }

    // Reset all tutorial completion statuses
    resetAllTutorials() {
        this.tutorials.forEach(tutorial => {
            if (tutorial.storageKey) {
                localStorage.removeItem(tutorial.storageKey);
            }
        });
    }

    // Get tutorial completion statistics
    getCompletionStats() {
        const total = this.tutorials.size;
        const completed = Array.from(this.tutorials.values())
            .filter(tutorial => this.isTutorialCompleted(tutorial.name)).length;
        
        return {
            total,
            completed,
            remaining: total - completed,
            completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    // Get tutorials by completion status
    getCompletedTutorials() {
        return Array.from(this.tutorials.values())
            .filter(tutorial => this.isTutorialCompleted(tutorial.name));
    }

    getRemainingTutorials() {
        return Array.from(this.tutorials.values())
            .filter(tutorial => !this.isTutorialCompleted(tutorial.name));
    }

    // Generate method name from tutorial name
    generateMethodName(tutorialName, prefix) {
        return prefix + tutorialName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('') + 'Tutorial';
    }

    // Validate tutorial configuration
    validateTutorialConfig(config) {
        const required = ['className', 'globalVarName', 'title'];
        const optional = ['description', 'category', 'estimatedTime', 'storageKey', 'tutorialMethod', 'startMethod', 'restartMethod'];
        
        for (const prop of required) {
            if (!config.hasOwnProperty(prop)) {
                throw new Error(`Required property '${prop}' missing from tutorial configuration`);
            }
        }

        const allProps = [...required, ...optional];
        for (const prop in config) {
            if (!allProps.includes(prop)) {
                console.warn(`Unknown property '${prop}' in tutorial configuration`);
            }
        }

        return true;
    }

    // Export tutorial registry data
    exportRegistry() {
        return {
            tutorials: Object.fromEntries(this.tutorials),
            stats: this.getCompletionStats(),
            categories: this.getCategories()
        };
    }

    // Import tutorial registry data
    importRegistry(data) {
        if (data.tutorials) {
            this.tutorials.clear();
            Object.entries(data.tutorials).forEach(([name, config]) => {
                this.tutorials.set(name, config);
            });
        }
    }
}

// Export singleton instance
export const tutorialRegistry = new TutorialRegistry();

// Export class for custom instances
export default TutorialRegistry;
