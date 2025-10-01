/**
 * Level 5 Data Index
 * Centralized loading of all forensic datasets for digital investigation
 */

// Import streamlined Level 5 JSON datasets for core apps
import evidenceViewerData from './evidence-viewer-data.json' with { type: 'json' };
import investigationHubData from './investigation-hub-data.json' with { type: 'json' };
import forensicReportData from './forensic-report-data.json' with { type: 'json' };

// Export individual datasets for core apps
export { evidenceViewerData };
export { investigationHubData };
export { forensicReportData };

// Combined Level 5 data object for bulk operations (streamlined)
export const level5Data = {
    evidence_viewer: evidenceViewerData,
    investigation_hub: investigationHubData,
    forensic_report: forensicReportData
};

// Data validation and status checking for streamlined datasets
export function validateDataIntegrity() {
    const datasets = {
        evidence_viewer: evidenceViewerData,
        investigation_hub: investigationHubData,
        forensic_report: forensicReportData
    };

    const status = {};
    
    for (const [key, data] of Object.entries(datasets)) {
        status[key] = {
            loaded: data !== null && typeof data === 'object',
            hasContent: data && Object.keys(data).length > 0,
            size: data ? Object.keys(data).length : 0
        };
    }

    return {
        allLoaded: Object.values(status).every(s => s.loaded),
        allValid: Object.values(status).every(s => s.hasContent),
        status
    };
}

// Get specific dataset by name (streamlined)
export function getDataset(name) {
    const datasets = {
        'evidence_viewer': evidenceViewerData,
        'investigation_hub': investigationHubData,
        'forensic_report': forensicReportData
    };
    
    return datasets[name] || null;
}

// Default export for backward compatibility
export default level5Data;
