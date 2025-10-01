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
            'executive_summary': { title: 'Executive Summary', evidence: [], required: true },
            'evidence_analysis': { title: 'Evidence Analysis', evidence: [], required: true },
            'findings': { title: 'Key Findings', evidence: [], required: true },
            'conclusions': { title: 'Conclusions & Identity', evidence: [], required: true }
        };
        
        this.availableEvidence = [];
        this.reportScore = 0;
        this.isComplete = false;
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

                <!-- Main Content -->
                <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <!-- Evidence Bank Sidebar -->
                    <div class="w-full lg:w-1/4 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 p-3 sm:p-4 overflow-y-auto">
                        <h3 class="text-base sm:text-lg font-semibold mb-3 text-blue-300">Evidence Bank</h3>
                        <p class="text-xs sm:text-sm text-gray-400 mb-4 break-words">
                            Drag evidence into report sections below
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
                    <div class="flex-1 p-3 sm:p-4 overflow-y-auto">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <h3 class="text-base sm:text-lg font-semibold text-blue-300 mb-2 sm:mb-0">Report Sections</h3>
                            <div class="text-xs sm:text-sm text-gray-400">
                                <span id="completed-sections">0</span> of 4 sections complete
                            </div>
                        </div>

                        <!-- Report Sections -->
                        <div id="report-sections" class="space-y-4">
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
                                <p class="text-base font-bold text-white">Alex Morrison</p>
                                <p class="text-sm text-red-200">Email: a.morrison@securemail.com</p>
                                <p class="text-sm text-red-200">Phone: +1-555-0142</p>
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
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <h4 class="text-sm sm:text-base font-semibold text-white mb-1 sm:mb-0">${section.title}</h4>
                        <div class="flex items-center space-x-2">
                            ${section.required ? '<span class="px-2 py-1 text-xs bg-red-600 text-red-100 rounded">Required</span>' : ''}
                            <span id="section-status-${sectionId}" class="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">Empty</span>
                        </div>
                    </div>
                </div>
                
                <div class="drop-zone min-h-[120px] p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors" 
                     data-section-id="${sectionId}"
                     ondrop="window.forensicReportApp?.handleDrop(event)" 
                     ondragover="window.forensicReportApp?.handleDragOver(event)">
                    <div id="section-content-${sectionId}" class="space-y-2">
                        <div class="text-center text-gray-500 py-4">
                            <i class="bi bi-plus-circle text-2xl mb-2 block"></i>
                            <p class="text-xs sm:text-sm break-words">Drop evidence here to add to ${section.title.toLowerCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        await super.initialize();
        window.forensicReportApp = this; // Make globally accessible for drag/drop
        this.loadEvidence();
        this.bindEvents();
        this.updateReportScore();
    }

    bindEvents() {
        // Submit report button
        const submitBtn = document.getElementById('submit-report-btn');
        submitBtn?.addEventListener('click', () => this.submitReport());

        // Make evidence items draggable
        this.setupDragAndDrop();
    }

    loadEvidence() {
        this.availableEvidence = [
            {
                id: 'laptop_identity',
                title: 'Laptop Identity Evidence',
                description: 'Real name "Alex Morrison" found in browser autofill',
                type: 'identity',
                icon: 'bi-person-badge',
                points: 25
            },
            {
                id: 'memory_email',
                title: 'Memory Email Evidence',
                description: 'Email "a.morrison@securemail.com" extracted from process memory',
                type: 'contact',
                icon: 'bi-envelope',
                points: 25
            },
            {
                id: 'network_phone',
                title: 'Network Contact Evidence', 
                description: 'Phone number +1-555-0142 found in exfiltrated data',
                type: 'contact',
                icon: 'bi-phone',
                points: 25
            },
            {
                id: 'attack_timeline',
                title: 'Attack Timeline',
                description: 'Chronological sequence of malicious activities',
                type: 'analysis',
                icon: 'bi-clock-history',
                points: 15
            },
            {
                id: 'malware_analysis',
                title: 'Malware Analysis',
                description: 'Backdoor and encryption tools identified',
                type: 'technical',
                icon: 'bi-bug',
                points: 10
            }
        ];

        this.renderEvidenceBank();
    }

    renderEvidenceBank() {
        const evidenceBank = document.getElementById('evidence-bank');
        if (!evidenceBank) return;

        evidenceBank.innerHTML = this.availableEvidence.map(evidence => `
            <div class="evidence-item cursor-move p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all" 
                 draggable="true" 
                 data-evidence-id="${evidence.id}"
                 data-evidence-type="${evidence.type}"
                 data-evidence-points="${evidence.points}">
                <div class="flex items-center space-x-3">
                    <i class="${evidence.icon} text-blue-400 text-lg flex-shrink-0"></i>
                    <div class="min-w-0 flex-1">
                        <h5 class="text-sm font-semibold text-white truncate">${evidence.title}</h5>
                        <p class="text-xs text-gray-300 break-words">${evidence.description}</p>
                        <div class="mt-1 text-xs text-blue-400">+${evidence.points} points</div>
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

    addEvidenceToSection(sectionId, evidenceId) {
        const evidence = this.availableEvidence.find(e => e.id === evidenceId);
        const section = this.reportSections[sectionId];
        
        if (!evidence || !section) return;

        // Check if already added
        if (section.evidence.some(e => e.id === evidenceId)) {
            this.showNotification('Evidence already added to this section', 'warning');
            return;
        }

        // Add evidence to section
        section.evidence.push(evidence);
        this.renderSectionContent(sectionId);
        this.updateReportScore();
        this.checkReportCompletion();
        
        this.showNotification(`Added ${evidence.title} to ${section.title}`, 'success');
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
        const identityEvidence = ['laptop_identity', 'memory_email', 'network_phone'];
        const addedEvidence = Object.values(this.reportSections)
            .flatMap(section => section.evidence)
            .map(evidence => evidence.id);
        
        return identityEvidence.every(id => addedEvidence.includes(id));
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
            this.showNotification('Report submitted successfully! The Null identified as Alex Morrison.', 'success', 5000);
            this.emitForensicEvent('report_submitted', { 
                score: this.reportScore,
                identity: 'Alex Morrison',
                sections: this.reportSections 
            });
            
            // Complete the investigation
            setTimeout(() => {
                this.completeInvestigation();
            }, 2000);
        }, 2000);
    }

    completeInvestigation() {
        this.emitForensicEvent('investigation_complete', {
            finalScore: this.reportScore,
            identity: 'Alex Morrison',
            compliance: ['NIST SP 800-86', 'ISO/IEC 27037:2012']
        });
        
        this.showNotification('Investigation complete! Level 5 finished successfully.', 'success', 5000);
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
}

export default ForensicReportApp;