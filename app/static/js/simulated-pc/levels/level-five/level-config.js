/**
 * Level 5: The Hunt for The Null
 * Configuration and setup for the digital forensics scenario
 */

export const Level5Config = {
    id: 5,
    name: "The Hunt for The Null",
    description: "Follow proper digital forensics procedures to identify a cyber criminal using 3 key pieces of evidence",
    
    // Streamlined core applications (responsive design)
    requiredApps: [
        'evidence-viewer-app',      // Analyze digital evidence with guided steps
        'investigation-hub-app',    // Central dashboard showing objectives and progress
        'forensic-report-app'       // Simple report builder with drag-drop evidence
    ],
    
    // Clear mission objectives
    objectives: [
        {
            id: 'obj_1',
            title: 'Establish Chain of Custody',
            description: 'Verify evidence integrity and document proper forensic handling',
            points: 25,
            required: true
        },
        {
            id: 'obj_2', 
            title: 'Analyze Digital Evidence',
            description: 'Examine 3 pieces of evidence to find identity clues',
            points: 35,
            required: true
        },
        {
            id: 'obj_3',
            title: 'Build Forensic Report',
            description: 'Create compliant report following NIST SP 800-86 standards',
            points: 30,
            required: true
        },
        {
            id: 'obj_4',
            title: 'Identify The Null',
            description: 'Conclusively identify the hacker known as "The Null"',
            points: 30,
            required: true
        }
    ],
    
    // Clear success criteria
    successCriteria: {
        minimumScore: 96,
        requiredEvidence: ['laptop_image', 'memory_dump', 'network_logs'],
        mustIdentifyTarget: true,
        complianceRequired: ['chain_of_custody', 'evidence_integrity', 'proper_documentation']
    },
    
    // Guided workflow following forensic standards
    workflow: {
        phases: [
            {
                name: 'Evidence Acquisition',
                description: 'Secure and verify digital evidence',
                standard: 'ISO/IEC 27037:2012 - Evidence Collection',
                steps: ['verify_hashes', 'document_custody', 'ensure_integrity']
            },
            {
                name: 'Evidence Analysis', 
                description: 'Systematic examination of digital artifacts',
                standard: 'NIST SP 800-86 - Forensic Analysis',
                steps: ['examine_files', 'extract_metadata', 'identify_artifacts']
            },
            {
                name: 'Reporting',
                description: 'Document findings in compliant format',
                standard: 'NIST SP 800-86 - Reporting',
                steps: ['organize_evidence', 'document_findings', 'validate_conclusions']
            }
        ]
    },
    
    // Simplified scoring 
    scoring: {
        maxScore: 120,
        perfectScore: 120,  // Minimum for "perfect" rating
        passingScore: 96,  // Minimum to complete level
        penalties: {
            procedural_violation: -12,
            contaminated_evidence: -24,
            missing_evidence: -18
        },
        bonuses: {
            perfect_procedure: +12,
            efficiency_bonus: +6,
            comprehensive_analysis: +18
        }
    },
    
    // Standards compliance tracking
    standards: {
        'NIST_SP_800_86': {
            name: 'NIST SP 800-86 - Guide to Integrating Forensic Techniques',
            requirements: ['proper_methodology', 'evidence_preservation', 'detailed_documentation']
        },
        'ISO_27037': {
            name: 'ISO/IEC 27037:2012 - Digital Evidence Guidelines', 
            requirements: ['chain_of_custody', 'evidence_integrity', 'competent_handling']
        }
    }
};
