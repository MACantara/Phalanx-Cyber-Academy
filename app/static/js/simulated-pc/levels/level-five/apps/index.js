/**
 * Level 5 Custom Applications
 * Digital forensics specific apps and utilities
 */

// Import streamlined forensic applications (responsive design)
import { EvidenceViewerApp } from './evidence-viewer-app.js';
import { InvestigationHubApp } from './investigation-hub-app.js'; 
import { ForensicReportApp } from './forensic-report-app.js';

// Import forensic base class with responsive design
import { ForensicAppBase } from './forensic-app-base.js';

export const Level5Apps = {
    // Core Forensic Applications (3 streamlined apps)
    EvidenceViewerApp,      // Guided evidence analysis
    InvestigationHubApp,    // Central progress dashboard  
    ForensicReportApp,      // Simple report builder
    
    // Base class for extending forensic applications
    ForensicAppBase,
    
    // Application registry for dynamic loading
    getForensicApps() {
        return {
            'evidence-viewer': EvidenceViewerApp,
            'investigation-hub': InvestigationHubApp,
            'forensic-report': ForensicReportApp
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
