/**
 * Investigation Hub Application - Level 5 (Streamlined & Responsive)
 * Central dashboard for tracking objectives and forensic progress
 */

import { ForensicAppBase } from './forensic-app-base.js';

export class InvestigationHubApp extends ForensicAppBase {
    constructor() {
        super('investigation-hub', 'Investigation Command Center', {
            width: 'responsive',
            height: 'responsive'
        });
        
        this.objectives = [];
        this.completedObjectives = new Set();
        this.currentScore = 0;
        this.maxScore = 650;
        this.investigationStatus = 'active';
    }

    createContent() {
        return `
            <div class="investigation-hub-container h-full flex flex-col bg-gray-900 text-white">
                <!-- Header -->
                <div class="p-3 sm:p-4 bg-gray-800 border-b border-gray-700">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div class="mb-2 sm:mb-0">
                            <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">Digital Detective Hub</h2>
                            <p class="text-xs sm:text-sm text-gray-400">Mission: Unmask "The Null" - Find Real Name, Email & Phone</p>
                        </div>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div class="text-xs sm:text-sm">
                                <span class="text-yellow-400">Score: </span>
                                <span id="current-score" class="text-white font-bold">${this.currentScore}</span>
                                <span class="text-gray-400">/${this.maxScore}</span>
                            </div>
                            <div id="case-status" class="px-2 py-1 text-xs font-semibold rounded ${this.getStatusColor()}">
                                ACTIVE INVESTIGATION
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab Navigation (Mobile) / Split Layout (Desktop) -->
                <div class="flex-1 flex flex-col min-h-0">
                    <!-- Tab Buttons (visible on mobile/tablet only) -->
                    <div class="lg:hidden flex border-b border-gray-700 bg-gray-800">
                        <button id="briefing-tab" class="flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 border-blue-500 text-blue-400 bg-gray-750">
                            <i class="bi bi-clipboard-data mr-2"></i>
                            Mission Briefing
                        </button>
                        <button id="objectives-tab" class="flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 border-transparent text-gray-400 hover:text-gray-300">
                            <i class="bi bi-list-task mr-2"></i>
                            Objectives
                        </button>
                    </div>

                    <!-- Content Area -->
                    <div class="flex-1 flex min-h-0">
                        <!-- Mission Briefing Panel -->
                        <div id="briefing-panel" class="w-full lg:w-1/3 bg-gray-800 lg:border-r border-gray-700 p-3 sm:p-4 overflow-y-auto">
                            <h3 class="hidden lg:block text-base sm:text-lg lg:text-xl font-semibold mb-3 text-blue-300">Mission Briefing</h3>
                        
                        <!-- Simple Mission -->
                        <div class="mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                            <h4 class="text-sm font-semibold text-blue-300 mb-2">
                                <i class="bi bi-target mr-2"></i>
                                YOUR MISSION
                            </h4>
                            <p class="text-xs sm:text-sm text-blue-200 break-words">
                                Find 3 pieces of identity information about "The Null": Real Name, Email Address, and Phone Number.
                            </p>
                        </div>

                        <!-- What You Need to Find -->
                        <div class="mb-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                            <h4 class="text-sm font-semibold text-green-300 mb-2">What You Need to Find</h4>
                            <ul class="text-xs sm:text-sm text-green-200 space-y-1">
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-person text-yellow-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Real Name: ? (Hidden in laptop files)</span>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-envelope text-yellow-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Email Address: ? (In memory dump)</span>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-phone text-yellow-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Phone Number: ? (In network logs)</span>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-trophy text-yellow-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Find all 3 → Submit Report → WIN!</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Simple Instructions -->
                        <div class="p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                            <h4 class="text-sm font-semibold text-purple-300 mb-2">
                                <i class="bi bi-lightbulb mr-2"></i>
                                How to Win
                            </h4>
                            <div class="space-y-1 text-xs">
                                <div class="flex items-center space-x-2">
                                    <i class="bi bi-1-circle text-purple-400"></i>
                                    <span class="text-purple-200">Open Evidence Viewer → Examine devices</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <i class="bi bi-2-circle text-purple-400"></i>
                                    <span class="text-purple-200">Find identity clues → Drag to Report</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <i class="bi bi-3-circle text-purple-400"></i>
                                    <span class="text-purple-200">All 3 found → Submit → Victory!</span>
                                </div>
                            </div>
                        </div>
                        </div>

                        <!-- Objectives Panel -->
                        <div id="objectives-panel" class="w-full lg:flex-1 bg-gray-900 p-3 sm:p-4 overflow-y-auto min-h-0 hidden lg:block">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                <h3 class="hidden lg:block text-base sm:text-lg lg:text-xl font-semibold text-blue-300 mb-2 sm:mb-0">Investigation Objectives</h3>
                                <div class="text-xs sm:text-sm lg:text-base text-gray-400">
                                    <span id="completed-count">0</span> of <span id="total-count">4</span> completed
                                </div>
                            </div>

                        <!-- Objectives List -->
                        <div id="objectives-list" class="space-y-3 sm:space-y-4 mb-6">
                            <!-- Objectives will be populated here -->
                        </div>

                        <!-- Progress Visualization -->
                        <div class="mt-6 p-4 bg-gray-800 rounded-lg">
                            <h4 class="text-sm sm:text-base lg:text-lg font-semibold mb-3 text-yellow-300">Investigation Progress</h4>
                            <div class="space-y-3">
                                <!-- Overall Progress -->
                                <div>
                                    <div class="flex justify-between text-xs sm:text-sm mb-1">
                                        <span class="text-gray-300">Overall Progress</span>
                                        <span id="progress-percentage" class="text-blue-400">0%</span>
                                    </div>
                                    <div class="bg-gray-700 rounded-full h-2 sm:h-3">
                                        <div id="progress-bar" class="bg-blue-400 rounded-full h-2 sm:h-3 transition-all duration-500" style="width: 0%"></div>
                                    </div>
                                </div>

                                <!-- Evidence Analysis Progress -->
                                <div>
                                    <div class="flex justify-between text-xs sm:text-sm mb-1">
                                        <span class="text-gray-300">Evidence Analyzed</span>
                                        <span id="evidence-percentage" class="text-green-400">0/3</span>
                                    </div>
                                    <div class="bg-gray-700 rounded-full h-2">
                                        <div id="evidence-bar" class="bg-green-400 rounded-full h-2 transition-all duration-500" style="width: 0%"></div>
                                    </div>
                                </div>

                                <!-- Score Progress -->
                                <div>
                                    <div class="flex justify-between text-xs sm:text-sm mb-1">
                                        <span class="text-gray-300">Score</span>
                                        <span id="score-percentage" class="text-yellow-400">0%</span>
                                    </div>
                                    <div class="bg-gray-700 rounded-full h-2">
                                        <div id="score-bar" class="bg-yellow-400 rounded-full h-2 transition-all duration-500" style="width: 0%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <button id="analyze-evidence-btn" class="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center min-h-[60px] touch-manipulation">
                                <i class="bi bi-search text-xl mb-2 block"></i>
                                <span class="text-sm sm:text-base">Find Identity Clues</span>
                            </button>
                            <button id="build-report-btn" class="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center min-h-[60px] touch-manipulation">
                                <i class="bi bi-file-earmark-text text-xl mb-2 block"></i>
                                <span class="text-sm sm:text-base">Submit Report</span>
                            </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Footer -->
                <div class="px-3 sm:px-4 py-2 bg-gray-800 border-t border-gray-700">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs">
                        <div class="mb-1 sm:mb-0">
                            <span class="text-gray-400">Investigation Time: </span>
                            <span id="investigation-time" class="text-green-400">00:00:00</span>
                        </div>
                        <div class="text-gray-400">
                            Case #CF-2024-0314-001 | Priority: CRITICAL
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initialize() {
        await super.initialize();
        this.loadObjectives();
        this.bindEvents();
        this.startInvestigationTimer();
        this.setupEventListeners();
    }

    bindEvents() {
        // Quick action buttons
        const analyzeBtn = document.getElementById('analyze-evidence-btn');
        const reportBtn = document.getElementById('build-report-btn');

        analyzeBtn?.addEventListener('click', () => this.openEvidenceViewer());
        reportBtn?.addEventListener('click', () => this.openReportBuilder());

        // Tab switching (mobile/tablet)
        const briefingTab = document.getElementById('briefing-tab');
        const objectivesTab = document.getElementById('objectives-tab');
        
        briefingTab?.addEventListener('click', () => this.switchToTab('briefing'));
        objectivesTab?.addEventListener('click', () => this.switchToTab('objectives'));

        // Objective interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.objective-item')) {
                const objectiveId = e.target.closest('.objective-item').dataset.objectiveId;
                this.showObjectiveDetails(objectiveId);
            }
        });
    }

    loadObjectives() {
        this.objectives = [
            {
                id: 'obj_1',
                title: 'Find Real Name',
                description: 'Search laptop files and browser data for The Null\'s real identity',
                points: 200,
                priority: 'critical',
                status: 'pending',
                steps: ['Check browser autofill', 'Search personal files', 'Look in documents']
            },
            {
                id: 'obj_2', 
                title: 'Find Email Address',
                description: 'Extract email address from memory dump or communications',
                points: 200,
                priority: 'critical',
                status: 'pending',
                steps: ['Analyze memory dump', 'Check email clients', 'Search process memory']
            },
            {
                id: 'obj_3',
                title: 'Find Phone Number',
                description: 'Locate phone number in network logs or contact data',
                points: 200,
                priority: 'critical',
                status: 'pending',
                steps: ['Check network traffic', 'Search contact lists', 'Find in communications']
            },
            {
                id: 'obj_4',
                title: 'Submit Final Report',
                description: 'Add all identity evidence to forensic report and submit',
                points: 50,
                priority: 'high',
                status: 'pending',
                steps: ['Drag clues to report', 'Verify all 3 pieces', 'Submit for victory']
            }
        ];

        this.renderObjectives();
        this.updateCounts();
    }

    renderObjectives() {
        const objectivesList = document.getElementById('objectives-list');
        if (!objectivesList) return;

        objectivesList.innerHTML = this.objectives.map(obj => `
            <div class="objective-item p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer" 
                 data-objective-id="${obj.id}">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <div class="flex items-start space-x-3 flex-1 min-w-0 mb-2 sm:mb-0">
                        <div class="mt-1 flex-shrink-0">
                            ${this.getStatusIcon(obj.status)}
                        </div>
                        <div class="min-w-0 flex-1">
                            <h4 class="text-sm sm:text-base font-semibold text-white mb-1 break-words">${obj.title}</h4>
                            <p class="text-xs sm:text-sm text-gray-300 break-words">${obj.description}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-1 flex-shrink-0">
                        <span class="px-2 py-1 text-xs font-semibold rounded ${this.getPriorityColor(obj.priority)}">
                            ${obj.priority.toUpperCase()}
                        </span>
                        <span class="text-xs text-gray-400">+${obj.points} pts</span>
                    </div>
                </div>
                
                <!-- Progress Steps -->
                <div class="mt-3 space-y-1">
                    ${obj.steps.map((step, index) => `
                        <div class="flex items-center space-x-2 text-xs">
                            <i class="bi bi-circle text-gray-500"></i>
                            <span class="text-gray-400 break-words">${step}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getStatusIcon(status) {
        const icons = {
            'pending': '<i class="bi bi-clock text-yellow-400"></i>',
            'active': '<i class="bi bi-play-circle text-blue-400"></i>',
            'completed': '<i class="bi bi-check-circle-fill text-green-400"></i>'
        };
        return icons[status] || icons.pending;
    }

    getPriorityColor(priority) {
        const colors = {
            'critical': 'bg-red-600 text-red-100',
            'high': 'bg-orange-600 text-orange-100',
            'medium': 'bg-yellow-600 text-yellow-100',
            'low': 'bg-green-600 text-green-100'
        };
        return colors[priority] || colors.medium;
    }

    getStatusColor() {
        return 'bg-green-600 text-green-100';
    }

    updateCounts() {
        const completedCount = document.getElementById('completed-count');
        const totalCount = document.getElementById('total-count');
        
        if (completedCount) completedCount.textContent = this.completedObjectives.size;
        if (totalCount) totalCount.textContent = this.objectives.length;
        
        this.updateProgress();
    }

    updateProgress() {
        const progressPercentage = Math.round((this.completedObjectives.size / this.objectives.length) * 100);
        const scorePercentage = Math.round((this.currentScore / this.maxScore) * 100);
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-percentage');
        if (progressBar && progressText) {
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `${progressPercentage}%`;
        }

        // Update score bar
        const scoreBar = document.getElementById('score-bar');
        const scoreText = document.getElementById('score-percentage');
        if (scoreBar && scoreText) {
            scoreBar.style.width = `${scorePercentage}%`;
            scoreText.textContent = `${scorePercentage}%`;
        }

        // Update current score display
        const currentScoreEl = document.getElementById('current-score');
        if (currentScoreEl) {
            currentScoreEl.textContent = this.currentScore;
        }
    }

    setupEventListeners() {
        // Listen for forensic events from other apps
        document.addEventListener('forensic-event', (e) => {
            this.handleForensicEvent(e.detail);
        });
    }

    handleForensicEvent(eventData) {
        const { eventType, details } = eventData;
        
        switch (eventType) {
            case 'evidence_analyzed':
                this.markObjectiveProgress('obj_1', 33);
                this.markObjectiveProgress('obj_2', 33);
                this.markObjectiveProgress('obj_3', 33);
                break;
            case 'clue_discovered':
                // Complete objectives based on clue type
                if (details.clue_type === 'identity') {
                    this.completeObjective('obj_1');
                } else if (details.clue_type === 'contact') {
                    // Check if it's email or phone based on clue content
                    if (details.clue && details.clue.toLowerCase().includes('email')) {
                        this.completeObjective('obj_2');
                    } else if (details.clue && details.clue.toLowerCase().includes('phone')) {
                        this.completeObjective('obj_3');
                    } else {
                        // Fallback: complete next available objective
                        if (!this.completedObjectives.has('obj_2')) {
                            this.completeObjective('obj_2');
                        } else if (!this.completedObjectives.has('obj_3')) {
                            this.completeObjective('obj_3');
                        }
                    }
                }
                break;
            case 'analysis_complete':
                // Ensure all identity clues objectives are completed
                this.completeObjective('obj_1');
                this.completeObjective('obj_2');
                this.completeObjective('obj_3');
                this.showNotification('🎉 Evidence analysis complete! All identity clues found. You can now build the forensic report.', 'success', 5000);
                break;
            case 'report_generated':
            case 'report_submitted':
                this.completeObjective('obj_4');
                break;
        }
    }

    completeObjective(objectiveId) {
        if (!this.completedObjectives.has(objectiveId)) {
            this.completedObjectives.add(objectiveId);
            
            const objective = this.objectives.find(obj => obj.id === objectiveId);
            if (objective) {
                objective.status = 'completed';
                this.currentScore += objective.points;
                this.showNotification(`Objective completed: ${objective.title} (+${objective.points} points)`, 'success');
            }
            
            this.renderObjectives();
            this.updateCounts();
            this.checkInvestigationComplete();
        }
    }

    markObjectiveProgress(objectiveId, progress) {
        const objective = this.objectives.find(obj => obj.id === objectiveId);
        if (objective && objective.status === 'pending') {
            objective.status = 'active';
            this.renderObjectives();
        }
    }

    checkInvestigationComplete() {
        if (this.completedObjectives.size >= this.objectives.length) {
            this.investigationStatus = 'complete';
            this.showNotification('Investigation complete! The Null has been identified.', 'success');
            
            // Enable report building
            const reportBtn = document.getElementById('build-report-btn');
            if (reportBtn) {
                reportBtn.disabled = false;
            }
        }
    }

    startInvestigationTimer() {
        const startTime = Date.now();
        const timerEl = document.getElementById('investigation-time');
        
        if (timerEl) {
            setInterval(() => {
                const elapsed = Date.now() - startTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
    }

    openEvidenceViewer() {
        this.emitForensicEvent('open_app', { appId: 'evidence-viewer' });
        this.showNotification('Opening Evidence Analysis...', 'info');
    }

    openReportBuilder() {
        // Check if evidence analysis is complete (stored in localStorage)
        const analysisComplete = localStorage.getItem('level5_evidence_analysis_complete');
        
        if (analysisComplete === 'true' || this.completedObjectives.size >= 2) {
            this.emitForensicEvent('open_app', { appId: 'forensic-report' });
            this.showNotification('Opening Forensic Report Builder...', 'info');
        } else {
            const completed = this.completedObjectives.size;
            this.showNotification(`Complete evidence analysis first. Progress: ${completed}/3 identity clues found.`, 'warning');
        }
    }

    showDetailedProgress() {
        const completed = this.completedObjectives.size;
        const total = this.objectives.length;
        const percentage = Math.round((completed / total) * 100);
        
        this.showNotification(`Investigation Progress: ${completed}/${total} objectives (${percentage}%) - Score: ${this.currentScore}/${this.maxScore}`, 'info', 4000);
    }

    switchToTab(tabName) {
        const briefingTab = document.getElementById('briefing-tab');
        const objectivesTab = document.getElementById('objectives-tab');
        const briefingPanel = document.getElementById('briefing-panel');
        const objectivesPanel = document.getElementById('objectives-panel');

        if (tabName === 'briefing') {
            // Activate briefing tab
            briefingTab?.classList.add('border-blue-500', 'text-blue-400', 'bg-gray-750');
            briefingTab?.classList.remove('border-transparent', 'text-gray-400');
            
            // Deactivate objectives tab
            objectivesTab?.classList.remove('border-blue-500', 'text-blue-400', 'bg-gray-750');
            objectivesTab?.classList.add('border-transparent', 'text-gray-400');
            
            // Show briefing panel, hide objectives panel
            briefingPanel?.classList.remove('hidden');
            objectivesPanel?.classList.add('hidden');
        } else if (tabName === 'objectives') {
            // Activate objectives tab
            objectivesTab?.classList.add('border-blue-500', 'text-blue-400', 'bg-gray-750');
            objectivesTab?.classList.remove('border-transparent', 'text-gray-400');
            
            // Deactivate briefing tab
            briefingTab?.classList.remove('border-blue-500', 'text-blue-400', 'bg-gray-750');
            briefingTab?.classList.add('border-transparent', 'text-gray-400');
            
            // Show objectives panel, hide briefing panel
            objectivesPanel?.classList.remove('hidden');
            briefingPanel?.classList.add('hidden');
        }
    }

    showObjectiveDetails(objectiveId) {
        const objective = this.objectives.find(obj => obj.id === objectiveId);
        if (objective) {
            this.showNotification(`${objective.title}: ${objective.description}`, 'info', 4000);
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
}

export default InvestigationHubApp;