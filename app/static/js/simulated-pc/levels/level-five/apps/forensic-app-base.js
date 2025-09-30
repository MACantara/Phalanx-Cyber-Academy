import { WindowBase } from '../../../desktop-components/window-base.js';

/**
 * Base class for all Level 5 digital forensics applications
 * Provides common forensic functionality and shared evidence context
 */
export class ForensicAppBase extends WindowBase {
    constructor(id, title, options = {}) {
        super(id, title, {
            width: '70%',
            height: '60%',
            ...options
        });
        
        this.evidenceStore = null; // Shared evidence data
        this.analysisResults = new Map();
        this.chainOfCustody = [];
        this.forensicPhase = 1; // Current investigation phase (1-4)
        
        // Initialize shared evidence context
        this.initializeEvidenceContext();
    }

    // Initialize shared evidence context across all forensic apps
    initializeEvidenceContext() {
        // Get or create global Level 5 evidence context
        if (!window.Level5EvidenceContext) {
            window.Level5EvidenceContext = new Level5EvidenceContext();
        }
        this.evidenceStore = window.Level5EvidenceContext;
    }

    // Verify evidence integrity using hash validation
    async verifyEvidenceIntegrity(evidenceId) {
        const evidence = this.evidenceStore.getEvidence(evidenceId);
        if (!evidence) {
            return { valid: false, reason: 'Evidence not found' };
        }

        try {
            // Calculate current hash using SHA256 API
            const currentHash = await this.calculateHash(evidence.data);
            const originalHash = evidence.hash_sha256;
            
            const isValid = currentHash === originalHash;
            
            return {
                valid: isValid,
                originalHash,
                currentHash,
                reason: isValid ? 'Hash verification passed' : 'Hash mismatch detected'
            };
        } catch (error) {
            console.error('[ForensicApp] Evidence integrity verification failed:', error);
            
            // Return failure if hash calculation fails
            return {
                valid: false,
                originalHash: evidence.hash_sha256,
                currentHash: 'calculation_failed',
                reason: 'Hash calculation failed - cannot verify integrity'
            };
        }
    }

    // Update chain of custody for evidence
    updateChainOfCustody(evidenceId, action, user = 'Investigator') {
        const timestamp = new Date().toISOString();
        const custodyEntry = {
            timestamp,
            action,
            user,
            evidenceId,
            location: 'Digital Evidence Locker'
        };

        this.chainOfCustody.push(custodyEntry);
        
        // Update in shared context
        this.evidenceStore.updateChainOfCustody(evidenceId, custodyEntry);

        console.log(`[${this.id}] Chain of custody updated:`, custodyEntry);
    }

    // Export findings in standardized format
    exportFindings() {
        const findings = {
            application: this.id,
            timestamp: new Date().toISOString(),
            analysisResults: Array.from(this.analysisResults.entries()),
            chainOfCustody: this.chainOfCustody,
            forensicPhase: this.forensicPhase,
            procedureCompliance: this.checkProcedureCompliance()
        };

        // Share findings with other applications
        this.evidenceStore.shareAnalysisResult(this.id, findings);
        
        return findings;
    }

    // Validate forensic procedure compliance
    validateProcedure(step) {
        const requiredSteps = [
            'evidence_acquisition',
            'hash_verification',
            'documentation',
            'analysis',
            'chain_of_custody'
        ];

        const compliance = {
            step,
            compliant: requiredSteps.includes(step),
            timestamp: new Date().toISOString(),
            nistCompliance: this.checkNISTCompliance(step),
            isoCompliance: this.checkISOCompliance(step)
        };

        return compliance;
    }

    // Check NIST SP 800-86 compliance
    checkNISTCompliance(step) {
        const nistRequirements = {
            'evidence_acquisition': 'Proper evidence collection methods',
            'hash_verification': 'Data integrity verification',
            'documentation': 'Comprehensive documentation',
            'analysis': 'Systematic examination',
            'chain_of_custody': 'Evidence handling procedures'
        };

        return {
            requirement: nistRequirements[step] || 'Unknown requirement',
            compliant: !!nistRequirements[step]
        };
    }

    // Check ISO/IEC 27037:2012 compliance
    checkISOCompliance(step) {
        const isoRequirements = {
            'evidence_acquisition': 'Digital evidence identification and collection',
            'hash_verification': 'Digital evidence preservation',
            'documentation': 'Documentation requirements',
            'analysis': 'Digital evidence analysis',
            'chain_of_custody': 'Chain of custody maintenance'
        };

        return {
            requirement: isoRequirements[step] || 'Unknown requirement',
            compliant: !!isoRequirements[step]
        };
    }

    // Check overall procedure compliance
    checkProcedureCompliance() {
        const requiredActions = [
            'evidence_collected',
            'hash_verified',
            'documented',
            'analyzed'
        ];

        const completedActions = this.chainOfCustody.map(entry => entry.action);
        const compliance = requiredActions.every(action => 
            completedActions.some(completed => completed.includes(action))
        );

        return {
            status: compliance ? 'compliant' : 'warning',
            completedActions,
            requiredActions,
            complianceRate: (completedActions.length / requiredActions.length) * 100
        };
    }

    // Generate cryptographic hash using SHA256
    async calculateHash(data) {
        try {
            // Use API endpoint for proper SHA256 hash generation
            const response = await fetch('/api/level5/generate-hash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Hash generation failed: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data.sha256;
            } else {
                throw new Error('Hash generation API returned error');
            }
            
        } catch (error) {
            console.error('[ForensicApp] Hash calculation failed:', error);
        }
    }

    // Create standardized forensic UI elements
    createForensicUI() {
        return {
            evidencePanel: this.createEvidencePanel(),
            complianceIndicator: this.createComplianceIndicator(),
            chainOfCustodyTracker: this.createChainOfCustodyTracker(),
            phaseIndicator: this.createPhaseIndicator()
        };
    }

    createEvidencePanel() {
        return `
            <div class="forensic-evidence-panel bg-gray-700 p-4 rounded mb-4">
                <h3 class="text-lg font-semibold mb-2 text-green-400">Evidence Status</h3>
                <div id="evidence-status-${this.id}" class="grid grid-cols-2 gap-4">
                    <div class="text-sm">
                        <span class="text-gray-300">Integrity:</span>
                        <span class="text-green-400 ml-2" id="integrity-status-${this.id}">Verified</span>
                    </div>
                    <div class="text-sm">
                        <span class="text-gray-300">Chain of Custody:</span>
                        <span class="text-green-400 ml-2" id="custody-status-${this.id}">Maintained</span>
                    </div>
                </div>
            </div>
        `;
    }

    createComplianceIndicator() {
        return `
            <div class="forensic-compliance bg-gray-700 p-3 rounded mb-4">
                <h4 class="text-md font-semibold mb-2 text-yellow-400">Compliance Status</h4>
                <div class="flex space-x-4 text-sm">
                    <div class="flex items-center">
                        <i class="bi bi-shield-check text-green-400 mr-1"></i>
                        <span>NIST SP 800-86</span>
                    </div>
                    <div class="flex items-center">
                        <i class="bi bi-shield-check text-green-400 mr-1"></i>
                        <span>ISO/IEC 27037:2012</span>
                    </div>
                </div>
            </div>
        `;
    }

    createChainOfCustodyTracker() {
        return `
            <div class="forensic-custody bg-gray-700 p-3 rounded mb-4">
                <h4 class="text-md font-semibold mb-2 text-blue-400">Chain of Custody</h4>
                <div id="custody-log-${this.id}" class="text-sm text-gray-300 max-h-32 overflow-y-auto">
                    <div class="flex justify-between border-b border-gray-600 py-1">
                        <span>Evidence acquired</span>
                        <span class="text-green-400">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createPhaseIndicator() {
        return `
            <div class="forensic-phase bg-gray-700 p-3 rounded mb-4">
                <h4 class="text-md font-semibold mb-2 text-purple-400">Investigation Phase</h4>
                <div class="flex space-x-2">
                    <div class="phase-indicator ${this.forensicPhase >= 1 ? 'bg-green-600' : 'bg-gray-600'} w-4 h-4 rounded"></div>
                    <div class="phase-indicator ${this.forensicPhase >= 2 ? 'bg-green-600' : 'bg-gray-600'} w-4 h-4 rounded"></div>
                    <div class="phase-indicator ${this.forensicPhase >= 3 ? 'bg-green-600' : 'bg-gray-600'} w-4 h-4 rounded"></div>
                    <div class="phase-indicator ${this.forensicPhase >= 4 ? 'bg-green-600' : 'bg-gray-600'} w-4 h-4 rounded"></div>
                </div>
                <div class="text-sm text-gray-300 mt-2">Phase ${this.forensicPhase}: ${this.getPhaseDescription()}</div>
            </div>
        `;
    }

    getPhaseDescription() {
        const phases = {
            1: 'Digital Breadcrumbs',
            2: 'Network Traces', 
            3: 'Deep Analysis',
            4: 'Identity Convergence'
        };
        return phases[this.forensicPhase] || 'Unknown Phase';
    }

    // Initialize forensic application
    initialize() {
        super.initialize();

        // Update chain of custody
        this.updateChainOfCustody('app_session', 'application_started');
    }

    // Cleanup forensic application
    cleanup() {
        // Update chain of custody
        this.updateChainOfCustody('app_session', 'application_closed');
        
        // Export findings before cleanup
        this.exportFindings();

        super.cleanup();
    }
}

/**
 * Shared evidence context for Level 5 applications
 * Manages evidence data, analysis results, timeline, and correlations
 */
class Level5EvidenceContext {
    constructor() {
        this.evidenceItems = new Map();
        this.analysisResults = new Map();
        this.timeline = [];
        this.correlations = [];
        this.chainOfCustodyLog = [];
        this.events = [];
        this.dataLoaded = false;
        
        // Initialize with sample evidence for demonstration
        this.initializeSampleEvidence().then(() => {
            this.dataLoaded = true;
            this.notifyDataLoaded();
        });
    }

    // Notify applications that data has been loaded
    notifyDataLoaded() {
        window.dispatchEvent(new CustomEvent('forensic-data-loaded'));
    }

    // Initialize sample evidence for the investigation
    async initializeSampleEvidence() {
        try {
            // Load evidence data from centralized API
            const response = await fetch('/api/level5/evidence-data');
            const result = await response.json();
            
            if (result.success && result.data && result.data.evidence) {
                result.data.evidence.forEach(evidence => {
                    this.evidenceItems.set(evidence.id, evidence);
                });
                console.log(`[EvidenceContext] Loaded ${result.data.evidence.length} evidence items from centralized API`);
            } else {
                throw new Error('Failed to load evidence data from API');
            }
        } catch (error) {
            console.error('[EvidenceContext] Failed to load evidence data, using fallback:', error);
            // Fallback to embedded data if external file fails
            this.initializeFallbackEvidence();
        }
    }

    // Fallback evidence data if external file loading fails
    initializeFallbackEvidence() {
        const fallbackEvidence = [
            {
                id: 'evidence_001',
                type: 'disk_image',
                source: 'suspects_laptop',
                name: 'Laptop Hard Drive Image',
                hash_md5: 'a1b2c3d4e5f6789012345678',
                hash_sha256: '1a2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef123456',
                acquisition_time: new Date().toISOString(),
                size: '500GB',
                relevance_score: 0.95,
                analysis_complete: false,
                findings: [],
                data: { type: 'disk_image', sectors: 1000000, filesystem: 'NTFS' }
            }
        ];

        fallbackEvidence.forEach(evidence => {
            this.evidenceItems.set(evidence.id, evidence);
        });
    }

    // Get evidence by ID
    getEvidence(evidenceId) {
        return this.evidenceItems.get(evidenceId);
    }

    // Get all evidence
    getAllEvidence() {
        return Array.from(this.evidenceItems.values());
    }

    // Share analysis result from forensic application
    shareAnalysisResult(appId, evidenceId, findings) {
        if (typeof evidenceId === 'object') {
            // If evidenceId is actually the findings object
            findings = evidenceId;
            evidenceId = `${appId}_analysis`;
        }

        this.analysisResults.set(`${appId}_${evidenceId}`, {
            appId,
            evidenceId,
            findings,
            timestamp: new Date().toISOString()
        });

        console.log(`[EvidenceContext] Analysis result shared by ${appId}`);
    }

    // Request evidence data for analysis
    requestEvidenceData(evidenceId) {
        const evidence = this.evidenceItems.get(evidenceId);
        if (evidence) {
            // Log access for chain of custody
            this.updateChainOfCustody(evidenceId, {
                timestamp: new Date().toISOString(),
                action: 'evidence_accessed',
                user: 'Forensic Application'
            });
        }
        return evidence;
    }

    // Update investigation timeline
    updateTimeline(events) {
        if (Array.isArray(events)) {
            this.timeline.push(...events);
        } else {
            this.timeline.push(events);
        }
        
        // Sort timeline by timestamp
        this.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // Add correlation between evidence items
    addCorrelation(evidenceIds, relationship) {
        const correlation = {
            id: `corr_${Date.now()}`,
            evidenceIds: Array.isArray(evidenceIds) ? evidenceIds : [evidenceIds],
            relationship,
            timestamp: new Date().toISOString(),
            confidence: relationship.confidence || 0.5
        };

        this.correlations.push(correlation);
        console.log(`[EvidenceContext] Correlation added:`, correlation);
    }

    // Update chain of custody
    updateChainOfCustody(evidenceId, entry) {
        this.chainOfCustodyLog.push({
            evidenceId,
            ...entry
        });
    }

    // Add event to timeline
    addEvent(event) {
        this.events.push(event);
        console.log(`[EvidenceContext] Event logged:`, event);
    }

    // Get investigation summary
    getInvestigationSummary() {
        return {
            evidenceCount: this.evidenceItems.size,
            analysisResults: this.analysisResults.size,
            timelineEvents: this.timeline.length,
            correlations: this.correlations.length,
            chainOfCustodyEntries: this.chainOfCustodyLog.length,
            completionRate: this.calculateCompletionRate()
        };
    }

    // Calculate investigation completion rate
    calculateCompletionRate() {
        const totalEvidence = this.evidenceItems.size;
        const analyzedEvidence = Array.from(this.evidenceItems.values())
            .filter(evidence => evidence.analysis_complete).length;
        
        return totalEvidence > 0 ? (analyzedEvidence / totalEvidence) * 100 : 0;
    }
}

// Export for use by forensic applications
export { Level5EvidenceContext };