/**
 * Level 5 Data Index
 * Centralized loading of all forensic datasets for digital investigation
 */

// Import all Level 5 JSON datasets using import assertions
import caseBriefingData from './case-briefing.json' with { type: 'json' };
import diskAnalysisData from './disk-analysis-data.json' with { type: 'json' };
import evidenceData from './evidence-data.json' with { type: 'json' };
import investigationObjectivesData from './investigation-objectives.json' with { type: 'json' };
import memoryForensicsData from './memory-forensics-data.json' with { type: 'json' };
import networkAnalysisData from './network-analysis-data.json' with { type: 'json' };
import reportTemplatesData from './report-templates-data.json' with { type: 'json' };
import timelineData from './timeline-data.json' with { type: 'json' };

// Export individual datasets
export { caseBriefingData };
export { diskAnalysisData };
export { evidenceData };
export { investigationObjectivesData };
export { memoryForensicsData };
export { networkAnalysisData };
export { reportTemplatesData };
export { timelineData };

// Combined Level 5 data object for bulk operations
export const level5Data = {
    case_briefing: caseBriefingData,
    disk_analysis: diskAnalysisData,
    evidence: evidenceData,
    investigation_objectives: investigationObjectivesData,
    memory_forensics: memoryForensicsData,
    network_analysis: networkAnalysisData,
    report_templates: reportTemplatesData,
    timeline: timelineData
};

// Data validation and status checking
export function validateDataIntegrity() {
    const datasets = {
        case_briefing: caseBriefingData,
        disk_analysis: diskAnalysisData,
        evidence: evidenceData,
        investigation_objectives: investigationObjectivesData,
        memory_forensics: memoryForensicsData,
        network_analysis: networkAnalysisData,
        report_templates: reportTemplatesData,
        timeline: timelineData
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

// Get specific dataset by name
export function getDataset(name) {
    const datasets = {
        'case_briefing': caseBriefingData,
        'disk_analysis': diskAnalysisData,
        'evidence': evidenceData,
        'investigation_objectives': investigationObjectivesData,
        'memory_forensics': memoryForensicsData,
        'network_analysis': networkAnalysisData,
        'report_templates': reportTemplatesData,
        'timeline': timelineData
    };
    
    return datasets[name] || null;
}

// Default export for backward compatibility
export default level5Data;
