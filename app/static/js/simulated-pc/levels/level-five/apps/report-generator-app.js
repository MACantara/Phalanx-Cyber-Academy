import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Report Generator Application - Level 5
 * Drag-and-drop forensic report creation with evidence correlation
 */
export class ReportGeneratorApp extends ForensicAppBase {
    constructor() {
        super('report-generator', 'Report Generator', {
            width: '85%',
            height: '80%'
        });
        
        this.reportTemplate = null;
        this.reportSections = [];
        this.availableEvidence = [];
        this.droppedEvidence = new Map(); // sectionId -> [evidenceItems]
        this.dragDropConfig = null;
        this.investigationScore = 0;
        this.isDraft = true;
    }

    createContent() {
        return `
            <div class="report-generator-app h-full bg-black text-white p-4 overflow-auto flex flex-col">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-orange-400"><i class="bi bi-clipboard-data"></i> Forensic Report Generator</h2>
                    <div class="flex space-x-4 text-sm">
                        <div>
                            <span class="text-gray-300">Score:</span>
                            <span class="text-green-400 font-semibold" id="investigation-score-${this.id}">0/500</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Evidence:</span>
                            <span class="text-blue-400 font-semibold" id="evidence-count-${this.id}">0</span>
                        </div>
                        <button id="generate-report-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                            Generate Report
                        </button>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="mb-4 p-3 bg-gray-800 rounded border-l-4 border-blue-500">
                    <div class="text-blue-400 font-semibold mb-1"><i class="bi bi-lightbulb"></i> Investigation Instructions</div>
                    <div class="text-sm text-gray-300">
                        Drag evidence from the Evidence Locker into the appropriate report sections below. 
                        Build a comprehensive case to identify The Null and score investigation points.
                    </div>
                </div>

                <!-- Main Layout -->
                <div class="flex gap-4 h-full">
                    <!-- Left Panel - Available Evidence -->
                    <div class="w-80 bg-gray-800 rounded p-4 overflow-y-auto flex-shrink-0">
                        <h3 class="text-lg font-semibold mb-3 text-blue-400"><i class="bi bi-box-seam"></i> Available Evidence</h3>
                        <div id="evidence-bank-${this.id}" class="space-y-2">
                            <!-- Evidence cards will be populated here -->
                        </div>
                    </div>

                    <!-- Center Panel - Report Sections -->
                    <div class="flex-1 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-orange-400"><i class="bi bi-file-earmark-text"></i> Investigation Report</h3>
                        <div id="report-sections-${this.id}" class="space-y-4">
                            <!-- Report sections will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Report Generation Modal -->
                <div id="report-modal-${this.id}" class="fixed inset-0 bg-black/50 hidden z-50 flex justify-center items-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto m-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-orange-400">Final Investigation Report</h3>
                            <button id="close-report-modal-${this.id}" class="text-gray-400 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div id="final-report-content-${this.id}" class="text-sm leading-relaxed">
                            <!-- Final report will be generated here -->
                        </div>
                        <div class="mt-6 text-center">
                            <button id="submit-investigation-${this.id}" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-semibold">
                                Submit Investigation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        super.initialize();
        await this.loadReportTemplate();
        await this.loadAvailableEvidence();
        this.bindEvents();
        this.createReportSections();
    }

    async loadReportTemplate() {
        try {
            const response = await fetch('/api/level5/report-templates-data');
            const data = await response.json();
            
            if (data.success) {
                this.reportTemplate = data.data.report_templates[0]; // Use first template (forensic investigation report)
                this.dragDropConfig = data.data.drag_drop_config;
            }
        } catch (error) {
            console.error('Failed to load report template:', error);
        }
    }

    async loadAvailableEvidence() {
        try {
            const response = await fetch('/api/level5/all-data');
            const data = await response.json();
            
            if (data.success) {
                this.availableEvidence = data.data.evidence.evidence || [];
                this.renderEvidenceBank();
            }
        } catch (error) {
            console.error('Failed to load evidence:', error);
        }
    }

    bindEvents() {
        const generateBtn = this.windowElement.querySelector(`#generate-report-btn-${this.id}`);
        const closeModalBtn = this.windowElement.querySelector(`#close-report-modal-${this.id}`);
        const submitBtn = this.windowElement.querySelector(`#submit-investigation-${this.id}`);

        generateBtn?.addEventListener('click', () => this.generateFinalReport());
        closeModalBtn?.addEventListener('click', () => this.closeReportModal());
        submitBtn?.addEventListener('click', () => this.submitInvestigation());
    }

    renderEvidenceBank() {
        const evidenceBank = this.windowElement.querySelector(`#evidence-bank-${this.id}`);
        if (!evidenceBank) return;

        evidenceBank.innerHTML = this.availableEvidence.map(evidence => `
            <div class="evidence-card bg-gray-700 p-3 rounded-lg border border-gray-600 cursor-grab active:cursor-grabbing" 
                 draggable="true" 
                 data-evidence-id="${evidence.id}"
                 data-evidence-type="${evidence.type}">
                <div class="flex items-start space-x-3">
                    <div class="text-2xl">${this.getEvidenceIcon(evidence.type)}</div>
                    <div class="flex-1">
                        <div class="font-semibold text-white text-sm">${evidence.name}</div>
                        <div class="text-xs text-gray-400 mb-2">${this.formatEvidenceType(evidence.type)}</div>
                        <div class="text-xs text-gray-500">Size: ${evidence.size}</div>
                        <div class="text-xs text-gray-500">Hash: ${evidence.hash_md5}...</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add drag event listeners
        evidenceBank.querySelectorAll('.evidence-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    id: card.dataset.evidenceId,
                    type: card.dataset.evidenceType,
                    name: this.availableEvidence.find(ev => ev.id === card.dataset.evidenceId)?.name
                }));
                card.classList.add('opacity-50');
            });

            card.addEventListener('dragend', (e) => {
                card.classList.remove('opacity-50');
            });
        });

        this.updateEvidenceCount();
    }

    createReportSections() {
        if (!this.reportTemplate) return;

        const sectionsContainer = this.windowElement.querySelector(`#report-sections-${this.id}`);
        if (!sectionsContainer) return;

        sectionsContainer.innerHTML = this.reportTemplate.sections.map(section => `
            <div class="report-section bg-gray-700 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-semibold text-orange-400">${section.title}</h4>
                    <div class="flex items-center space-x-2">
                        ${section.required ? '<span class="text-xs bg-red-600 px-2 py-1 rounded">Required</span>' : '<span class="text-xs bg-gray-600 px-2 py-1 rounded">Optional</span>'}
                        <span class="text-xs text-gray-400" id="evidence-count-${section.title.replace(/\s+/g, '-').toLowerCase()}">0 evidence</span>
                    </div>
                </div>
                
                <div class="text-sm text-gray-400 mb-3">${section.template}</div>
                
                <!-- Drop Zone -->
                <div class="drop-zone min-h-32 border-2 border-dashed border-gray-600 rounded p-4 
                           transition-all duration-200 hover:border-blue-500" 
                     data-section-title="${section.title}"
                     data-section-order="${section.order}"
                     data-evidence-types='${JSON.stringify(section.evidence_types_accepted || ["all"])}'
                     data-min-evidence="${section.min_evidence || 0}"
                     data-max-evidence="${section.max_evidence || 10}">
                    
                    <div class="drop-placeholder text-center text-gray-500 py-8">
                        ${section.drag_drop_config?.placeholder_text || 'Drag evidence here...'}
                    </div>
                    
                    <div class="dropped-evidence space-y-2" style="display: none;">
                        <!-- Dropped evidence will appear here -->
                    </div>
                </div>
            </div>
        `).join('');

        // Add drop event listeners
        sectionsContainer.querySelectorAll('.drop-zone').forEach(zone => {
            this.setupDropZone(zone);
        });
    }

    setupDropZone(dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-900/20');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('border-blue-500', 'bg-blue-900/20');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-900/20');

            const evidenceData = JSON.parse(e.dataTransfer.getData('text/plain'));
            this.handleEvidenceDrop(dropZone, evidenceData);
        });
    }

    handleEvidenceDrop(dropZone, evidenceData) {
        const sectionTitle = dropZone.dataset.sectionTitle;
        const acceptedTypes = JSON.parse(dropZone.dataset.evidenceTypes);
        const maxEvidence = parseInt(dropZone.dataset.maxEvidence);

        // Check if evidence type is accepted
        if (!acceptedTypes.includes('all') && !acceptedTypes.includes(evidenceData.type)) {
            this.showNotification(`❌ ${sectionTitle} doesn't accept ${this.formatEvidenceType(evidenceData.type)} evidence`, 'error');
            return;
        }

        // Check if section is already at max capacity
        const droppedContainer = dropZone.querySelector('.dropped-evidence');
        const currentCount = droppedContainer.children.length;
        
        if (currentCount >= maxEvidence) {
            this.showNotification(`❌ ${sectionTitle} is at maximum evidence capacity (${maxEvidence})`, 'error');
            return;
        }

        // Check if evidence is already in this section
        const existingEvidence = Array.from(droppedContainer.children)
            .find(child => child.dataset.evidenceId === evidenceData.id);
        
        if (existingEvidence) {
            this.showNotification(`⚠️ Evidence already added to ${sectionTitle}`, 'warning');
            return;
        }

        // Add evidence to section
        this.addEvidenceToSection(dropZone, evidenceData);
        this.calculateScore();
        
        this.showNotification(`✅ Added "${evidenceData.name}" to ${sectionTitle}`, 'success');
    }

    addEvidenceToSection(dropZone, evidenceData) {
        const placeholder = dropZone.querySelector('.drop-placeholder');
        const droppedContainer = dropZone.querySelector('.dropped-evidence');
        const sectionTitle = dropZone.dataset.sectionTitle;

        // Hide placeholder and show evidence container
        placeholder.style.display = 'none';
        droppedContainer.style.display = 'block';

        // Create evidence item
        const evidenceItem = document.createElement('div');
        evidenceItem.className = 'evidence-item bg-gray-600 p-3 rounded flex justify-between items-center';
        evidenceItem.dataset.evidenceId = evidenceData.id;
        
        evidenceItem.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-xl">${this.getEvidenceIcon(evidenceData.type)}</div>
                <div>
                    <div class="font-medium text-white text-sm">${evidenceData.name}</div>
                    <div class="text-xs text-gray-400">${this.formatEvidenceType(evidenceData.type)}</div>
                </div>
            </div>
            <button class="remove-evidence text-red-400 hover:text-red-300 text-sm" 
                    title="Remove evidence">✕</button>
        `;

        // Add remove functionality
        evidenceItem.querySelector('.remove-evidence').addEventListener('click', () => {
            this.removeEvidenceFromSection(dropZone, evidenceData.id);
        });

        droppedContainer.appendChild(evidenceItem);

        // Update evidence count for this section
        this.updateSectionEvidenceCount(sectionTitle, droppedContainer.children.length);

        // Store dropped evidence
        if (!this.droppedEvidence.has(sectionTitle)) {
            this.droppedEvidence.set(sectionTitle, []);
        }
        this.droppedEvidence.get(sectionTitle).push(evidenceData);
    }

    removeEvidenceFromSection(dropZone, evidenceId) {
        const droppedContainer = dropZone.querySelector('.dropped-evidence');
        const placeholder = dropZone.querySelector('.drop-placeholder');
        const sectionTitle = dropZone.dataset.sectionTitle;

        // Remove evidence item
        const evidenceItem = Array.from(droppedContainer.children)
            .find(child => child.dataset.evidenceId === evidenceId);
        
        if (evidenceItem) {
            evidenceItem.remove();
        }

        // Update stored evidence
        if (this.droppedEvidence.has(sectionTitle)) {
            const evidenceList = this.droppedEvidence.get(sectionTitle);
            const updatedList = evidenceList.filter(ev => ev.id !== evidenceId);
            this.droppedEvidence.set(sectionTitle, updatedList);
        }

        // Show placeholder if no evidence left
        if (droppedContainer.children.length === 0) {
            placeholder.style.display = 'block';
            droppedContainer.style.display = 'none';
        }

        // Update evidence count
        this.updateSectionEvidenceCount(sectionTitle, droppedContainer.children.length);
        this.calculateScore();
    }

    updateSectionEvidenceCount(sectionTitle, count) {
        const countElement = this.windowElement.querySelector(`#evidence-count-${sectionTitle.replace(/\s+/g, '-').toLowerCase()}`);
        if (countElement) {
            countElement.textContent = `${count} evidence`;
        }
    }

    calculateScore() {
        if (!this.dragDropConfig?.critical_evidence_mapping) return;

        let totalScore = 0;
        const criticalMapping = this.dragDropConfig.critical_evidence_mapping;

        // Check each critical evidence requirement
        Object.entries(criticalMapping).forEach(([objectiveKey, objective]) => {
            const requiredSections = objective.required_sections;
            const evidenceIds = objective.evidence_ids;
            
            // Check if required evidence is in required sections
            let objectiveScore = 0;
            let sectionsWithEvidence = 0;

            requiredSections.forEach(sectionTitle => {
                const sectionEvidence = this.droppedEvidence.get(sectionTitle) || [];
                const hasRequiredEvidence = evidenceIds.some(evidenceId => 
                    sectionEvidence.some(ev => ev.id === evidenceId)
                );

                if (hasRequiredEvidence) {
                    sectionsWithEvidence++;
                }
            });

            // Score based on completion
            if (sectionsWithEvidence === requiredSections.length) {
                objectiveScore = objective.points;
            } else if (sectionsWithEvidence > 0) {
                objectiveScore = Math.floor(objective.points * 0.5); // Partial credit
            }

            totalScore += objectiveScore;
        });

        this.investigationScore = totalScore;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const scoreElement = this.windowElement.querySelector(`#investigation-score-${this.id}`);
        if (scoreElement) {
            scoreElement.textContent = `${this.investigationScore}/500`;
            
            // Update color based on score
            scoreElement.className = 'font-semibold';
            if (this.investigationScore >= 400) {
                scoreElement.classList.add('text-green-400');
            } else if (this.investigationScore >= 300) {
                scoreElement.classList.add('text-yellow-400');
            } else {
                scoreElement.classList.add('text-red-400');
            }
        }
    }

    updateEvidenceCount() {
        const countElement = this.windowElement.querySelector(`#evidence-count-${this.id}`);
        if (countElement) {
            const totalDropped = Array.from(this.droppedEvidence.values())
                .reduce((total, evidenceList) => total + evidenceList.length, 0);
            countElement.textContent = `${totalDropped}/${this.availableEvidence.length}`;
        }
    }

    generateFinalReport() {
        if (this.investigationScore < 300) {
            this.showNotification('<i class="bi bi-exclamation-triangle"></i> Investigation incomplete. Score at least 300 points to generate report.', 'warning');
            return;
        }

        const modal = this.windowElement.querySelector(`#report-modal-${this.id}`);
        const content = this.windowElement.querySelector(`#final-report-content-${this.id}`);

        if (modal && content) {
            content.innerHTML = this.generateReportContent();
            modal.classList.remove('hidden');
            
            console.log('[ReportGenerator] Final report generated, ready for submission');
        }
    }

    generateReportContent() {
        const victoryConditions = this.getVictoryCondition();
        
        return `
            <div class="space-y-6">
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-orange-400 mb-2">Investigation Complete!</h2>
                    <div class="text-lg text-white mb-4">${victoryConditions.title}</div>
                    <div class="text-sm text-gray-300 mb-4">${victoryConditions.description}</div>
                </div>

                <div class="bg-gray-700 p-4 rounded">
                    <h3 class="font-semibold text-green-400 mb-2">Investigation Summary</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-400">Final Score:</span>
                            <span class="text-white font-semibold">${this.investigationScore}/500 points</span>
                        </div>
                        <div>
                            <span class="text-gray-400">XP Reward:</span>
                            <span class="text-green-400 font-semibold">+${victoryConditions.rewards.xp} XP</span>
                        </div>
                        <div>
                            <span class="text-gray-400">Evidence Used:</span>
                            <span class="text-blue-400 font-semibold">${Array.from(this.droppedEvidence.values()).reduce((total, list) => total + list.length, 0)} items</span>
                        </div>
                        <div>
                            <span class="text-gray-400">Report Sections:</span>
                            <span class="text-orange-400 font-semibold">${this.droppedEvidence.size} completed</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-700 p-4 rounded">
                    <h3 class="font-semibold text-orange-400 mb-2">Key Findings</h3>
                    <div class="text-sm text-gray-300 leading-relaxed">
                        ${this.generateKeyFindings()}
                    </div>
                </div>

                <div class="text-center text-sm text-gray-400">
                    ${victoryConditions.message}
                </div>
            </div>
        `;
    }

    generateKeyFindings() {
        const findings = [];
        
        if (this.droppedEvidence.has('Executive Summary')) {
            findings.push("<i class='bi bi-check-circle-fill text-green-400'></i> Successfully identified The Null's true identity through digital forensic analysis");
        }
        
        if (this.droppedEvidence.has('Findings and Analysis')) {
            findings.push("<i class='bi bi-check-circle-fill text-green-400'></i> Reconstructed complete attack timeline and methodology");
        }
        
        if (this.droppedEvidence.has('Evidence Acquisition')) {
            findings.push("<i class='bi bi-check-circle-fill text-green-400'></i> Documented proper chain of custody for all digital evidence");
        }
        
        if (this.droppedEvidence.has('Conclusions')) {
            findings.push("<i class='bi bi-check-circle-fill text-green-400'></i> Established legal-grade evidence correlation for prosecution");
        }

        return findings.length > 0 ? findings.join('<br>') : 'Investigation findings documented in forensic report sections.';
    }

    getVictoryCondition() {
        if (this.investigationScore >= 500) {
            return {
                title: "Master Digital Forensics Investigator",
                description: "Perfect investigation! The Null's identity has been conclusively established.",
                message: "Outstanding work! You've achieved a perfect forensic investigation with comprehensive evidence correlation.",
                rewards: { xp: 500 }
            };
        } else if (this.investigationScore >= 400) {
            return {
                title: "Expert Digital Forensics Analyst",
                description: "Excellent investigation! The Null has been identified with strong evidence.",
                message: "Well done! Your investigation demonstrates expert forensic methodology and thorough evidence analysis.",
                rewards: { xp: 450 }
            };
        } else if (this.investigationScore >= 300) {
            return {
                title: "Competent Digital Forensics Investigator",
                description: "Good investigation! Sufficient evidence gathered to identify The Null.",
                message: "Good work! You've met the minimum requirements and successfully identified The Null.",
                rewards: { xp: 350 }
            };
        } else {
            return {
                title: "Investigation Incomplete",
                description: "More evidence needed to conclusively identify The Null.",
                message: "The investigation needs more thorough evidence analysis. Continue gathering and correlating evidence.",
                rewards: { xp: 100 }
            };
        }
    }

    submitInvestigation() {
        // Award XP and close
        const victoryCondition = this.getVictoryCondition();
        
        // Here you would typically call the XP system to award points
        this.showNotification(`Investigation submitted! Awarded ${victoryCondition.rewards.xp} XP`, 'success');
        
        // Emit forensic report submitted event to trigger completion dialogue
        this.emitForensicEvent('report_submitted', {
            score: this.investigationScore,
            evidenceUsed: Array.from(this.droppedEvidence.values()).flat().length,
            investigationComplete: true,
            timestamp: new Date().toISOString()
        });
        
        // Also dispatch global event for investigation tracker
        window.dispatchEvent(new CustomEvent('forensic_report_generated', {
            detail: {
                score: this.investigationScore,
                evidenceUsed: Array.from(this.droppedEvidence.values()).flat().length,
                app: this.id
            }
        }));
        
        console.log('[ReportGenerator] Investigation submitted, triggering completion dialogue');
        
        this.closeReportModal();
    }

    closeReportModal() {
        const modal = this.windowElement.querySelector(`#report-modal-${this.id}`);
        modal?.classList.add('hidden');
    }

    getEvidenceIcon(type) {
        const icons = {
            disk_image: '<i class="bi bi-hdd"></i>',
            memory_dump: '<i class="bi bi-memory"></i>', 
            network_capture: '<i class="bi bi-wifi"></i>',
            log_files: '<i class="bi bi-file-earmark-text"></i>'
        };
        return icons[type] || '<i class="bi bi-file-earmark"></i>';
    }

    formatEvidenceType(type) {
        const types = {
            disk_image: 'Disk Image',
            memory_dump: 'Memory Dump',
            network_capture: 'Network Capture', 
            log_files: 'Log Files'
        };
        return types[type] || type;
    }

    showNotification(message, type = 'info') {
        // Use centralized toast manager
        if (window.toastManager) {
            window.toastManager.showToast(message, type);
        }
    }
}

export default ReportGeneratorApp;