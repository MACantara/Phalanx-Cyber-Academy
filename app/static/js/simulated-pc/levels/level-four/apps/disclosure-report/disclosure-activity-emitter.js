import { ActivityEmitterBase } from '../../../desktop-components/activity-emitter-base.js';

export class DisclosureActivityEmitter extends ActivityEmitterBase {
    constructor(appId, appTitle) {
        super(appId, appTitle);
    }

    // Initialize custom activity patterns
    initializeCustomEvents() {
        // Disclosure Report specific events
        this.customEvents = {
            // Flag submission activities
            'flag_submitted': {
                category: 'security_assessment',
                description: 'Security flag successfully submitted',
                riskLevel: 'info'
            },
            
            'flag_submission_failed': {
                category: 'security_assessment',
                description: 'Invalid flag submission attempt',
                riskLevel: 'low'
            },
            
            // Assessment progress
            'disclosure_app_opened': {
                category: 'security_assessment',
                description: 'Responsible disclosure report application opened',
                riskLevel: 'info'
            },
            
            'disclosure_app_closed': {
                category: 'security_assessment',
                description: 'Disclosure report application closed',
                riskLevel: 'info'
            },
            
            'assessment_completed': {
                category: 'security_assessment',
                description: 'Security assessment completed successfully',
                riskLevel: 'info'
            },
            
            // Data validation
            'flag_validation_attempt': {
                category: 'security_assessment',
                description: 'Flag validation process initiated',
                riskLevel: 'low'
            },
            
            'vulnerability_documented': {
                category: 'security_assessment',
                description: 'Security vulnerability documented',
                riskLevel: 'medium'
            }
        };
    }

    // Specialized methods for disclosure activities
    emitFlagSubmission(flagNumber, flagValue, isCorrect, discoveryMethod) {
        const eventType = isCorrect ? 'flag_submitted' : 'flag_submission_failed';
        
        this.emitActivity(eventType, {
            flag_number: flagNumber,
            flag_value: flagValue,
            is_correct: isCorrect
        }, {
            discovery_method: discoveryMethod,
            submission_timestamp: new Date().toISOString()
        });
    }

    emitAssessmentProgress(flagsDiscovered, totalFlags) {
        this.emitActivity('assessment_progress', {
            flags_discovered: flagsDiscovered,
            total_flags: totalFlags,
            completion_percentage: Math.round((flagsDiscovered / totalFlags) * 100)
        });
    }

    emitVulnerabilityDocumentation(vulnerabilityType, severity, description) {
        this.emitActivity('vulnerability_documented', {
            vulnerability_type: vulnerabilityType,
            severity: severity,
            description: description
        }, {
            documentation_timestamp: new Date().toISOString()
        });
    }

    emitAssessmentCompletion(completionData) {
        this.emitActivity('assessment_completed', {
            all_flags_discovered: true,
            completion_time: new Date().toISOString(),
            assessment_duration: completionData.duration || 'unknown'
        }, completionData);
    }
}