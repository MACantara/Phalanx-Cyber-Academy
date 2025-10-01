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

                <!-- Main Content Area -->
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <!-- Evidence Selection Sidebar -->
                    <div class="w-full lg:w-1/3 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 p-3 sm:p-4 overflow-y-auto">
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
                    <div class="flex-1 flex flex-col p-3 sm:p-4 min-h-0 overflow-y-auto">
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
        this.loadEvidence();
        this.bindEvents();
        this.updateObjective();
    }

    bindEvents() {
        // Evidence selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.evidence-item')) {
                const evidenceId = e.target.closest('.evidence-item').dataset.evidenceId;
                this.selectEvidence(evidenceId);
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

    loadEvidence() {
        const evidenceList = document.getElementById('evidence-list');
        if (!evidenceList) return;

        const evidence = [
            {
                id: 'laptop_image',
                name: 'Laptop Hard Drive',
                type: 'Disk Image',
                size: '500GB',
                status: 'verified',
                icon: 'bi-device-hdd'
            },
            {
                id: 'memory_dump', 
                name: 'RAM Memory Dump',
                type: 'Memory Analysis',
                size: '16GB',
                status: 'verified',
                icon: 'bi-memory'
            },
            {
                id: 'network_logs',
                name: 'Network Traffic Logs',
                type: 'Network Analysis', 
                size: '2.5GB',
                status: 'verified',
                icon: 'bi-globe'
            }
        ];

        evidenceList.innerHTML = evidence.map(item => `
            <div class="evidence-item cursor-pointer p-3 sm:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all min-h-[70px] touch-manipulation" 
                 data-evidence-id="${item.id}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <i class="${item.icon} text-blue-400 text-lg sm:text-xl flex-shrink-0"></i>
                        <div class="min-w-0 flex-1">
                            <h4 class="text-sm sm:text-base font-semibold text-white truncate">${item.name}</h4>
                            <p class="text-xs sm:text-sm text-gray-400 truncate">${item.type}</p>
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

        const evidenceData = {
            laptop_image: {
                title: 'Laptop Hard Drive Analysis',
                description: 'NTFS filesystem with 3 partitions. Contains user data, system files, and deleted artifacts.',
                findings: [
                    'User account: "TheNull" found in registry',
                    'Browser history shows visits to hacker forums', 
                    'Deleted files in recycle bin contain encryption tools',
                    'Timeline shows activity during known attack timeframe'
                ],
                clue: 'Real name "Alex Morrison" found in browser autofill data'
            },
            memory_dump: {
                title: 'Memory Dump Analysis',
                description: 'RAM capture showing running processes, network connections, and malware artifacts.',
                findings: [
                    'Suspicious process "backdoor.exe" running as SYSTEM',
                    'Active network connections to command & control server',
                    'Encrypted communications detected in process memory',
                    'Anti-forensics tools loaded in memory'
                ],
                clue: 'Email address "a.morrison@securemail.com" extracted from process memory'
            },
            network_logs: {
                title: 'Network Traffic Analysis', 
                description: 'Packet capture showing communication patterns and data exfiltration attempts.',
                findings: [
                    'Outbound connections to IP 185.243.67.89 (known C&C server)',
                    'Large data uploads during attack timeframe',
                    'Encrypted tunnel established using custom protocol',
                    'DNS queries for suspicious domains'
                ],
                clue: 'Phone number +1-555-0142 found in exfiltrated contact data'
            }
        };

        const data = evidenceData[evidenceId];
        if (!data) return;

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
        }
    }

    analyzeCurrentEvidence() {
        if (!this.currentEvidence) return;
        
        this.showNotification(`Analyzing ${this.currentEvidence}... Evidence processing complete!`, 'success');
        this.emitForensicEvent('evidence_analyzed', { evidenceId: this.currentEvidence });
    }

    extractClue() {
        if (!this.currentEvidence) return;

        const clueMap = {
            laptop_image: 'Real name: Alex Morrison',
            memory_dump: 'Email: a.morrison@securemail.com', 
            network_logs: 'Phone: +1-555-0142'
        };

        const clue = clueMap[this.currentEvidence];
        if (clue && !this.discoveredClues.has(this.currentEvidence)) {
            this.discoveredClues.add(this.currentEvidence);
            this.updateCluesCount();
            this.showNotification(`Identity clue extracted: ${clue}`, 'success');
            this.emitForensicEvent('clue_discovered', { clue, source: this.currentEvidence });
        }

        this.updateActionButtons();
    }

    updateCluesCount() {
        const cluesCount = document.getElementById('clues-count');
        if (cluesCount) {
            cluesCount.textContent = this.discoveredClues.size;
        }
    }

    proceedToNextStep() {
        if (this.discoveredClues.size >= 3) {
            this.showNotification('🎉 All identity clues found! Next: 1) Check Investigation Hub for progress 2) Add evidence to Forensic Report sections', 'success', 6000);
            this.emitForensicEvent('analysis_complete', { 
                clues: Array.from(this.discoveredClues),
                identity: 'Alex Morrison'
            });
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
}

export default EvidenceViewerApp;