/**
 * Forensic Report Application - Level 5 (Streamlined & Responsive)
 * Simple drag-and-drop report builder following NIST SP 800-86 standards
 */

import { ForensicAppBase } from './forensic-app-base.js';

export class ForensicReportApp extends ForensicAppBase {
    constructor() {
        super('forensic-report', 'Forensic Report Builder', {
            width: 'responsive',
            height: 'responsive'
        });
        
        this.reportSections = {
            'executive_summary': { 
                title: 'Executive Summary', 
                evidence: [], 
                required: true,
                description: 'High-level overview evidence (Timeline, Malware Analysis)',
                acceptedTypes: ['analysis', 'technical']
            },
            'evidence_analysis': { 
                title: 'Evidence Analysis', 
                evidence: [], 
                required: true,
                description: 'All evidence types for technical documentation',
                acceptedTypes: ['identity', 'contact', 'analysis', 'technical']
            },
            'findings': { 
                title: 'Key Findings', 
                evidence: [], 
                required: true,
                description: 'Critical identity evidence (Name, Email, Phone)',
                acceptedTypes: ['identity', 'contact']
            },
            'conclusions': { 
                title: 'Conclusions & Identity', 
                evidence: [], 
                required: true,
                description: 'Identity evidence proving who "The Null" really is',
                acceptedTypes: ['identity', 'contact']
            }
        };
        
        this.availableEvidence = [];
        this.reportScore = 0;
        this.isComplete = false;
        this.selectedEvidence = null; // For mobile interactions
    }

    createContent() {
        return `
            <div class="forensic-report-container h-full flex flex-col bg-gray-900 text-white">
                <!-- Header -->
                <div class="p-3 sm:p-4 bg-gray-800 border-b border-gray-700">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div class="mb-2 sm:mb-0">
                            <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">Forensic Report Builder</h2>
                            <p class="text-xs sm:text-sm text-gray-400">NIST SP 800-86 Compliant • Case #CF-2024-0314-001</p>
                        </div>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div class="text-xs sm:text-sm">
                                <span class="text-blue-400">Report Score: </span>
                                <span id="report-score" class="text-white font-bold">${this.reportScore}</span>
                                <span class="text-gray-400">/100</span>
                            </div>
                            <button id="submit-report-btn" class="px-3 py-1 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs sm:text-sm rounded transition-colors disabled:cursor-not-allowed" disabled>
                                <i class="bi bi-check-circle mr-1"></i>
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Tab Navigation -->
                <div class="lg:hidden bg-gray-800 border-b border-gray-700">
                    <div class="flex">
                        <button id="tab-evidence-bank" class="tab-button flex-1 px-4 py-3 text-sm font-medium bg-blue-600 text-white border-r border-gray-700">
                            <i class="bi bi-collection mr-2"></i>
                            Evidence Bank
                        </button>
                        <button id="tab-report-builder" class="tab-button flex-1 px-4 py-3 text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600">
                            <i class="bi bi-file-text mr-2"></i>
                            Report Builder
                        </button>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <!-- Evidence Bank Sidebar -->
                    <div id="evidence-bank-panel" class="w-full lg:w-1/4 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 p-3 sm:p-4 overflow-y-auto lg:max-h-full lg:block">
                        <h3 class="text-base sm:text-lg lg:text-xl font-semibold mb-3 text-blue-300">Evidence Bank</h3>
                        <p class="text-xs sm:text-sm lg:text-base text-gray-400 mb-4 break-words">
                            Drag evidence into report sections below or tap to select on mobile
                        </p>
                        
                        <div id="evidence-bank" class="space-y-2">
                            <!-- Evidence items will be populated here -->
                        </div>

                        <!-- Compliance Indicator -->
                        <div class="mt-6 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                            <h4 class="text-xs sm:text-sm font-semibold text-green-300 mb-2">
                                <i class="bi bi-shield-check mr-1"></i>
                                Standards Compliance
                            </h4>
                            <div class="space-y-1 text-xs">
                                <div class="flex items-center space-x-2">
                                    <i class="bi bi-check-circle text-green-400"></i>
                                    <span class="text-green-200">NIST SP 800-86</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <i class="bi bi-check-circle text-green-400"></i>
                                    <span class="text-green-200">ISO/IEC 27037:2012</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Report Builder Panel -->
                    <div id="report-builder-panel" class="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0 hidden lg:block">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <h3 class="text-base sm:text-lg lg:text-xl font-semibold text-blue-300 mb-2 sm:mb-0">Report Sections</h3>
                            <div class="text-xs sm:text-sm lg:text-base text-gray-400">
                                <span id="completed-sections">0</span> of 4 sections complete
                            </div>
                        </div>

                        <!-- Report Sections -->
                        <div id="report-sections" class="space-y-4 mb-6">
                            ${Object.entries(this.reportSections).map(([sectionId, section]) => this.createReportSection(sectionId, section)).join('')}
                        </div>

                        <!-- Report Preview -->
                        <div class="mt-6 p-4 bg-gray-800 rounded-lg">
                            <h4 class="text-sm sm:text-base font-semibold mb-3 text-yellow-300">Report Preview</h4>
                            <div id="report-preview" class="text-xs sm:text-sm text-gray-300 space-y-2">
                                <p>Report will be generated when all sections are complete...</p>
                            </div>
                        </div>

                        <!-- Final Identity Conclusion -->
                        <div id="identity-conclusion" class="mt-4 p-4 bg-red-900/30 border border-red-600 rounded-lg" style="display: none;">
                            <h4 class="text-sm sm:text-base font-semibold text-red-300 mb-2">
                                <i class="bi bi-person-check mr-2"></i>
                                Identity Conclusion
                            </h4>
                            <p class="text-sm text-red-200 break-words">
                                Based on forensic analysis, "The Null" has been conclusively identified as:
                            </p>
                            <div class="mt-2 p-3 bg-red-800/50 rounded">
                                <p class="text-base font-bold text-white" id="conclusion-name">Loading...</p>
                                <p class="text-sm text-red-200" id="conclusion-email">Email: Loading...</p>
                                <p class="text-sm text-red-200" id="conclusion-phone">Phone: Loading...</p>
                                <p class="text-sm text-red-200" id="conclusion-role">Role: Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Footer -->
                <div class="px-3 sm:px-4 py-2 bg-gray-800 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs">
                    <div class="mb-1 sm:mb-0">
                        <span class="text-gray-400">Report Status: </span>
                        <span id="report-status" class="text-yellow-400">In Progress</span>
                    </div>
                    <div class="text-gray-400">
                        Chain of Custody: Maintained • Evidence Integrity: Verified
                    </div>
                </div>
            </div>
        `;
    }

    createReportSection(sectionId, section) {
        return `
            <div class="report-section bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div class="p-3 sm:p-4 border-b border-gray-700 bg-gray-750">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1 sm:mb-0">${section.title}</h4>
                        <div class="flex items-center space-x-2">
                            ${section.required ? '<span class="px-2 py-1 text-xs sm:text-sm bg-red-600 text-red-100 rounded">Required</span>' : ''}
                            <span id="section-status-${sectionId}" class="px-2 py-1 text-xs sm:text-sm bg-gray-600 text-gray-300 rounded">Empty</span>
                        </div>
                    </div>
                    ${section.description ? `
                        <div class="text-xs sm:text-sm text-blue-300 mb-2">
                            <i class="bi bi-info-circle mr-1"></i>
                            ${section.description}
                        </div>
                    ` : ''}
                </div>
                
                <div class="drop-zone min-h-[120px] sm:min-h-[140px] p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors touch-manipulation" 
                     data-section-id="${sectionId}"
                     data-accepted-types="${section.acceptedTypes ? section.acceptedTypes.join(',') : ''}"
                     ondrop="window.forensicReportApp?.handleDrop(event)" 
                     ondragover="window.forensicReportApp?.handleDragOver(event)"
                     onclick="window.forensicReportApp?.handleMobileClick(event)">
                    <div id="section-content-${sectionId}" class="space-y-2">
                        <div class="text-center text-gray-500 py-4">
                            <i class="bi bi-plus-circle text-2xl sm:text-3xl mb-2 block"></i>
                            <p class="text-xs sm:text-sm lg:text-base break-words">Drop evidence here or tap to add</p>
                            ${section.acceptedTypes ? `
                                <div class="mt-2 flex flex-wrap justify-center gap-1">
                                    ${section.acceptedTypes.map(type => `
                                        <span class="px-2 py-1 text-xs bg-blue-600 text-blue-100 rounded">${this.getTypeLabel(type)}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        await super.initialize();
        
        // Check if evidence analysis is complete before initializing
        const analysisComplete = localStorage.getItem('level5_evidence_analysis_complete');
        if (analysisComplete !== 'true') {
            this.showAccessDeniedState();
            return;
        }
        
        window.forensicReportApp = this; // Make globally accessible for drag/drop
        this.loadEvidence();
        this.bindEvents();
        this.updateReportScore();
        
        // Show welcome message for successful access
        setTimeout(() => {
            this.showNotification('📝 Welcome to Forensic Report Builder! Evidence analysis data loaded from Evidence Viewer.', 'success', 4000);
        }, 1000);
    }

    bindEvents() {
        // Mobile tab switching
        const tabEvidenceBank = document.getElementById('tab-evidence-bank');
        const tabReportBuilder = document.getElementById('tab-report-builder');
        
        tabEvidenceBank?.addEventListener('click', () => this.switchToTab('evidence-bank'));
        tabReportBuilder?.addEventListener('click', () => this.switchToTab('report-builder'));

        // Submit report button
        const submitBtn = document.getElementById('submit-report-btn');
        submitBtn?.addEventListener('click', () => this.submitReport());

        // Make evidence items draggable
        this.setupDragAndDrop();
    }

    async loadEvidence() {
        try {
            // First try to load transferred data from evidence analysis
            const analysisDataStr = localStorage.getItem('level5_evidence_analysis_data');
            
            if (analysisDataStr) {
                const analysisData = JSON.parse(analysisDataStr);
                this.targetIdentity = analysisData.target_identity;
                this.extractedClues = analysisData.clues;
                
                console.log(`[ForensicReport] Loaded transferred data for ${this.targetIdentity?.code_name} with ${this.extractedClues?.length || 0} clues`);
                
                // Generate evidence bank from the analyzed evidence
                this.generateEvidenceBankFromAnalysis(analysisData);
            } else {
                // Fallback to API if no transferred data
                const response = await fetch('/api/level5/forensic-report-data');
                const result = await response.json();
                
                if (result.success && result.data && result.data.evidence_bank) {
                    this.availableEvidence = result.data.evidence_bank;
                    this.targetIdentity = result.data.target_identity;
                    
                    console.log(`[ForensicReport] Loaded ${this.availableEvidence.length} evidence clues from API for ${this.targetIdentity?.code_name}`);
                } else {
                    throw new Error('Failed to load forensic report data from API');
                }
            }
        } catch (error) {
            console.error('[ForensicReport] Error loading evidence:', error);
            this.loadFallbackEvidence();
        }

        this.renderEvidenceBank();
        this.updateIdentityConclusion();
    }

    generateEvidenceBankFromAnalysis(analysisData) {
        // Convert the analyzed evidence into evidence bank items for the report
        this.availableEvidence = [];
        
        if (analysisData.evidence_pool && Array.isArray(analysisData.evidence_pool)) {
            // Only include evidence that was actually analyzed (clues extracted)
            const analyzedEvidence = analysisData.evidence_pool.filter(evidence => 
                analysisData.clues.includes(evidence.id)
            );
            
            analyzedEvidence.forEach(evidence => {
                // Create evidence bank item from analyzed evidence
                const evidenceItem = {
                    id: evidence.id,
                    title: evidence.finding || evidence.title || 'Evidence Clue',
                    description: this.getClueDescription(evidence),
                    type: evidence.clue_type || 'evidence',
                    icon: evidence.icon || 'bi-file-earmark',
                    points: this.getEvidencePoints(evidence.clue_type),
                    source_evidence: evidence.title,
                    clue_data: evidence.evidence_data
                };
                
                this.availableEvidence.push(evidenceItem);
            });
        }
        
        // Ensure we have the key identity evidence pieces
        this.ensureIdentityEvidence();
        
        console.log(`[ForensicReport] Generated ${this.availableEvidence.length} evidence items from analysis`);
    }

    getClueDescription(evidence) {
        if (evidence.clue_type === 'identity') {
            return `Real identity information: ${evidence.evidence_data?.autofill_name || evidence.evidence_data?.account_name || this.targetIdentity?.real_name || 'Name found'}`;
        } else if (evidence.clue_type === 'contact') {
            const email = evidence.evidence_data?.email_address || evidence.evidence_data?.from_address || evidence.evidence_data?.trading_email;
            const phone = evidence.evidence_data?.phone_number || evidence.evidence_data?.caller_id || evidence.evidence_data?.registered_number;
            
            if (email) return `Contact information: ${email}`;
            if (phone) return `Contact information: ${phone}`;
            return 'Contact information extracted from evidence';
        } else {
            return evidence.finding || evidence.description || 'Technical evidence analyzed';
        }
    }

    getEvidencePoints(clueType) {
        const points = {
            'identity': 30,
            'contact': 25,
            'technical': 20
        };
        return points[clueType] || 15;
    }

    ensureIdentityEvidence() {
        // Ensure we have the core identity evidence needed for the conclusion
        const hasIdentity = this.availableEvidence.some(e => e.type === 'identity');
        const hasContact = this.availableEvidence.some(e => e.type === 'contact');
        
        if (!hasIdentity && this.targetIdentity?.real_name) {
            this.availableEvidence.push({
                id: 'identity_summary',
                title: `Real Name: ${this.targetIdentity.real_name}`,
                description: `"The Null" identified as ${this.targetIdentity.real_name}`,
                type: 'identity',
                icon: 'bi-person-badge',
                points: 30
            });
        }
        
        if (!hasContact && this.targetIdentity?.email) {
            this.availableEvidence.push({
                id: 'contact_summary',
                title: `Email: ${this.targetIdentity.email}`,
                description: `Primary contact: ${this.targetIdentity.email}`,
                type: 'contact',
                icon: 'bi-envelope',
                points: 25
            });
        }
    }

    updateIdentityConclusion() {
        // Update the identity conclusion section with the actual target data
        if (this.targetIdentity) {
            const nameEl = document.getElementById('conclusion-name');
            const emailEl = document.getElementById('conclusion-email');
            const phoneEl = document.getElementById('conclusion-phone');
            const roleEl = document.getElementById('conclusion-role');
            
            if (nameEl) nameEl.textContent = this.targetIdentity.real_name || 'Unknown';
            if (emailEl) emailEl.textContent = `Email: ${this.targetIdentity.email || 'Unknown'}`;
            if (phoneEl) phoneEl.textContent = `Phone: ${this.targetIdentity.phone || 'Unknown'}`;
            if (roleEl) roleEl.textContent = `Role: ${this.targetIdentity.role || 'Cyber Criminal'}`;
            
            console.log(`[ForensicReport] Identity conclusion updated for ${this.targetIdentity.real_name}`);
        }
    }

    loadFallbackEvidence() {
        // Fallback evidence if all else fails
        this.availableEvidence = [
            {
                id: 'fallback_identity',
                title: 'Identity Evidence',
                description: 'Real name found in digital artifacts',
                type: 'identity',
                icon: 'bi-person-badge',
                points: 25
            },
            {
                id: 'fallback_contact',
                title: 'Contact Evidence', 
                description: 'Email address discovered',
                type: 'contact',
                icon: 'bi-envelope',
                points: 20
            }
        ];
    }

    renderEvidenceBank() {
        const evidenceBank = document.getElementById('evidence-bank');
        if (!evidenceBank) return;

        evidenceBank.innerHTML = this.availableEvidence.map(evidence => `
            <div class="evidence-item cursor-move p-3 sm:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all min-h-[60px] touch-manipulation" 
                 draggable="true" 
                 data-evidence-id="${evidence.id}"
                 data-evidence-type="${evidence.type}"
                 data-evidence-points="${evidence.points}"
                 onclick="window.forensicReportApp?.handleEvidenceClick(event)">
                <div class="flex items-center space-x-3">
                    <i class="${evidence.icon} text-blue-400 text-lg sm:text-xl flex-shrink-0"></i>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <h5 class="text-sm sm:text-base font-semibold text-white truncate">${evidence.title}</h5>
                            <span class="px-2 py-1 text-xs font-medium rounded ${this.getTypeColor(evidence.type)}">
                                ${this.getTypeLabel(evidence.type)}
                            </span>
                        </div>
                        <p class="text-xs sm:text-sm text-gray-300 break-words">${evidence.description}</p>
                        <div class="mt-1 text-xs sm:text-sm text-blue-400">+${evidence.points} points</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupDragAndDrop() {
        // Add drag start event to evidence items
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('evidence-item')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.evidenceId);
                e.target.style.opacity = '0.5';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('evidence-item')) {
                e.target.style.opacity = '1';
            }
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('border-blue-400', 'bg-blue-900/20');
    }

    handleDrop(event) {
        event.preventDefault();
        const dropZone = event.currentTarget;
        dropZone.classList.remove('border-blue-400', 'bg-blue-900/20');
        
        const evidenceId = event.dataTransfer.getData('text/plain');
        const sectionId = dropZone.dataset.sectionId;
        
        this.addEvidenceToSection(sectionId, evidenceId);
    }

    // Mobile-friendly click handlers
    handleEvidenceClick(event) {
        const evidenceItem = event.currentTarget;
        const evidenceId = evidenceItem.dataset.evidenceId;
        
        // Remove previous selection
        document.querySelectorAll('.evidence-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-700');
        });
        
        // Highlight selected evidence
        evidenceItem.classList.add('ring-2', 'ring-blue-400', 'bg-blue-700');
        
        // Store selected evidence for mobile interactions
        this.selectedEvidence = evidenceId;
        
        // Auto-switch to report builder tab on mobile when evidence is selected
        if (window.innerWidth < 1024) {
            this.switchToTab('report-builder');
        }
        
        // Show mobile instruction
        this.showNotification('Evidence selected. Tap on a report section to add it.', 'info');
    }

    handleMobileClick(event) {
        if (!this.selectedEvidence) {
            this.showNotification('Please select evidence from the Evidence Bank first.', 'warning');
            return;
        }
        
        const dropZone = event.currentTarget;
        const sectionId = dropZone.dataset.sectionId;
        
        this.addEvidenceToSection(sectionId, this.selectedEvidence);
        
        // Clear selection
        this.selectedEvidence = null;
        document.querySelectorAll('.evidence-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-700');
        });
    }

    getTypeLabel(type) {
        const labels = {
            'identity': 'Identity',
            'contact': 'Contact Info',
            'analysis': 'Analysis',
            'technical': 'Technical'
        };
        return labels[type] || type;
    }

    getTypeColor(type) {
        const colors = {
            'identity': 'bg-green-600 text-green-100',
            'contact': 'bg-blue-600 text-blue-100',
            'analysis': 'bg-purple-600 text-purple-100',
            'technical': 'bg-orange-600 text-orange-100'
        };
        return colors[type] || 'bg-gray-600 text-gray-100';
    }

    addEvidenceToSection(sectionId, evidenceId) {
        const evidence = this.availableEvidence.find(e => e.id === evidenceId);
        const section = this.reportSections[sectionId];
        
        if (!evidence || !section) return;

        // Check if already added
        if (section.evidence.some(e => e.id === evidenceId)) {
            this.showNotification('Evidence already added to this section', 'warning');
            return;
        }

        // Validate evidence type for section
        if (section.acceptedTypes && !section.acceptedTypes.includes(evidence.type)) {
            const acceptedLabels = section.acceptedTypes.map(type => this.getTypeLabel(type)).join(', ');
            this.showNotification(
                `❌ Wrong section! "${evidence.title}" (${this.getTypeLabel(evidence.type)}) doesn't belong in ${section.title}. Try: ${acceptedLabels}`, 
                'error',
                5000
            );
            return;
        }

        // Add evidence to section
        section.evidence.push(evidence);
        this.renderSectionContent(sectionId);
        this.updateReportScore();
        this.checkReportCompletion();
        
        this.showNotification(`✅ Added ${evidence.title} to ${section.title}`, 'success');
        this.emitForensicEvent('evidence_added_to_report', { sectionId, evidenceId });
    }

    renderSectionContent(sectionId) {
        const section = this.reportSections[sectionId];
        const contentEl = document.getElementById(`section-content-${sectionId}`);
        const statusEl = document.getElementById(`section-status-${sectionId}`);
        
        if (!contentEl || !statusEl || !section) return;

        if (section.evidence.length === 0) {
            contentEl.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="bi bi-plus-circle text-2xl mb-2 block"></i>
                    <p class="text-xs sm:text-sm break-words">Drop evidence here to add to ${section.title.toLowerCase()}</p>
                </div>
            `;
            statusEl.textContent = 'Empty';
            statusEl.className = 'px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded';
        } else {
            contentEl.innerHTML = section.evidence.map(evidence => `
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded border">
                    <div class="flex items-center space-x-2 min-w-0 flex-1">
                        <i class="${evidence.icon} text-blue-400"></i>
                        <div class="min-w-0 flex-1">
                            <span class="text-sm font-medium text-white truncate block">${evidence.title}</span>
                            <span class="text-xs text-gray-400 truncate block">${evidence.description}</span>
                        </div>
                    </div>
                    <button class="text-red-400 hover:text-red-300 ml-2 flex-shrink-0" onclick="window.forensicReportApp?.removeEvidenceFromSection('${sectionId}', '${evidence.id}')">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            `).join('');
            
            statusEl.textContent = `${section.evidence.length} item${section.evidence.length > 1 ? 's' : ''}`;
            statusEl.className = 'px-2 py-1 text-xs bg-green-600 text-green-100 rounded';
        }
    }

    removeEvidenceFromSection(sectionId, evidenceId) {
        const section = this.reportSections[sectionId];
        if (section) {
            section.evidence = section.evidence.filter(e => e.id !== evidenceId);
            this.renderSectionContent(sectionId);
            this.updateReportScore();
            this.checkReportCompletion();
        }
    }

    updateReportScore() {
        let totalScore = 0;
        
        Object.values(this.reportSections).forEach(section => {
            section.evidence.forEach(evidence => {
                totalScore += evidence.points;
            });
        });

        this.reportScore = totalScore;
        
        const scoreEl = document.getElementById('report-score');
        if (scoreEl) {
            scoreEl.textContent = this.reportScore;
        }
    }

    checkReportCompletion() {
        const requiredSections = Object.entries(this.reportSections).filter(([id, section]) => section.required);
        const completedSections = requiredSections.filter(([id, section]) => section.evidence.length > 0);
        
        const completedCount = document.getElementById('completed-sections');
        if (completedCount) {
            completedCount.textContent = completedSections.length;
        }

        // Check if report is complete
        const isComplete = completedSections.length >= requiredSections.length && this.hasIdentityEvidence();
        
        if (isComplete && !this.isComplete) {
            this.isComplete = true;
            this.showIdentityConclusion();
            this.enableReportSubmission();
        }
    }

    hasIdentityEvidence() {
        // Check if we have at least one identity and one contact evidence
        const addedEvidence = Object.values(this.reportSections)
            .flatMap(section => section.evidence);
        
        const hasIdentity = addedEvidence.some(evidence => evidence.type === 'identity');
        const hasContact = addedEvidence.some(evidence => evidence.type === 'contact');
        
        return hasIdentity && hasContact;
    }

    showIdentityConclusion() {
        const conclusionEl = document.getElementById('identity-conclusion');
        if (conclusionEl) {
            conclusionEl.style.display = 'block';
        }
        
        const statusEl = document.getElementById('report-status');
        if (statusEl) {
            statusEl.textContent = 'Ready for Submission';
            statusEl.className = statusEl.className.replace('text-yellow-400', 'text-green-400');
        }
    }

    enableReportSubmission() {
        const submitBtn = document.getElementById('submit-report-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }

    async submitReport() {
        if (!this.isComplete) {
            this.showNotification('Complete all required sections before submitting', 'warning');
            return;
        }

        // Simulate report submission
        this.showNotification('Submitting forensic report...', 'info');
        
        setTimeout(() => {
            const targetName = this.targetIdentity?.real_name || 'Unknown Target';
            const codeName = this.targetIdentity?.code_name || 'The Null';
            
            this.showNotification(`🎉 Investigation Complete! ${codeName} identified as ${targetName}. Case closed!`, 'success', 5000);
            this.emitForensicEvent('report_submitted', { 
                score: this.reportScore,
                identity: this.targetIdentity?.real_name || 'Unknown',
                code_name: this.targetIdentity?.code_name || 'Unknown', 
                email: this.targetIdentity?.email || 'Unknown',
                phone: this.targetIdentity?.phone || 'Unknown',
                sections: this.reportSections 
            });
            
            // Complete the investigation
            setTimeout(() => {
                this.completeInvestigation();
            }, 2000);
        }, 2000);
    }

    async completeInvestigation() {
        const targetName = this.targetIdentity?.real_name || 'Unknown Target';
        const codeName = this.targetIdentity?.code_name || 'The Null';
        
        this.emitForensicEvent('investigation_complete', {
            finalScore: this.reportScore,
            identity: targetName,
            code_name: codeName,
            compliance: ['NIST SP 800-86', 'ISO/IEC 27037:2012']
        });
        
        this.showNotification(`🏆 Investigation Complete! Preparing final assessment...`, 'success', 3000);
        
        // End the level session using the game progress manager
        await this.endLevel5Session();
        
        // Mark level as completed
        localStorage.setItem('cyberquest_level_5_completed', 'true');
        
        // Create investigation summary for completion dialogue
        const investigationSummary = {
            investigationScore: this.reportScore,
            complianceScore: 95, // High compliance since report was completed
            objectivesCompleted: [
                'Chain of Custody Established',
                'Evidence Analysis Complete',
                'Identity Clues Extracted',
                'Forensic Report Built',
                'Target Identified'
            ],
            evidenceAnalyzed: this.availableEvidence?.map(e => e.title) || [],
            correctActions: Math.floor(this.reportScore / 10), // Estimate based on score
            incorrectActions: Math.max(0, 5 - Math.floor(this.reportScore / 20)),
            targetIdentity: this.targetIdentity,
            finalIdentity: targetName,
            codeName: codeName
        };
        
        // Wait a moment then launch completion dialogue
        setTimeout(async () => {
            await this.launchCompletionDialogue(investigationSummary);
        }, 2000);
        
        // Clear the stored analysis data since investigation is complete
        localStorage.removeItem('level5_evidence_analysis_data');
        localStorage.removeItem('level5_evidence_analysis_complete');
    }

    async endLevel5Session() {
        try {
            // Check if we have a session ID or need to create one
            const sessionId = sessionStorage.getItem('active_session_id') ||
                             localStorage.getItem('cyberquest_active_session_id') ||
                             window.currentSessionId;

            console.log(`[ForensicReport] Ending Level 5 session with score: ${this.reportScore}`);

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            if (sessionId) {
                // First, attach to the existing session that was started externally
                const startTime = parseInt(localStorage.getItem('cyberquest_level_5_start_time') || Date.now());
                progressManager.attachToExistingSession(
                    parseInt(sessionId),
                    5, // Level ID
                    'Hunt-for-the-Null', // Level name
                    'expert', // Difficulty
                    startTime
                );
            } else {
                // If no session exists, start and immediately complete one
                // This ensures we can track completion even if session wasn't formally started
                const startTime = parseInt(localStorage.getItem('cyberquest_level_5_start_time') || Date.now());
                await progressManager.startLevel(5, 'Hunt-for-the-Null', 'expert');
            }

            // Complete level using centralized system
            const sessionResult = await progressManager.completeLevel(this.reportScore, {
                reportScore: this.reportScore,
                targetIdentified: this.targetIdentity?.real_name || 'Unknown',
                evidenceAnalyzed: this.availableEvidence?.length || 0,
                sectionsCompleted: Object.values(this.reportSections).filter(s => s.evidence.length > 0).length,
                completionTime: Date.now() - parseInt(localStorage.getItem('cyberquest_level_5_start_time') || Date.now()),
                levelId: 5,
                forensicCompliance: true
            });

            if (sessionResult) {
                console.log('[ForensicReport] Level 5 completed successfully with centralized system:', sessionResult);
                
                // Clear session data
                localStorage.removeItem('cyberquest_active_session_id');
                sessionStorage.removeItem('active_session_id');
                window.currentSessionId = null;
                
                // Store completion data for potential use by completion dialogue
                localStorage.setItem('cyberquest_level_5_session_result', JSON.stringify({
                    score: this.reportScore,
                    xp: sessionResult.xp,
                    completionTime: sessionResult.time_spent
                }));
            }
            
        } catch (error) {
            console.error('[ForensicReport] Failed to end Level 5 session:', error);
            // Continue with completion even if session ending fails
            this.showNotification('Level completed locally. Session data may not be saved.', 'warning', 4000);
        }
    }

    async launchCompletionDialogue(investigationSummary) {
        try {
            // Import and start the Level 5 completion dialogue
            const { Level5CompletionDialogue } = await import('../dialogues/level5-completion-dialogue.js');
            
            // Create a mock investigation tracker with the summary data
            const mockInvestigationTracker = {
                getStatus: () => investigationSummary,
                forensicActions: [],
                correctActions: [],
                incorrectActions: []
            };
            
            // Get desktop reference (try multiple methods)
            let desktop = null;
            if (window.desktopManager) {
                desktop = window.desktopManager;
            } else if (window.desktop) {
                desktop = window.desktop;
            } else if (this.desktop) {
                desktop = this.desktop;
            }
            
            if (desktop) {
                Level5CompletionDialogue.startLevel5CompletionDialogue(desktop, mockInvestigationTracker);
                console.log('[ForensicReport] Level 5 completion dialogue launched successfully');
            } else {
                console.error('[ForensicReport] Could not find desktop reference for dialogue');
                // Fallback: redirect to levels after delay
                setTimeout(() => {
                    window.location.href = '/levels';
                }, 3000);
            }
            
        } catch (error) {
            console.error('[ForensicReport] Failed to launch completion dialogue:', error);
            
            // Fallback: redirect to levels
            setTimeout(() => {
                window.location.href = '/levels';
            }, 3000);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full max-w-sm`;
        
        const bgColor = {
            'success': 'bg-green-600',
            'error': 'bg-red-600',
            'info': 'bg-blue-600',
            'warning': 'bg-yellow-600'
        }[type] || 'bg-blue-600';

        notification.className += ` ${bgColor} text-white`;
        notification.innerHTML = `
            <div class="flex items-start space-x-2">
                <i class="bi bi-info-circle mt-0.5 flex-shrink-0"></i>
                <span class="text-sm font-medium break-words">${message}</span>
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

    showAccessDeniedState() {
        // Override the content to show access denied message
        const container = document.querySelector('.forensic-report-container');
        if (container) {
            container.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
                    <div class="text-center max-w-lg">
                        <i class="bi bi-lock-fill text-6xl text-red-400 mb-4"></i>
                        <h2 class="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
                        <div class="bg-red-900/30 border border-red-600 rounded-lg p-6 mb-6">
                            <h3 class="text-lg font-semibold text-red-300 mb-3">
                                <i class="bi bi-exclamation-triangle mr-2"></i>
                                Evidence Analysis Required
                            </h3>
                            <p class="text-red-200 mb-4">
                                You must complete evidence analysis in the <strong>Evidence Viewer</strong> before accessing the Forensic Report Builder.
                            </p>
                            <div class="text-sm text-red-300 space-y-2">
                                <div class="flex items-center">
                                    <i class="bi bi-arrow-right mr-2"></i>
                                    <span>Open Evidence Viewer application</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="bi bi-arrow-right mr-2"></i>
                                    <span>Analyze evidence and extract 3+ identity clues</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="bi bi-arrow-right mr-2"></i>
                                    <span>Complete analysis to unlock Report Builder</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-400">
                            <i class="bi bi-info-circle mr-1"></i>
                            Following proper digital forensics methodology - analysis before reporting
                        </div>
                    </div>
                </div>
            `;
        }
        
        console.log('[ForensicReport] Access denied - evidence analysis not complete');
    }

    switchToTab(tabName) {
        const evidenceBankPanel = document.getElementById('evidence-bank-panel');
        const reportBuilderPanel = document.getElementById('report-builder-panel');
        const tabEvidenceBank = document.getElementById('tab-evidence-bank');
        const tabReportBuilder = document.getElementById('tab-report-builder');

        if (tabName === 'evidence-bank') {
            // Show evidence bank panel, hide report builder panel
            evidenceBankPanel?.classList.remove('hidden');
            evidenceBankPanel?.classList.add('block');
            reportBuilderPanel?.classList.add('hidden');
            reportBuilderPanel?.classList.remove('block');

            // Update tab appearances
            tabEvidenceBank?.classList.remove('bg-gray-700', 'text-gray-300');
            tabEvidenceBank?.classList.add('bg-blue-600', 'text-white');
            tabReportBuilder?.classList.remove('bg-blue-600', 'text-white');
            tabReportBuilder?.classList.add('bg-gray-700', 'text-gray-300');
        } else if (tabName === 'report-builder') {
            // Show report builder panel, hide evidence bank panel
            reportBuilderPanel?.classList.remove('hidden');
            reportBuilderPanel?.classList.add('block');
            evidenceBankPanel?.classList.add('hidden');
            evidenceBankPanel?.classList.remove('block');

            // Update tab appearances
            tabReportBuilder?.classList.remove('bg-gray-700', 'text-gray-300');
            tabReportBuilder?.classList.add('bg-blue-600', 'text-white');
            tabEvidenceBank?.classList.remove('bg-blue-600', 'text-white');
            tabEvidenceBank?.classList.add('bg-gray-700', 'text-gray-300');
        }
    }
}

export default ForensicReportApp;