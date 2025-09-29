import { ForensicAppBase } from './forensic-app-base.js';

/**
 * Investigation Briefing Viewer - Level 5
 * Provides mission context, objectives, and workflow guidance
 */
export class InvestigationBriefingApp extends ForensicAppBase {
    constructor() {
        super('investigation-briefing', 'Investigation Briefing', {
            width: '70%',
            height: '75%'
        });
        
        this.briefingData = null;
        this.currentObjective = null;
        this.completedObjectives = new Set();
        this.investigationProgress = 0;
    }

    createContent() {
        return `
            <div class="briefing-app h-full bg-black text-white p-4 overflow-auto flex flex-col">
                <!-- Header -->
                <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 class="text-xl font-bold text-orange-400"><i class="bi bi-clipboard-data"></i> Investigation Briefing</h2>
                    <div class="flex items-center space-x-4 text-sm">
                        <div class="progress-indicator bg-gray-700 px-3 py-1 rounded">
                            <span class="text-gray-300">Progress:</span>
                            <span class="text-green-400 font-semibold" id="progress-${this.id}">0%</span>
                        </div>
                        <button id="start-investigation-btn-${this.id}" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold">
                            Start Investigation
                        </button>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="flex space-x-1 mb-4">
                    <button class="tab-btn active bg-blue-600 text-white px-4 py-2 rounded-t" data-tab="overview">
                        <i class="bi bi-file-earmark-text"></i> Overview
                    </button>
                    <button class="tab-btn bg-gray-700 text-gray-300 px-4 py-2 rounded-t hover:bg-gray-600" data-tab="objectives">
                        <i class="bi bi-target"></i> Objectives
                    </button>
                    <button class="tab-btn bg-gray-700 text-gray-300 px-4 py-2 rounded-t hover:bg-gray-600" data-tab="workflow">
                        <i class="bi bi-file-earmark-text"></i> Workflow
                    </button>
                    <button class="tab-btn bg-gray-700 text-gray-300 px-4 py-2 rounded-t hover:bg-gray-600" data-tab="evidence">
                        <i class="bi bi-folder"></i> Evidence Guide
                    </button>
                    <button class="tab-btn bg-gray-700 text-gray-300 px-4 py-2 rounded-t hover:bg-gray-600" data-tab="tips">
                        <i class="bi bi-lightbulb"></i> Tips
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto">
                    <!-- Overview Tab -->
                    <div id="tab-overview-${this.id}" class="tab-content">
                        <div class="space-y-6">
                            <div class="case-header bg-gray-700 p-4 rounded">
                                <h3 class="text-xl font-bold text-red-400 mb-2" id="case-title-${this.id}">Loading...</h3>
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div><span class="text-gray-400">Case Number:</span> <span id="case-number-${this.id}" class="text-white font-mono">-</span></div>
                                    <div><span class="text-gray-400">Priority:</span> <span id="case-priority-${this.id}" class="text-red-400 font-semibold">-</span></div>
                                    <div><span class="text-gray-400">Investigator:</span> <span id="case-investigator-${this.id}" class="text-blue-400">-</span></div>
                                    <div><span class="text-gray-400">Estimated Duration:</span> <span id="case-duration-${this.id}" class="text-yellow-400">-</span></div>
                                </div>
                            </div>

                            <div class="mission-summary">
                                <h4 class="font-semibold text-orange-400 mb-2">Mission Summary</h4>
                                <p id="mission-summary-${this.id}" class="text-gray-300 leading-relaxed">Loading mission details...</p>
                            </div>

                            <div class="mission-background">
                                <h4 class="font-semibold text-orange-400 mb-2">Background</h4>
                                <p id="mission-background-${this.id}" class="text-gray-300 leading-relaxed">Loading background information...</p>
                            </div>

                            <div class="success-criteria bg-green-900 bg-opacity-30 border border-green-600 p-4 rounded">
                                <h4 class="font-semibold text-green-400 mb-2">Success Criteria</h4>
                                <p id="success-criteria-${this.id}" class="text-gray-300 leading-relaxed">Loading success criteria...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Objectives Tab -->
                    <div id="tab-objectives-${this.id}" class="tab-content hidden">
                        <div class="space-y-4">
                            <div class="objectives-header">
                                <h3 class="text-lg font-bold text-orange-400 mb-2">Investigation Objectives</h3>
                                <p class="text-gray-400 text-sm mb-4">Complete these objectives to successfully identify The Null and solve the case.</p>
                            </div>
                            
                            <div id="objectives-list-${this.id}" class="space-y-3">
                                <!-- Objectives will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Workflow Tab -->
                    <div id="tab-workflow-${this.id}" class="tab-content hidden">
                        <div class="space-y-4">
                            <div class="workflow-header">
                                <h3 class="text-lg font-bold text-orange-400 mb-2">Recommended Investigation Workflow</h3>
                                <p class="text-gray-400 text-sm mb-4">Follow these steps for an efficient and thorough investigation.</p>
                            </div>
                            
                            <div id="workflow-steps-${this.id}" class="space-y-4">
                                <!-- Workflow steps will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Evidence Guide Tab -->
                    <div id="tab-evidence-${this.id}" class="tab-content hidden">
                        <div class="space-y-4">
                            <div class="evidence-header">
                                <h3 class="text-lg font-bold text-orange-400 mb-2">Evidence Analysis Guide</h3>
                                <p class="text-gray-400 text-sm mb-4">Key evidence items and their significance to the investigation.</p>
                            </div>
                            
                            <div id="evidence-guide-${this.id}" class="space-y-4">
                                <!-- Evidence guide will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Tips Tab -->
                    <div id="tab-tips-${this.id}" class="tab-content hidden">
                        <div class="space-y-4">
                            <div class="tips-header">
                                <h3 class="text-lg font-bold text-orange-400 mb-2">Investigation Tips & Best Practices</h3>
                                <p class="text-gray-400 text-sm mb-4">Expert advice to help you succeed in your digital forensics investigation.</p>
                            </div>
                            
                            <div class="tips-sections space-y-6">
                                <div class="general-tips">
                                    <h4 class="font-semibold text-blue-400 mb-2">General Investigation Tips</h4>
                                    <ul id="general-tips-${this.id}" class="space-y-1 text-sm text-gray-300">
                                        <!-- General tips will be populated here -->
                                    </ul>
                                </div>
                                
                                <div class="technical-tips">
                                    <h4 class="font-semibold text-green-400 mb-2">Technical Analysis Tips</h4>
                                    <ul id="technical-tips-${this.id}" class="space-y-1 text-sm text-gray-300">
                                        <!-- Technical tips will be populated here -->
                                    </ul>
                                </div>
                                
                                <div class="reporting-tips">
                                    <h4 class="font-semibold text-purple-400 mb-2">Report Generation Tips</h4>
                                    <ul id="reporting-tips-${this.id}" class="space-y-1 text-sm text-gray-300">
                                        <!-- Reporting tips will be populated here -->
                                    </ul>
                                </div>
                            </div>

                            <div class="scoring-guide bg-yellow-900 bg-opacity-30 border border-yellow-600 p-4 rounded">
                                <h4 class="font-semibold text-yellow-400 mb-2">Scoring Guide</h4>
                                <div id="scoring-guide-${this.id}" class="text-sm text-gray-300">
                                    <!-- Scoring guidance will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        super.initialize();
        await this.loadBriefingData();
        this.bindEvents();
        this.populateContent();
    }

    async loadBriefingData() {
        try {
            const response = await fetch('/api/level5/case-briefing-data');
            const data = await response.json();
            
            if (data.success) {
                this.briefingData = data.data;
            } else {
                // Fallback to local file if API not available
                const localResponse = await fetch('/static/js/simulated-pc/levels/level-five/data/case-briefing.json');
                this.briefingData = await localResponse.json();
            }
        } catch (error) {
            console.error('Failed to load briefing data:', error);
        }
    }

    bindEvents() {
        // Tab switching
        this.windowElement.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Start investigation button
        const startBtn = this.windowElement.querySelector(`#start-investigation-btn-${this.id}`);
        startBtn?.addEventListener('click', () => this.startInvestigation());
    }

    switchTab(tabName) {
        // Update tab buttons
        this.windowElement.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.className = 'tab-btn active bg-blue-600 text-white px-4 py-2 rounded-t';
            } else {
                btn.className = 'tab-btn bg-gray-700 text-gray-300 px-4 py-2 rounded-t hover:bg-gray-600';
            }
        });

        // Show/hide tab content
        this.windowElement.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `tab-${tabName}-${this.id}`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    populateContent() {
        if (!this.briefingData) return;

        this.populateOverview();
        this.populateObjectives();
        this.populateWorkflow();
        this.populateEvidenceGuide();
        this.populateTips();
    }

    populateOverview() {
        const briefing = this.briefingData.case_briefing;
        const mission = this.briefingData.mission_overview;

        // Case header
        this.updateElement(`case-title-${this.id}`, briefing.case_title);
        this.updateElement(`case-number-${this.id}`, briefing.case_number);
        this.updateElement(`case-priority-${this.id}`, briefing.priority);
        this.updateElement(`case-investigator-${this.id}`, briefing.assigned_investigator);
        this.updateElement(`case-duration-${this.id}`, briefing.estimated_duration);

        // Mission details
        this.updateElement(`mission-summary-${this.id}`, mission.summary);
        this.updateElement(`mission-background-${this.id}`, mission.background);
        this.updateElement(`success-criteria-${this.id}`, mission.success_criteria);
    }

    populateObjectives() {
        const objectives = this.briefingData.investigation_objectives;
        const container = this.windowElement.querySelector(`#objectives-list-${this.id}`);
        
        if (!container || !objectives) return;

        container.innerHTML = objectives.map(obj => `
            <div class="objective-card bg-gray-700 p-4 rounded border-l-4 ${this.getObjectiveBorderColor(obj.priority)}">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-white">${obj.title}</h4>
                    <div class="flex items-center space-x-2">
                        <span class="priority-badge ${this.getPriorityClass(obj.priority)} px-2 py-1 rounded text-xs font-semibold">
                            ${obj.priority}
                        </span>
                        <span class="points-badge bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            ${obj.points} pts
                        </span>
                    </div>
                </div>
                
                <p class="text-gray-300 text-sm mb-3">${obj.description}</p>
                
                <div class="success-indicators">
                    <h5 class="text-xs font-semibold text-gray-400 mb-1">SUCCESS INDICATORS:</h5>
                    <ul class="text-xs text-gray-300 space-y-1">
                        ${obj.success_indicators.map(indicator => `<li>• ${indicator}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    populateWorkflow() {
        const workflow = this.briefingData.investigation_workflow?.recommended_steps;
        const container = this.windowElement.querySelector(`#workflow-steps-${this.id}`);
        
        if (!container || !workflow) return;

        container.innerHTML = workflow.map(step => `
            <div class="workflow-step bg-gray-700 p-4 rounded">
                <div class="flex items-start space-x-4">
                    <div class="step-number bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        ${step.step}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-white mb-2">${step.title}</h4>
                        <p class="text-gray-300 text-sm mb-3">${step.description}</p>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                            <div>
                                <span class="text-gray-400">Estimated Time:</span>
                                <span class="text-yellow-400 font-semibold">${step.estimated_time}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Tools Required:</span>
                                <span class="text-blue-400">${step.tools_required.join(', ')}</span>
                            </div>
                        </div>
                        
                        <div class="key-actions mt-3">
                            <h5 class="text-xs font-semibold text-gray-400 mb-1">KEY ACTIONS:</h5>
                            <ul class="text-xs text-gray-300 space-y-1">
                                ${step.key_actions.map(action => `<li>• ${action}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateEvidenceGuide() {
        const evidence = this.briefingData.key_evidence_descriptions;
        const container = this.windowElement.querySelector(`#evidence-guide-${this.id}`);
        
        if (!container || !evidence) return;

        container.innerHTML = Object.entries(evidence).map(([key, ev]) => `
            <div class="evidence-item bg-gray-700 p-4 rounded">
                <div class="flex items-start space-x-4">
                    <div class="evidence-icon text-3xl">${this.getEvidenceTypeIcon(ev.type)}</div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-semibold text-white">${ev.name}</h4>
                            <span class="significance-badge ${this.getSignificanceClass(ev.significance)} px-2 py-1 rounded text-xs font-semibold">
                                ${ev.significance.toUpperCase()}
                            </span>
                        </div>
                        
                        <p class="text-gray-300 text-sm mb-2">${ev.analysis_focus}</p>
                        
                        <div class="expected-findings bg-gray-600 p-2 rounded text-xs">
                            <span class="text-gray-400 font-semibold">Expected Findings:</span>
                            <span class="text-gray-300">${ev.expected_findings}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateTips() {
        const tips = this.briefingData.investigation_tips;
        
        if (!tips) return;

        this.populateTipsList('general-tips', tips.general);
        this.populateTipsList('technical-tips', tips.technical);
        this.populateTipsList('reporting-tips', tips.reporting);

        // Scoring guidance
        const scoringContainer = this.windowElement.querySelector(`#scoring-guide-${this.id}`);
        const scoring = this.briefingData.scoring_guidance;
        
        if (scoringContainer && scoring) {
            scoringContainer.innerHTML = Object.entries(scoring).map(([key, value]) => `
                <div class="scoring-item mb-2">
                    <span class="font-semibold">${key.replace(/_/g, ' ').toUpperCase()}:</span>
                    <span>${value}</span>
                </div>
            `).join('');
        }
    }

    populateTipsList(elementId, tips) {
        const container = this.windowElement.querySelector(`#${elementId}-${this.id}`);
        if (!container || !tips) return;

        container.innerHTML = tips.map(tip => `<li>• ${tip}</li>`).join('');
    }

    startInvestigation() {
        // Launch Evidence Locker app
        if (window.applicationLauncher) {
            window.applicationLauncher.launchEvidenceLocker();
            this.showNotification('<i class="bi bi-rocket-takeoff"></i> Investigation started! Evidence Locker opened for evidence verification.', 'success');
        } else {
            this.showNotification('Unable to start investigation - Application launcher not available', 'error');
        }
    }

    updateProgress(completedObjectives) {
        this.completedObjectives = new Set(completedObjectives);
        const totalObjectives = this.briefingData?.investigation_objectives?.length || 5;
        this.investigationProgress = (this.completedObjectives.size / totalObjectives) * 100;
        
        const progressElement = this.windowElement.querySelector(`#progress-${this.id}`);
        if (progressElement) {
            progressElement.textContent = `${Math.round(this.investigationProgress)}%`;
        }
    }

    updateElement(id, content) {
        const element = this.windowElement.querySelector(`#${id}`);
        if (element) {
            element.textContent = content;
        }
    }

    getObjectiveBorderColor(priority) {
        switch (priority) {
            case 'CRITICAL': return 'border-red-500';
            case 'HIGH': return 'border-orange-500';
            case 'MEDIUM': return 'border-yellow-500';
            default: return 'border-gray-500';
        }
    }

    getPriorityClass(priority) {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-600 text-white';
            case 'HIGH': return 'bg-orange-600 text-white';
            case 'MEDIUM': return 'bg-yellow-600 text-black';
            default: return 'bg-gray-600 text-white';
        }
    }

    getSignificanceClass(significance) {
        if (significance.includes('PRIMARY')) return 'bg-red-600 text-white';
        if (significance.includes('CRITICAL')) return 'bg-orange-600 text-white';
        if (significance.includes('HIGH')) return 'bg-yellow-600 text-black';
        return 'bg-gray-600 text-white';
    }

    getEvidenceTypeIcon(type) {
        const icons = {
            'Disk Image': '<i class="bi bi-hdd"></i>',
            'Memory Dump': '<i class="bi bi-memory"></i>',
            'Network Capture': '<i class="bi bi-wifi"></i>',
            'Log Files': '<i class="bi bi-file-earmark-text"></i>'
        };
        return icons[type] || '📄';
    }

    showNotification(message, type = 'info') {
        // Use centralized toast manager
        if (window.toastManager) {
            window.toastManager.showToast(message, type);
        }
    }
}

export default InvestigationBriefingApp;