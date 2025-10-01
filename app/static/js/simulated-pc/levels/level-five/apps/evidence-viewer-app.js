/**
 * Evidence Viewer Application - Level 5 (Streamlined & Responsive)
 * Guided evidence analysis following NIST SP 800-86 and ISO/IEC 27037:2012
 */

import { ForensicAppBase } from './forensic-app-base.js';

export class EvidenceViewerApp extends ForensicAppBase {
    constructor() {
        super('evidence-viewer', 'Digital Evidence Analysis', {
            width: 'responsive',
            height: 'responsive'
        });
        
        this.currentEvidence = null;
        this.analysisStep = 1;
        this.maxSteps = 4;
        this.discoveredClues = new Set();
        this.currentObjective = null;
    }

    createContent() {
        return `
            <div class="evidence-viewer-container h-full flex flex-col bg-gray-900 text-white">
                <!-- Header with Progress -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gray-800 border-b border-gray-700">
                    <div class="mb-2 sm:mb-0">
                        <h2 class="text-lg sm:text-xl font-bold text-green-400">Digital Evidence Analysis</h2>
                        <p class="text-xs sm:text-sm text-gray-400">Following NIST SP 800-86 Methodology</p>
                    </div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div class="text-xs sm:text-sm">
                            <span class="text-blue-400">Step ${this.analysisStep} of ${this.maxSteps}</span>
                        </div>
                        <div class="bg-gray-700 rounded-full h-2 w-full sm:w-32">
                            <div class="bg-blue-400 rounded-full h-2 transition-all duration-300" 
                                 style="width: ${(this.analysisStep / this.maxSteps) * 100}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Mobile Tab Navigation -->
                <div class="lg:hidden bg-gray-800 border-b border-gray-700">
                    <div class="flex">
                        <button id="tab-evidence" class="tab-button flex-1 px-4 py-3 text-sm font-medium bg-blue-600 text-white border-r border-gray-700">
                            <i class="bi bi-list-ul mr-2"></i>
                            Evidence List
                        </button>
                        <button id="tab-analysis" class="tab-button flex-1 px-4 py-3 text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600">
                            <i class="bi bi-search mr-2"></i>
                            Analysis Results
                        </button>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <!-- Evidence Selection Sidebar -->
                    <div id="evidence-panel" class="w-full lg:w-1/3 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 p-3 sm:p-4 overflow-y-auto lg:block">
                        <h3 class="text-base sm:text-lg font-semibold mb-3 text-blue-300">Available Evidence</h3>
                        <div id="evidence-list" class="space-y-2">
                            <!-- Evidence items will be populated here -->
                        </div>
                        
                        <!-- Chain of Custody Panel -->
                        <div class="mt-4 sm:mt-6 p-3 bg-gray-700 rounded-lg">
                            <h4 class="text-sm sm:text-base font-semibold mb-2 text-yellow-400">
                                <i class="bi bi-shield-check mr-1"></i>
                                Chain of Custody
                            </h4>
                            <div id="custody-status" class="text-xs sm:text-sm text-green-400">
                                ✓ Evidence integrity verified
                            </div>
                        </div>
                    </div>

                    <!-- Analysis Panel -->
                    <div id="analysis-panel" class="flex-1 flex-col p-3 sm:p-4 min-h-0 overflow-y-auto hidden lg:flex">
                        <!-- Current Objective Banner -->
                        <div id="objective-banner" class="mb-4 p-3 sm:p-4 bg-blue-900/50 border border-blue-600 rounded-lg flex-shrink-0">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div class="mb-2 sm:mb-0 flex-1 min-w-0">
                                    <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-blue-200 break-words">
                                        Current Objective: Establish Evidence Chain of Custody
                                    </h4>
                                    <p class="text-xs sm:text-sm lg:text-base text-blue-300 mt-1 break-words">
                                        Verify the integrity and authenticity of digital evidence per ISO/IEC 27037:2012
                                    </p>
                                </div>
                                <button id="hint-btn" class="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm lg:text-base rounded-md transition-colors flex-shrink-0 min-h-[44px] touch-manipulation">
                                    <i class="bi bi-lightbulb mr-1"></i>
                                    <span class="hidden sm:inline">Get Hint</span>
                                    <span class="sm:hidden">Hint</span>
                                </button>
                            </div>
                        </div>

                        <!-- Evidence Analysis Area -->
                        <div id="analysis-area" class="flex-1 bg-gray-800 rounded-lg p-3 sm:p-4 overflow-y-auto min-h-[300px]">
                            <div id="welcome-state" class="text-center py-8 sm:py-12">
                                <i class="bi bi-search text-4xl sm:text-6xl text-gray-600 mb-4"></i>
                                <h3 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-400 mb-2">Select Evidence to Begin Analysis</h3>
                                <p class="text-sm sm:text-base lg:text-lg text-gray-500 max-w-md mx-auto break-words">
                                    Choose evidence from the sidebar to start your forensic investigation following proper NIST procedures.
                                </p>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                            <button id="analyze-btn" class="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed min-h-[48px] touch-manipulation" disabled>
                                <i class="bi bi-cpu mr-2"></i>
                                <span class="text-sm sm:text-base lg:text-lg">Analyze Evidence</span>
                            </button>
                            <button id="extract-btn" class="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed min-h-[48px] touch-manipulation" disabled>
                                <i class="bi bi-download mr-2"></i>
                                <span class="text-sm sm:text-base lg:text-lg">Extract Clue</span>
                            </button>
                            <button id="next-step-btn" class="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed min-h-[48px] touch-manipulation" disabled>
                                <i class="bi bi-arrow-right mr-2"></i>
                                <span class="text-sm sm:text-base lg:text-lg">Next Step</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="px-3 sm:px-4 py-2 bg-gray-800 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm">
                    <div class="mb-1 sm:mb-0">
                        <span class="text-gray-400">Clues Found: </span>
                        <span id="clues-count" class="text-green-400 font-semibold">0</span>
                        <span class="text-gray-400"> / 3</span>
                    </div>
                    <div class="flex space-x-2 sm:space-x-4 text-xs">
                        <span class="text-blue-400">
                            <i class="bi bi-shield-check mr-1"></i>
                            NIST Compliant
                        </span>
                        <span class="text-green-400">
                            <i class="bi bi-check-circle mr-1"></i>
                            ISO 27037
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        await super.initialize();
        
        // Reset analysis completion status when starting new evidence analysis
        // This allows for replayability and proper workflow
        if (!this.isReanalysis) {
            localStorage.removeItem('level5_evidence_analysis_complete');
            localStorage.removeItem('level5_evidence_analysis_data');
            console.log('[EvidenceViewer] Reset analysis status for new investigation');
        }
        
        this.loadEvidence();
        this.bindEvents();
        this.updateObjective();
    }

    bindEvents() {
        // Mobile tab switching
        const tabEvidence = document.getElementById('tab-evidence');
        const tabAnalysis = document.getElementById('tab-analysis');
        
        tabEvidence?.addEventListener('click', () => this.switchToTab('evidence'));
        tabAnalysis?.addEventListener('click', () => this.switchToTab('analysis'));

        // Evidence selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.evidence-item')) {
                const evidenceId = e.target.closest('.evidence-item').dataset.evidenceId;
                this.selectEvidence(evidenceId);
                
                // Auto-switch to analysis tab on mobile when evidence is selected
                if (window.innerWidth < 1024) {
                    this.switchToTab('analysis');
                }
            }
        });

        // Action buttons
        const analyzeBtn = document.getElementById('analyze-btn');
        const extractBtn = document.getElementById('extract-btn'); 
        const nextStepBtn = document.getElementById('next-step-btn');
        const hintBtn = document.getElementById('hint-btn');

        analyzeBtn?.addEventListener('click', () => this.analyzeCurrentEvidence());
        extractBtn?.addEventListener('click', () => this.extractClue());
        nextStepBtn?.addEventListener('click', () => this.proceedToNextStep());
        hintBtn?.addEventListener('click', () => this.showHint());
    }

    async loadEvidence() {
        const evidenceList = document.getElementById('evidence-list');
        if (!evidenceList) return;

        try {
            // Load evidence from API - each member has 5 pieces of evidence
            const response = await fetch('/api/level5/evidence-viewer-data');
            const result = await response.json();
            
            if (result.success && result.data && result.data.evidence_pool) {
                this.evidencePool = result.data.evidence_pool;
                this.targetIdentity = result.data.target_identity;
                
                console.log(`Loaded ${this.evidencePool.length} evidence items for ${this.targetIdentity.code_name}`);
            } else {
                throw new Error('Failed to load evidence data from API');
            }
        } catch (error) {
            console.error('[EvidenceViewer] Error loading evidence from Level 5 API:', error);
            this.showNotification('Failed to load evidence data from Level 5 API. Please refresh the page.', 'error');
            this.evidencePool = [];
            this.targetIdentity = null;
            return;
        }

        // Render evidence list
        const evidence = this.evidencePool.map((item, index) => ({
            id: item.id,
            name: item.title,
            type: item.source,
            size: this.getEvidenceSize(item.type),
            status: 'verified',
            icon: item.icon || this.getDefaultIcon(item.type),
            clue_type: item.clue_type,
            difficulty: item.difficulty
        }));

        evidenceList.innerHTML = evidence.map(item => `
            <div class="evidence-item cursor-pointer p-3 sm:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all min-h-[70px] touch-manipulation" 
                 data-evidence-id="${item.id}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <i class="${item.icon} text-blue-400 text-lg sm:text-xl flex-shrink-0"></i>
                        <div class="min-w-0 flex-1">
                            <h4 class="text-sm sm:text-base font-semibold text-white truncate">${item.name}</h4>
                            <p class="text-xs sm:text-sm text-gray-400 truncate">${item.type}</p>
                            ${item.difficulty ? `<span class="text-xs px-2 py-1 rounded ${this.getDifficultyColor(item.difficulty)}">${item.difficulty}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col items-end text-xs sm:text-sm flex-shrink-0 ml-2">
                        <span class="text-gray-300">${item.size}</span>
                        <span class="text-green-400">
                            <i class="bi bi-shield-check mr-1"></i>
                            ${item.status}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getEvidenceSize(evidenceType) {
        const sizes = {
            'browser_autofill': '125MB',
            'browser_cookies': '89MB',
            'process_memory': '1.2GB', 
            'email_headers': '45MB',
            'network_traffic': '800MB',
            'voip_logs': '234MB',
            'network_forensics': '567MB',
            'system_logs': '156MB',
            'malware_analysis': '78MB',
            'keychain_data': '23MB',
            'pgp_keys': '12MB',
            'sms_backup': '156MB',
            'cryptocurrency': '89MB',
            'source_code': '234MB',
            'social_profiles': '67MB',
            'phishing_kit': '145MB',
            'burner_phone': '34MB',
            'fake_identities': '890MB',
            'psychological_profiles': '456MB',
            'banking_logs': '234MB',
            'trading_platform': '345MB',
            'fintech_app': '123MB',
            'trading_bot': '567MB',
            'money_laundering': '1.1GB',
            'hacking_tools': '289MB'
        };
        return sizes[evidenceType] || '500MB';
    }

    getDefaultIcon(evidenceType) {
        const icons = {
            'browser_autofill': 'bi-person-badge',
            'browser_cookies': 'bi-cookie',
            'process_memory': 'bi-memory',
            'email_headers': 'bi-envelope',
            'network_traffic': 'bi-wifi',
            'voip_logs': 'bi-phone',
            'network_forensics': 'bi-activity',
            'system_logs': 'bi-file-text',
            'malware_analysis': 'bi-bug',
            'keychain_data': 'bi-key',
            'pgp_keys': 'bi-shield-lock',
            'sms_backup': 'bi-chat-dots',
            'cryptocurrency': 'bi-currency-bitcoin',
            'source_code': 'bi-code-slash',
            'social_profiles': 'bi-people',
            'phishing_kit': 'bi-envelope-exclamation',
            'burner_phone': 'bi-phone',
            'fake_identities': 'bi-masks-theater',
            'psychological_profiles': 'bi-brain',
            'banking_logs': 'bi-bank',
            'trading_platform': 'bi-graph-up',
            'fintech_app': 'bi-phone-fill',
            'trading_bot': 'bi-robot',
            'money_laundering': 'bi-arrow-repeat',
            'hacking_tools': 'bi-tools'
        };
        return icons[evidenceType] || 'bi-file-earmark';
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'easy': 'bg-green-600 text-green-100',
            'medium': 'bg-yellow-600 text-yellow-100',
            'hard': 'bg-red-600 text-red-100'
        };
        return colors[difficulty] || 'bg-gray-600 text-gray-100';
    }

    selectEvidence(evidenceId) {
        // Remove previous selection
        document.querySelectorAll('.evidence-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-blue-400');
        });

        // Highlight selected evidence
        const selectedItem = document.querySelector(`[data-evidence-id="${evidenceId}"]`);
        selectedItem?.classList.add('ring-2', 'ring-blue-400');

        this.currentEvidence = evidenceId;
        this.displayEvidenceAnalysis(evidenceId);
        this.updateActionButtons();
    }

    displayEvidenceAnalysis(evidenceId) {
        const analysisArea = document.getElementById('analysis-area');
        if (!analysisArea) return;

        // Find the evidence in the loaded pool
        const evidence = this.evidencePool?.find(item => item.id === evidenceId);
        if (!evidence) {
            console.error('Evidence not found:', evidenceId);
            return;
        }

        // Extract findings from evidence data
        const findings = this.generateFindings(evidence);
        const data = {
            title: evidence.title,
            description: evidence.description,
            findings: findings,
            clue: evidence.finding
        };

        analysisArea.innerHTML = `
            <div class="space-y-4">
                <div class="border-b border-gray-700 pb-4">
                    <h3 class="text-lg sm:text-xl font-semibold text-green-400 mb-2">${data.title}</h3>
                    <p class="text-sm sm:text-base text-gray-300 break-words">${data.description}</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Analysis Results -->
                    <div class="space-y-3">
                        <h4 class="text-base font-semibold text-blue-300 flex items-center">
                            <i class="bi bi-search mr-2"></i>
                            Analysis Results
                        </h4>
                        ${data.findings.map(finding => `
                            <div class="flex items-start space-x-2 p-2 bg-gray-700 rounded">
                                <i class="bi bi-check-circle text-green-400 mt-1 flex-shrink-0"></i>
                                <span class="text-sm text-gray-200 break-words">${finding}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Key Evidence -->
                    <div class="space-y-3">
                        <h4 class="text-base font-semibold text-yellow-300 flex items-center">
                            <i class="bi bi-key mr-2"></i>
                            Key Evidence
                        </h4>
                        <div class="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                            <p class="text-sm text-yellow-200 break-words">
                                <i class="bi bi-exclamation-triangle mr-2"></i>
                                ${data.clue}
                            </p>
                            <button id="extract-clue-btn" class="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors">
                                Extract Identity Clue
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Compliance Check -->
                <div class="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                    <h4 class="text-sm font-semibold text-green-300 mb-2">
                        <i class="bi bi-shield-check mr-1"></i>
                        Forensic Compliance Status
                    </h4>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <span class="px-2 py-1 bg-green-600 text-white rounded">✓ Chain of Custody Maintained</span>
                        <span class="px-2 py-1 bg-green-600 text-white rounded">✓ Evidence Integrity Verified</span>
                        <span class="px-2 py-1 bg-green-600 text-white rounded">✓ NIST SP 800-86 Compliant</span>
                    </div>
                </div>
            </div>
        `;

        // Bind extract clue button
        const extractClueBtn = document.getElementById('extract-clue-btn');
        extractClueBtn?.addEventListener('click', () => this.extractClue());
    }

    updateActionButtons() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const extractBtn = document.getElementById('extract-btn');
        const nextStepBtn = document.getElementById('next-step-btn');

        if (this.currentEvidence) {
            analyzeBtn.disabled = false;
            extractBtn.disabled = false;
        }

        if (this.discoveredClues.size >= 3) {
            nextStepBtn.disabled = false;
            // Update button text to be clearer
            const nextStepBtnSpan = nextStepBtn?.querySelector('span');
            if (nextStepBtnSpan) {
                nextStepBtnSpan.textContent = 'Open Report Builder';
            }
        } else {
            // Update button text to show progress
            const nextStepBtnSpan = nextStepBtn?.querySelector('span');
            if (nextStepBtnSpan) {
                nextStepBtnSpan.textContent = `Need ${3 - this.discoveredClues.size} More Clues`;
            }
        }
    }

    analyzeCurrentEvidence() {
        if (!this.currentEvidence) return;
        
        this.showNotification(`Analyzing ${this.currentEvidence}... Evidence processing complete!`, 'success');
        this.emitForensicEvent('evidence_analyzed', { evidenceId: this.currentEvidence });
    }

    extractClue() {
        if (!this.currentEvidence) return;

        // Find the current evidence in the evidence pool
        const evidence = this.evidencePool?.find(item => item.id === this.currentEvidence);
        if (!evidence) {
            console.error('Evidence not found:', this.currentEvidence);
            return;
        }

        // Extract the clue from the evidence data based on clue_type
        let clue = '';
        const evidenceData = evidence.evidence_data || {};
        
        switch (evidence.clue_type) {
            case 'identity':
                // Extract name from various possible fields
                clue = evidenceData.autofill_name || 
                       evidenceData.account_name || 
                       evidenceData.profile_name || 
                       `Real name: ${this.targetIdentity?.real_name || 'Unknown'}`;
                break;
            case 'contact':
                // Extract email or phone based on evidence type
                if (evidenceData.email_address || evidenceData.from_address || evidenceData.trading_email) {
                    clue = `Email: ${evidenceData.email_address || evidenceData.from_address || evidenceData.trading_email}`;
                } else if (evidenceData.phone_number || evidenceData.caller_id || evidenceData.backup_phone || evidenceData.registered_number || evidenceData.verified_phone) {
                    clue = `Phone: ${evidenceData.phone_number || evidenceData.caller_id || evidenceData.backup_phone || evidenceData.registered_number || evidenceData.verified_phone}`;
                } else {
                    clue = `Contact info: ${this.targetIdentity?.email || this.targetIdentity?.phone || 'Unknown'}`;
                }
                break;
            case 'technical':
                // Extract technical details
                clue = evidence.finding || 'Technical evidence analyzed';
                break;
            default:
                clue = evidence.finding || 'Evidence analyzed';
        }

        // Only add if not already discovered
        if (clue && !this.discoveredClues.has(this.currentEvidence)) {
            this.discoveredClues.add(this.currentEvidence);
            this.updateCluesCount();
            this.showNotification(`Identity clue extracted: ${clue}`, 'success');
            this.emitForensicEvent('clue_discovered', { 
                clue, 
                source: this.currentEvidence, 
                evidence_type: evidence.type,
                clue_type: evidence.clue_type,
                target: this.targetIdentity?.code_name
            });
            
            console.log(`[EvidenceViewer] Clue extracted from ${this.currentEvidence}: ${clue}`);
        } else if (this.discoveredClues.has(this.currentEvidence)) {
            this.showNotification('Clue already extracted from this evidence', 'info');
        }

        this.updateActionButtons();
    }

    updateCluesCount() {
        const cluesCount = document.getElementById('clues-count');
        if (cluesCount) {
            cluesCount.textContent = this.discoveredClues.size;
        }
        
        // Also update action buttons when clues count changes
        this.updateActionButtons();
    }

    proceedToNextStep() {
        if (this.discoveredClues.size >= 3) {
            const targetName = this.targetIdentity?.real_name || this.targetIdentity?.code_name || 'Unknown Target';
            
            // Mark evidence analysis as complete for access control
            localStorage.setItem('level5_evidence_analysis_complete', 'true');
            
            // Store extracted clues and target data for forensic report
            const analysisData = {
                clues: Array.from(this.discoveredClues),
                target_identity: this.targetIdentity,
                target_name: targetName,
                evidence_pool: this.evidencePool,
                completion_time: new Date().toISOString()
            };
            localStorage.setItem('level5_evidence_analysis_data', JSON.stringify(analysisData));
            
            this.showNotification(`🎉 Evidence Analysis Complete! Opening Forensic Report Builder...`, 'success', 4000);
            this.emitForensicEvent('analysis_complete', { 
                clues: Array.from(this.discoveredClues),
                target_identity: this.targetIdentity,
                target_name: targetName
            });
            
            console.log(`[EvidenceViewer] Analysis complete for ${this.targetIdentity?.code_name}. Data stored for forensic report.`);
            
            // Automatically open the Forensic Report app after analysis completion
            setTimeout(() => {
                this.openForensicReportApp();
            }, 2000);
        }
    }

    async openForensicReportApp() {
        try {
            // Try to open the forensic report app using the application launcher
            if (window.applicationLauncher) {
                console.log('[EvidenceViewer] Opening Forensic Report Builder...');
                await window.applicationLauncher.launchForensicReport();
                this.showNotification('📝 Forensic Report Builder opened! Drag extracted evidence into report sections.', 'info', 5000);
            } else {
                // Fallback: emit event to request app opening
                this.emitForensicEvent('open_app', { appId: 'forensic-report' });
                this.showNotification('📝 Requesting Forensic Report Builder... If it doesn\'t open, try launching it manually from the Investigation Hub.', 'info', 5000);
            }
        } catch (error) {
            console.error('[EvidenceViewer] Failed to open Forensic Report app:', error);
            this.showNotification('⚠️ Could not auto-open Forensic Report Builder. Please open it manually from the Investigation Hub or desktop.', 'warning', 6000);
        }
    }

    updateObjective() {
        const objectives = [
            'Establish Evidence Chain of Custody',
            'Analyze Digital Artifacts',
            'Extract Identity Clues', 
            'Prepare for Report Building'
        ];

        const banner = document.getElementById('objective-banner');
        if (banner && this.analysisStep <= objectives.length) {
            banner.querySelector('h4').textContent = `Current Objective: ${objectives[this.analysisStep - 1]}`;
        }
    }

    showHint() {
        const hints = {
            1: 'Start by selecting evidence from the sidebar. Each piece contains crucial identity information.',
            2: 'Look for personal information like names, email addresses, and contact details.',
            3: 'Extract all identity clues before proceeding to report building.',
            4: 'Ensure all evidence maintains proper chain of custody throughout analysis.'
        };

        const hint = hints[this.analysisStep] || 'Follow the forensic methodology to identify The Null.';
        this.showNotification(hint, 'info', 5000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        const bgColor = {
            'success': 'bg-green-600',
            'error': 'bg-red-600', 
            'info': 'bg-blue-600',
            'warning': 'bg-yellow-600'
        }[type] || 'bg-blue-600';

        notification.className += ` ${bgColor} text-white`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="bi bi-info-circle"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    switchToTab(tabName) {
        const evidencePanel = document.getElementById('evidence-panel');
        const analysisPanel = document.getElementById('analysis-panel');
        const tabEvidence = document.getElementById('tab-evidence');
        const tabAnalysis = document.getElementById('tab-analysis');

        if (tabName === 'evidence') {
            // Show evidence panel, hide analysis panel
            evidencePanel?.classList.remove('hidden');
            evidencePanel?.classList.add('block');
            analysisPanel?.classList.add('hidden');
            analysisPanel?.classList.remove('flex');

            // Update tab appearances
            tabEvidence?.classList.remove('bg-gray-700', 'text-gray-300');
            tabEvidence?.classList.add('bg-blue-600', 'text-white');
            tabAnalysis?.classList.remove('bg-blue-600', 'text-white');
            tabAnalysis?.classList.add('bg-gray-700', 'text-gray-300');
        } else if (tabName === 'analysis') {
            // Show analysis panel, hide evidence panel
            analysisPanel?.classList.remove('hidden');
            analysisPanel?.classList.add('flex');
            evidencePanel?.classList.add('hidden');
            evidencePanel?.classList.remove('block');

            // Update tab appearances
            tabAnalysis?.classList.remove('bg-gray-700', 'text-gray-300');
            tabAnalysis?.classList.add('bg-blue-600', 'text-white');
            tabEvidence?.classList.remove('bg-blue-600', 'text-white');
            tabEvidence?.classList.add('bg-gray-700', 'text-gray-300');
        }
    }

    /**
     * Generate analysis findings based on evidence type and data
     * @param {Object} evidence - Evidence object containing type and data
     * @returns {Array} Array of analysis findings
     */
    generateFindings(evidence) {
        if (!evidence || !evidence.evidence_data) {
            return ['No detailed analysis data available'];
        }

        const findings = [];
        
        try {
            // Generate findings based on evidence type
            switch (evidence.type) {
                case 'browser_autofill':
                    if (evidence.evidence_data.autofill_name) {
                        findings.push(`Personal name identified: ${evidence.evidence_data.autofill_name}`);
                    }
                    if (evidence.evidence_data.autofill_address) {
                        findings.push(`Address information: ${evidence.evidence_data.autofill_address}`);
                    }
                    if (evidence.evidence_data.browser) {
                        findings.push(`Browser type: ${evidence.evidence_data.browser}`);
                    }
                    if (evidence.evidence_data.last_modified) {
                        findings.push(`Last modification: ${evidence.evidence_data.last_modified}`);
                    }
                    break;

                case 'process_memory':
                case 'email_headers':
                    if (evidence.evidence_data.email_address) {
                        findings.push(`Email address extracted: ${evidence.evidence_data.email_address}`);
                    }
                    if (evidence.evidence_data.email_provider) {
                        findings.push(`Email provider: ${evidence.evidence_data.email_provider}`);
                    }
                    if (evidence.evidence_data.last_login || evidence.evidence_data.timestamp) {
                        findings.push(`Last activity: ${evidence.evidence_data.last_login || evidence.evidence_data.timestamp}`);
                    }
                    break;

                case 'network_traffic':
                case 'voip_logs':
                    if (evidence.evidence_data.phone_number || evidence.evidence_data.caller_id) {
                        findings.push(`Phone number identified: ${evidence.evidence_data.phone_number || evidence.evidence_data.caller_id}`);
                    }
                    if (evidence.evidence_data.destination_ip) {
                        findings.push(`Communication endpoint: ${evidence.evidence_data.destination_ip}`);
                    }
                    if (evidence.evidence_data.call_duration) {
                        findings.push(`Call duration: ${evidence.evidence_data.call_duration}`);
                    }
                    break;

                case 'system_logs':
                    if (evidence.evidence_data.attack_start) {
                        findings.push(`Attack initiated: ${evidence.evidence_data.attack_start}`);
                    }
                    if (evidence.evidence_data.key_events) {
                        findings.push(`Timeline of events documented with ${evidence.evidence_data.key_events.length} key activities`);
                    }
                    break;

                case 'malware_analysis':
                    if (evidence.evidence_data.malware_name) {
                        findings.push(`Malware identified: ${evidence.evidence_data.malware_name}`);
                    }
                    if (evidence.evidence_data.author_signature) {
                        findings.push(`Author signature found: ${evidence.evidence_data.author_signature}`);
                    }
                    if (evidence.evidence_data.encryption) {
                        findings.push(`Encryption method: ${evidence.evidence_data.encryption}`);
                    }
                    break;

                case 'browser_cookies':
                case 'keychain_data':
                case 'social_profiles':
                    if (evidence.evidence_data.account_name || evidence.evidence_data.profile_name) {
                        findings.push(`Account name: ${evidence.evidence_data.account_name || evidence.evidence_data.profile_name}`);
                    }
                    if (evidence.evidence_data.service || evidence.evidence_data.platform) {
                        findings.push(`Service/Platform: ${evidence.evidence_data.service || evidence.evidence_data.platform}`);
                    }
                    break;

                case 'pgp_keys':
                case 'source_code':
                    if (evidence.evidence_data.user_id || evidence.evidence_data.author) {
                        findings.push(`Author information: ${evidence.evidence_data.user_id || evidence.evidence_data.author}`);
                    }
                    if (evidence.evidence_data.key_algorithm || evidence.evidence_data.algorithm) {
                        findings.push(`Technical details: ${evidence.evidence_data.key_algorithm || evidence.evidence_data.algorithm}`);
                    }
                    break;

                case 'banking_logs':
                case 'trading_platform':
                    if (evidence.evidence_data.account_holder || evidence.evidence_data.trading_email) {
                        findings.push(`Account holder: ${evidence.evidence_data.account_holder || evidence.evidence_data.trading_email}`);
                    }
                    if (evidence.evidence_data.bank || evidence.evidence_data.platform) {
                        findings.push(`Financial institution: ${evidence.evidence_data.bank || evidence.evidence_data.platform}`);
                    }
                    break;

                default:
                    // Generic analysis for unknown types
                    Object.entries(evidence.evidence_data).forEach(([key, value]) => {
                        if (typeof value === 'string' && value.length > 0) {
                            findings.push(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`);
                        }
                    });
                    break;
            }

            // Add generic metadata if available
            if (evidence.difficulty) {
                findings.push(`Analysis complexity: ${evidence.difficulty.toUpperCase()}`);
            }

            return findings.length > 0 ? findings : ['Technical analysis completed - see key evidence for details'];

        } catch (error) {
            console.error('Error generating findings:', error);
            return ['Analysis data processed - technical details available in evidence summary'];
        }
    }
}

export default EvidenceViewerApp;