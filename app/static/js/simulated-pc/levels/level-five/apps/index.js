/**
 * Level 5 Custom Applications
 * Digital forensics specific apps and utilities
 */

// Import all forensic applications
import { EvidenceLockerApp } from './evidence-locker-app.js';
import { DiskAnalyzerApp } from './disk-analyzer-app.js';
import { MemoryForensicsApp } from './memory-forensics-app.js';
import { NetworkAnalyzerApp } from './network-analyzer-app.js';
import { TimelineConstructorApp } from './timeline-constructor-app.js';
import { ReportGeneratorApp } from './report-generator-app.js';

// Import forensic base class
import { ForensicAppBase } from './forensic-app-base.js';

export const Level5Apps = {
    // Forensic Applications
    EvidenceLockerApp,
    DiskAnalyzerApp,
    MemoryForensicsApp,
    NetworkAnalyzerApp,
    TimelineConstructorApp,
    ReportGeneratorApp,
    
    // Base class for extending forensic applications
    ForensicAppBase,
    
    // Application registry for dynamic loading
    getForensicApps() {
        return {
            'evidence-locker': EvidenceLockerApp,
            'disk-analyzer': DiskAnalyzerApp,
            'memory-forensics': MemoryForensicsApp,
            'network-analyzer': NetworkAnalyzerApp,
            'timeline-constructor': TimelineConstructorApp,
            'report-generator': ReportGeneratorApp
        };
    },
    
    // Get application by ID
    getApp(appId) {
        const apps = this.getForensicApps();
        return apps[appId] || null;
    },
    
    // Get all application IDs
    getAppIds() {
        return Object.keys(this.getForensicApps());
    }
};

export default Level5Apps;
