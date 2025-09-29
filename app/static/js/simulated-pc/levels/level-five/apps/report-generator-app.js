import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Report Generator Application - Level 5
 * Legal-compliant investigation report creation with evidence citation and export capabilities
 */
export class ReportGeneratorApp extends ForensicAppBase {
    constructor() {
        super('report-generator', 'Report Generator', {
            width: '95%',
            height: '90%'
        });
        
        this.currentReport = null;
        this.reportSections = [];
        this.citedEvidence = [];
        this.reportTemplate = 'standard'; // 'standard', 'executive', 'technical', 'legal'
        this.isDraft = true;
    }

    createContent() {
        return `
            <div class="report-generator-app h-full bg-black text-white p-4 overflow-hidden">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-orange-400">Forensic Report Generator</h2>
                    <div class="flex space-x-4 text-sm">
                        <div>
                            <span class="text-gray-300">Status:</span>
                            <span class="text-yellow-400 font-semibold" id="report-status">Draft</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Evidence:</span>
                            <span class="text-blue-400 font-semibold" id="evidence-count">0</span>
                        </div>
                        <div>
                            <span class="text-gray-300">Sections:</span>
                            <span class="text-green-400 font-semibold" id="sections-count">0</span>
                        </div>
                    </div>
                </div>

                <!-- Forensic UI Elements -->
                ${this.createForensicUI().evidencePanel}

                <!-- Report Controls -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex space-x-2">
                        <select id="template-select-${this.id}" class="bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="standard">Standard Report</option>
                            <option value="executive">Executive Summary</option>
                            <option value="technical">Technical Analysis</option>
                            <option value="legal">Legal Affidavit</option>
                        </select>
                        <button id="new-report-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                            New Report
                        </button>
                        <button id="load-template-btn-${this.id}" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold">
                            Load Template
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <button id="validate-report-btn-${this.id}" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm font-semibold">
                            Validate Report
                        </button>
                        <button id="preview-report-btn-${this.id}" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-semibold">
                            Preview
                        </button>
                        <button id="export-report-btn-${this.id}" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-semibold">
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-12 gap-4 h-full">
                    <!-- Left Panel - Report Sections -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Report Structure</h3>
                        
                        <!-- Add Section -->
                        <div class="mb-4">
                            <select id="section-type-${this.id}" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-2">
                                <option value="executive_summary">Executive Summary</option>
                                <option value="investigation_scope">Investigation Scope</option>
                                <option value="methodology">Methodology</option>
                                <option value="evidence_analysis">Evidence Analysis</option>
                                <option value="findings">Key Findings</option>
                                <option value="timeline">Timeline of Events</option>
                                <option value="recommendations">Recommendations</option>
                                <option value="appendices">Appendices</option>
                            </select>
                            <button id="add-section-btn-${this.id}" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold">
                                Add Section
                            </button>
                        </div>

                        <!-- Sections List -->
                        <div id="sections-list-${this.id}" class="space-y-2">
                            <!-- Sections will be populated here -->
                        </div>

                        <!-- Report Metadata -->
                        <div class="mt-6">
                            <h4 class="font-semibold mb-2 text-green-400">Report Metadata</h4>
                            <div class="space-y-2 text-sm">
                                <input type="text" id="case-number-${this.id}" placeholder="Case Number" 
                                       class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                <input type="text" id="investigator-${this.id}" placeholder="Lead Investigator" 
                                       class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                <input type="date" id="report-date-${this.id}" 
                                       class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                <select id="classification-${this.id}" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                    <option value="confidential">Confidential</option>
                                    <option value="restricted">Restricted</option>
                                    <option value="internal">Internal Use</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Center Panel - Report Editor -->
                    <div class="col-span-6 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Report Content</h3>
                        
                        <!-- Section Editor -->
                        <div id="section-editor-${this.id}" class="h-full">
                            <div class="text-center text-gray-500 mt-8">
                                Create a new report or select a section to edit
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Evidence Citations -->
                    <div class="col-span-3 bg-gray-800 rounded p-4 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-3 text-yellow-400">Evidence & Citations</h3>
                        
                        <!-- Available Evidence -->
                        <div class="mb-4">
                            <h4 class="font-semibold mb-2 text-blue-400">Available Evidence</h4>
                            <div id="available-evidence-${this.id}" class="space-y-2 max-h-48 overflow-y-auto">
                                <!-- Evidence items will be populated here -->
                            </div>
                        </div>

                        <!-- Cited Evidence -->
                        <div>
                            <h4 class="font-semibold mb-2 text-green-400">Cited Evidence</h4>
                            <div id="cited-evidence-${this.id}" class="space-y-2">
                                <!-- Cited evidence will be populated here -->
                            </div>
                        </div>

                        <!-- Report Validation -->
                        <div class="mt-6">
                            <h4 class="font-semibold mb-2 text-purple-400">Validation Status</h4>
                            <div id="validation-results-${this.id}" class="text-sm space-y-1">
                                <div class="text-gray-500">Run validation to check report compliance</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Report Preview Modal -->
                <div id="preview-modal-${this.id}" class="fixed inset-0 bg-black bg-opacity-75 hidden z-50 flex items-center justify-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-96 overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-4 text-orange-400">Report Preview</h3>
                        <div id="preview-content-${this.id}" class="text-sm">
                            <!-- Preview content will be populated here -->
                        </div>
                        <div class="flex justify-end mt-4 space-x-2">
                            <button id="close-preview-modal-${this.id}" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Close</button>
                            <button id="finalize-report-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Finalize Report</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        super.initialize();
        
        this.loadAvailableEvidence();
        this.bindEvents();
        this.setDefaultMetadata();
        
        this.emitForensicEvent('report_generator_opened', {
            template: this.reportTemplate
        });
    }

    bindEvents() {
        const container = this.windowElement;

        // Control buttons
        const newReportBtn = container.querySelector(`#new-report-btn-${this.id}`);
        const loadTemplateBtn = container.querySelector(`#load-template-btn-${this.id}`);
        const addSectionBtn = container.querySelector(`#add-section-btn-${this.id}`);
        const validateBtn = container.querySelector(`#validate-report-btn-${this.id}`);
        const previewBtn = container.querySelector(`#preview-report-btn-${this.id}`);
        const exportBtn = container.querySelector(`#export-report-btn-${this.id}`);
        const templateSelect = container.querySelector(`#template-select-${this.id}`);

        // Modal controls
        const closePreviewBtn = container.querySelector(`#close-preview-modal-${this.id}`);
        const finalizeBtn = container.querySelector(`#finalize-report-btn-${this.id}`);

        newReportBtn?.addEventListener('click', () => this.createNewReport());
        loadTemplateBtn?.addEventListener('click', () => this.loadReportTemplate());
        addSectionBtn?.addEventListener('click', () => this.addReportSection());
        validateBtn?.addEventListener('click', () => this.validateReport());
        previewBtn?.addEventListener('click', () => this.previewReport());
        exportBtn?.addEventListener('click', () => this.exportReport());
        templateSelect?.addEventListener('change', (e) => this.changeTemplate(e.target.value));

        closePreviewBtn?.addEventListener('click', () => this.closePreviewModal());
        finalizeBtn?.addEventListener('click', () => this.finalizeReport());
    }

    setDefaultMetadata() {
        const caseNumber = this.windowElement.querySelector(`#case-number-${this.id}`);
        const investigator = this.windowElement.querySelector(`#investigator-${this.id}`);
        const reportDate = this.windowElement.querySelector(`#report-date-${this.id}`);

        if (caseNumber) caseNumber.value = `CASE-${Date.now()}`;
        if (investigator) investigator.value = 'Digital Forensics Analyst';
        if (reportDate) reportDate.value = new Date().toISOString().split('T')[0];
    }

    loadAvailableEvidence() {
        const evidenceContainer = this.windowElement.querySelector(`#available-evidence-${this.id}`);
        if (!evidenceContainer) return;

        const allEvidence = this.evidenceStore.getAllEvidence();

        evidenceContainer.innerHTML = allEvidence.map(evidence => `
            <div class="evidence-item bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600"
                 data-evidence-id="${evidence.id}">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-semibold text-white text-sm">${evidence.name}</div>
                        <div class="text-xs text-gray-400">${this.formatEvidenceType(evidence.type)}</div>
                    </div>
                    <button class="cite-evidence-btn text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                            data-evidence-id="${evidence.id}">
                        Cite
                    </button>
                </div>
            </div>
        `).join('');

        // Bind cite buttons
        evidenceContainer.querySelectorAll('.cite-evidence-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.citeEvidence(btn.dataset.evidenceId);
            });
        });
    }

    createNewReport() {
        this.currentReport = {
            id: `report_${Date.now()}`,
            title: 'Digital Forensics Investigation Report',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            template: this.reportTemplate,
            metadata: this.getReportMetadata(),
            sections: []
        };

        this.reportSections = [];
        this.citedEvidence = [];
        this.isDraft = true;

        this.updateSectionsList();
        this.updateCitedEvidence();
        this.updateReportCounts();

        // Clear editor
        const editor = this.windowElement.querySelector(`#section-editor-${this.id}`);
        if (editor) {
            editor.innerHTML = '<div class="text-center text-gray-500 mt-8">Add sections to begin writing your report</div>';
        }

        // Update chain of custody
        this.updateChainOfCustody('report_generation', 'new_report_created');

        this.emitForensicEvent('report_created', {
            reportId: this.currentReport.id,
            template: this.reportTemplate
        });

        this.showNotification('New report created successfully', 'success');
    }

    loadReportTemplate() {
        const template = this.reportTemplate;
        
        // Load predefined sections based on template type
        const templateSections = this.getTemplateSections(template);
        
        templateSections.forEach(sectionType => {
            this.addReportSection(sectionType);
        });

        this.showNotification(`${template} template loaded`, 'success');
    }

    getTemplateSections(template) {
        const templates = {
            'standard': [
                'executive_summary',
                'investigation_scope',
                'methodology',
                'evidence_analysis',
                'findings',
                'timeline',
                'recommendations',
                'appendices'
            ],
            'executive': [
                'executive_summary',
                'findings',
                'recommendations'
            ],
            'technical': [
                'methodology',
                'evidence_analysis',
                'timeline',
                'appendices'
            ],
            'legal': [
                'investigation_scope',
                'methodology',
                'evidence_analysis',
                'findings',
                'appendices'
            ]
        };

        return templates[template] || templates['standard'];
    }

    addReportSection(sectionType = null) {
        if (!this.currentReport) {
            this.showNotification('Create a new report first', 'warning');
            return;
        }

        const sectionSelect = this.windowElement.querySelector(`#section-type-${this.id}`);
        const selectedType = sectionType || sectionSelect?.value;

        if (!selectedType) return;

        const section = {
            id: `section_${Date.now()}`,
            type: selectedType,
            title: this.getSectionTitle(selectedType),
            content: this.getSectionTemplate(selectedType),
            order: this.reportSections.length + 1
        };

        this.reportSections.push(section);
        this.updateSectionsList();
        this.updateReportCounts();

        // Select the newly added section
        this.selectSection(section.id);

        this.emitForensicEvent('report_section_added', {
            sectionType: selectedType,
            sectionCount: this.reportSections.length
        });
    }

    getSectionTitle(type) {
        const titles = {
            'executive_summary': 'Executive Summary',
            'investigation_scope': 'Investigation Scope and Objectives',
            'methodology': 'Methodology and Procedures',
            'evidence_analysis': 'Evidence Analysis',
            'findings': 'Key Findings and Conclusions',
            'timeline': 'Timeline of Events',
            'recommendations': 'Recommendations',
            'appendices': 'Appendices and Supporting Documentation'
        };
        return titles[type] || 'Section';
    }

    getSectionTemplate(type) {
        const templates = {
            'executive_summary': `
## Executive Summary

This report presents the findings of a digital forensic investigation conducted on [DATE]. The investigation focused on analyzing digital evidence to determine the nature and scope of the security incident.

### Key Findings:
- [Finding 1]
- [Finding 2]
- [Finding 3]

### Recommendations:
- [Recommendation 1]
- [Recommendation 2]
            `.trim(),

            'investigation_scope': `
## Investigation Scope and Objectives

### Case Information:
- **Case Number:** ${this.getMetadataValue('case-number')}
- **Date of Investigation:** ${this.getMetadataValue('report-date')}
- **Lead Investigator:** ${this.getMetadataValue('investigator')}

### Objectives:
The primary objectives of this investigation were to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Scope Limitations:
[Describe any limitations or constraints that affected the investigation]
            `.trim(),

            'methodology': `
## Methodology and Procedures

### Standards and Guidelines:
This investigation was conducted in accordance with:
- NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response
- ISO/IEC 27037:2012: Guidelines for identification, collection, acquisition and preservation of digital evidence

### Tools and Techniques:
The following forensic tools and techniques were employed:
- [Tool/Technique 1]
- [Tool/Technique 2]
- [Tool/Technique 3]

### Chain of Custody:
All evidence was handled in accordance with established chain of custody procedures to ensure integrity and admissibility.
            `.trim(),

            'evidence_analysis': `
## Evidence Analysis

### Evidence Overview:
[Provide overview of evidence analyzed]

### Analysis Results:
[Detailed analysis of each piece of evidence]

### Significant Findings:
[Highlight the most significant discoveries]
            `.trim(),

            'findings': `
## Key Findings and Conclusions

### Critical Findings:
1. [Critical Finding 1]
2. [Critical Finding 2]

### Supporting Evidence:
[Reference specific evidence that supports the findings]

### Conclusions:
Based on the analysis of digital evidence, the following conclusions can be drawn:
[Detailed conclusions]
            `.trim(),

            'timeline': `
## Timeline of Events

### Event Sequence:
[Chronological sequence of relevant events based on digital evidence]

### Correlation Analysis:
[Description of how events correlate across different evidence sources]
            `.trim(),

            'recommendations': `
## Recommendations

### Immediate Actions:
1. [Immediate recommendation 1]
2. [Immediate recommendation 2]

### Long-term Improvements:
1. [Long-term recommendation 1]
2. [Long-term recommendation 2]

### Security Enhancements:
[Recommendations for preventing similar incidents]
            `.trim(),

            'appendices': `
## Appendices

### Appendix A: Evidence Inventory
[List of all evidence items]

### Appendix B: Technical Details
[Detailed technical information]

### Appendix C: Tool Outputs
[Relevant tool outputs and screenshots]
            `.trim()
        };

        return templates[type] || '## Section\n\n[Section content goes here]';
    }

    getMetadataValue(fieldId) {
        const field = this.windowElement.querySelector(`#${fieldId}-${this.id}`);
        return field?.value || '[VALUE]';
    }

    updateSectionsList() {
        const sectionsList = this.windowElement.querySelector(`#sections-list-${this.id}`);
        if (!sectionsList) return;

        sectionsList.innerHTML = this.reportSections.map(section => `
            <div class="section-item bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600"
                 data-section-id="${section.id}">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-semibold text-white text-sm">${section.title}</div>
                        <div class="text-xs text-gray-400">${section.type.replace('_', ' ')}</div>
                    </div>
                    <div class="flex space-x-1">
                        <button class="move-up-btn text-xs text-blue-400 hover:text-blue-300"
                                data-section-id="${section.id}">
                            ↑
                        </button>
                        <button class="move-down-btn text-xs text-blue-400 hover:text-blue-300"
                                data-section-id="${section.id}">
                            ↓
                        </button>
                        <button class="delete-section-btn text-xs text-red-400 hover:text-red-300"
                                data-section-id="${section.id}">
                            ×
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind section item events
        sectionsList.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSection(item.dataset.sectionId);
            });
        });

        sectionsList.querySelectorAll('.move-up-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveSectionUp(btn.dataset.sectionId);
            });
        });

        sectionsList.querySelectorAll('.move-down-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveSectionDown(btn.dataset.sectionId);
            });
        });

        sectionsList.querySelectorAll('.delete-section-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSection(btn.dataset.sectionId);
            });
        });
    }

    selectSection(sectionId) {
        const section = this.reportSections.find(s => s.id === sectionId);
        if (!section) return;

        // Highlight selected section
        this.windowElement.querySelectorAll('.section-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-orange-400');
        });

        const selectedItem = this.windowElement.querySelector(`[data-section-id="${sectionId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('ring-2', 'ring-orange-400');
        }

        // Load section in editor
        this.loadSectionInEditor(section);
    }

    loadSectionInEditor(section) {
        const editor = this.windowElement.querySelector(`#section-editor-${this.id}`);
        if (!editor) return;

        editor.innerHTML = `
            <div class="section-editor h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-semibold text-white">${section.title}</h4>
                    <button id="save-section-btn-${section.id}" 
                            class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                        Save Section
                    </button>
                </div>
                <textarea id="section-content-${section.id}" 
                          class="flex-1 bg-gray-900 text-white p-4 rounded resize-none font-mono text-sm"
                          placeholder="Enter section content...">${section.content}</textarea>
                <div class="mt-2 text-xs text-gray-400">
                    Tip: Use [EVIDENCE:id] to insert evidence citations
                </div>
            </div>
        `;

        // Bind save button
        const saveBtn = editor.querySelector(`#save-section-btn-${section.id}`);
        saveBtn?.addEventListener('click', () => this.saveSection(section.id));
    }

    saveSection(sectionId) {
        const textarea = this.windowElement.querySelector(`#section-content-${sectionId}`);
        if (!textarea) return;

        const section = this.reportSections.find(s => s.id === sectionId);
        if (section) {
            section.content = textarea.value;
            section.modified = new Date().toISOString();
            
            this.showNotification('Section saved successfully', 'success');
        }
    }

    citeEvidence(evidenceId) {
        const evidence = this.evidenceStore.getEvidence(evidenceId);
        if (!evidence) return;

        // Check if already cited
        if (this.citedEvidence.some(ce => ce.id === evidenceId)) {
            this.showNotification('Evidence already cited', 'warning');
            return;
        }

        // Add to cited evidence
        this.citedEvidence.push({
            id: evidenceId,
            name: evidence.name,
            type: evidence.type,
            citationId: `REF-${this.citedEvidence.length + 1}`
        });

        this.updateCitedEvidence();
        this.updateReportCounts();

        // Update chain of custody
        this.updateChainOfCustody('report_generation', `evidence_cited: ${evidence.name}`);

        this.emitForensicEvent('evidence_cited', {
            evidenceId: evidenceId,
            citationId: `REF-${this.citedEvidence.length}`
        });

        this.showNotification(`Evidence "${evidence.name}" cited successfully`, 'success');
    }

    updateCitedEvidence() {
        const container = this.windowElement.querySelector(`#cited-evidence-${this.id}`);
        if (!container) return;

        if (this.citedEvidence.length === 0) {
            container.innerHTML = '<div class="text-gray-500 text-sm">No evidence cited yet</div>';
            return;
        }

        container.innerHTML = this.citedEvidence.map(citation => `
            <div class="citation-item bg-gray-700 p-2 rounded">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-semibold text-white text-sm">${citation.citationId}</div>
                        <div class="text-xs text-gray-300">${citation.name}</div>
                        <div class="text-xs text-blue-400">${this.formatEvidenceType(citation.type)}</div>
                    </div>
                    <button class="remove-citation-btn text-xs text-red-400 hover:text-red-300"
                            data-evidence-id="${citation.id}">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        // Bind remove buttons
        container.querySelectorAll('.remove-citation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeCitation(btn.dataset.evidenceId);
            });
        });
    }

    removeCitation(evidenceId) {
        this.citedEvidence = this.citedEvidence.filter(ce => ce.id !== evidenceId);
        this.updateCitedEvidence();
        this.updateReportCounts();
        this.showNotification('Citation removed', 'success');
    }

    validateReport() {
        if (!this.currentReport) {
            this.showNotification('No report to validate', 'warning');
            return;
        }

        const validationResults = [];
        
        // Check metadata completeness
        const metadata = this.getReportMetadata();
        if (!metadata.caseNumber) validationResults.push({ type: 'error', message: 'Case number is required' });
        if (!metadata.investigator) validationResults.push({ type: 'error', message: 'Lead investigator is required' });
        if (!metadata.reportDate) validationResults.push({ type: 'error', message: 'Report date is required' });

        // Check section completeness
        if (this.reportSections.length === 0) {
            validationResults.push({ type: 'error', message: 'Report must contain at least one section' });
        }

        // Check for empty sections
        const emptySections = this.reportSections.filter(s => !s.content || s.content.trim().length < 10);
        if (emptySections.length > 0) {
            validationResults.push({ type: 'warning', message: `${emptySections.length} sections appear to be empty or incomplete` });
        }

        // Check evidence citations
        if (this.citedEvidence.length === 0) {
            validationResults.push({ type: 'warning', message: 'No evidence citations found' });
        }

        // Check for required sections based on template
        const requiredSections = this.getTemplateSections(this.reportTemplate);
        const missingSections = requiredSections.filter(rs => 
            !this.reportSections.some(s => s.type === rs)
        );
        
        if (missingSections.length > 0) {
            validationResults.push({ 
                type: 'warning', 
                message: `Missing recommended sections: ${missingSections.join(', ')}` 
            });
        }

        // Display validation results
        this.displayValidationResults(validationResults);

        this.emitForensicEvent('report_validated', {
            reportId: this.currentReport.id,
            errors: validationResults.filter(r => r.type === 'error').length,
            warnings: validationResults.filter(r => r.type === 'warning').length
        });
    }

    displayValidationResults(results) {
        const container = this.windowElement.querySelector(`#validation-results-${this.id}`);
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-green-400 text-sm">
                    ✓ Report validation passed
                </div>
            `;
        } else {
            container.innerHTML = results.map(result => `
                <div class="text-sm ${result.type === 'error' ? 'text-red-400' : 'text-yellow-400'}">
                    ${result.type === 'error' ? '✗' : '⚠'} ${result.message}
                </div>
            `).join('');
        }
    }

    previewReport() {
        if (!this.currentReport) {
            this.showNotification('No report to preview', 'warning');
            return;
        }

        const modal = this.windowElement.querySelector(`#preview-modal-${this.id}`);
        const content = this.windowElement.querySelector(`#preview-content-${this.id}`);

        if (modal && content) {
            content.innerHTML = this.generateReportPreview();
            modal.classList.remove('hidden');
        }
    }

    generateReportPreview() {
        const metadata = this.getReportMetadata();
        
        let preview = `
            <div class="report-preview bg-white text-black p-6 rounded">
                <!-- Report Header -->
                <div class="text-center mb-8 border-b border-gray-300 pb-4">
                    <h1 class="text-2xl font-bold mb-2">${this.currentReport.title}</h1>
                    <div class="text-sm text-gray-600">
                        <div>Case Number: ${metadata.caseNumber}</div>
                        <div>Lead Investigator: ${metadata.investigator}</div>
                        <div>Report Date: ${metadata.reportDate}</div>
                        <div>Classification: ${metadata.classification.toUpperCase()}</div>
                    </div>
                </div>

                <!-- Table of Contents -->
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-3">Table of Contents</h2>
                    <div class="space-y-1 text-sm">
                        ${this.reportSections.map((section, index) => `
                            <div class="flex justify-between">
                                <span>${index + 1}. ${section.title}</span>
                                <span>Page ${index + 2}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Report Sections -->
                ${this.reportSections.map((section, index) => `
                    <div class="section mb-8">
                        <h2 class="text-lg font-semibold mb-4">${index + 1}. ${section.title}</h2>
                        <div class="prose text-sm whitespace-pre-wrap">${this.processEvidenceCitations(section.content)}</div>
                    </div>
                `).join('')}

                <!-- Evidence References -->
                ${this.citedEvidence.length > 0 ? `
                    <div class="section">
                        <h2 class="text-lg font-semibold mb-4">Evidence References</h2>
                        <div class="space-y-2 text-sm">
                            ${this.citedEvidence.map(citation => `
                                <div>
                                    <strong>${citation.citationId}:</strong> ${citation.name} (${this.formatEvidenceType(citation.type)})
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        return preview;
    }

    processEvidenceCitations(content) {
        // Replace [EVIDENCE:id] placeholders with actual citations
        return content.replace(/\[EVIDENCE:(\w+)\]/g, (match, evidenceId) => {
            const citation = this.citedEvidence.find(ce => ce.id === evidenceId);
            return citation ? `[${citation.citationId}]` : match;
        });
    }

    closePreviewModal() {
        const modal = this.windowElement.querySelector(`#preview-modal-${this.id}`);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    finalizeReport() {
        if (!this.currentReport) return;

        this.isDraft = false;
        this.currentReport.finalized = new Date().toISOString();

        // Update UI
        const statusElement = this.windowElement.querySelector('#report-status');
        if (statusElement) {
            statusElement.textContent = 'Finalized';
            statusElement.classList.remove('text-yellow-400');
            statusElement.classList.add('text-green-400');
        }

        // Update chain of custody
        this.updateChainOfCustody('report_generation', 'report_finalized');

        this.emitForensicEvent('report_finalized', {
            reportId: this.currentReport.id,
            sectionCount: this.reportSections.length,
            evidenceCount: this.citedEvidence.length
        });

        this.closePreviewModal();
        this.showNotification('Report finalized successfully', 'success');
    }

    exportReport() {
        if (!this.currentReport) {
            this.showNotification('No report to export', 'warning');
            return;
        }

        // Simulate export process
        this.showNotification('Exporting report...', 'info');

        setTimeout(() => {
            // Update chain of custody
            this.updateChainOfCustody('report_generation', 'report_exported');

            this.emitForensicEvent('report_exported', {
                reportId: this.currentReport.id,
                format: 'pdf',
                classification: this.getReportMetadata().classification
            });

            this.showNotification('Report exported successfully', 'success');
        }, 2000);
    }

    changeTemplate(newTemplate) {
        this.reportTemplate = newTemplate;
        this.emitForensicEvent('report_template_changed', {
            template: newTemplate
        });
    }

    getReportMetadata() {
        return {
            caseNumber: this.getMetadataValue('case-number'),
            investigator: this.getMetadataValue('investigator'),
            reportDate: this.getMetadataValue('report-date'),
            classification: this.getMetadataValue('classification')
        };
    }

    updateReportCounts() {
        const evidenceCount = this.windowElement.querySelector('#evidence-count');
        const sectionsCount = this.windowElement.querySelector('#sections-count');

        if (evidenceCount) evidenceCount.textContent = this.citedEvidence.length;
        if (sectionsCount) sectionsCount.textContent = this.reportSections.length;
    }

    formatEvidenceType(type) {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    moveSectionUp(sectionId) {
        const index = this.reportSections.findIndex(s => s.id === sectionId);
        if (index > 0) {
            [this.reportSections[index - 1], this.reportSections[index]] = 
            [this.reportSections[index], this.reportSections[index - 1]];
            this.updateSectionsList();
        }
    }

    moveSectionDown(sectionId) {
        const index = this.reportSections.findIndex(s => s.id === sectionId);
        if (index < this.reportSections.length - 1) {
            [this.reportSections[index], this.reportSections[index + 1]] = 
            [this.reportSections[index + 1], this.reportSections[index]];
            this.updateSectionsList();
        }
    }

    deleteSection(sectionId) {
        this.reportSections = this.reportSections.filter(s => s.id !== sectionId);
        this.updateSectionsList();
        this.updateReportCounts();

        // Clear editor if deleted section was selected
        const editor = this.windowElement.querySelector(`#section-editor-${this.id}`);
        if (editor && editor.innerHTML.includes(sectionId)) {
            editor.innerHTML = '<div class="text-center text-gray-500 mt-8">Section deleted. Select another section to edit.</div>';
        }

        this.showNotification('Section deleted', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded z-50 ${
            type === 'success' ? 'bg-green-600' :
            type === 'warning' ? 'bg-yellow-600' :
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

export default ReportGeneratorApp;