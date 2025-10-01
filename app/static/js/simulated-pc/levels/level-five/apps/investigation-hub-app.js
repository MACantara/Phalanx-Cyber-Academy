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
                            <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">Investigation Command Center</h2>
                            <p class="text-xs sm:text-sm text-gray-400">Digital Forensics Case: The Hunt for The Null</p>
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

                <!-- Main Dashboard -->
                <div class="flex-1 flex flex-col lg:flex-row min-h-0">
                    <!-- Mission Briefing Panel -->
                    <div class="w-full lg:w-1/3 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 p-3 sm:p-4 overflow-y-auto max-h-[50vh] lg:max-h-full">
                        <h3 class="text-base sm:text-lg lg:text-xl font-semibold mb-3 text-blue-300">Mission Briefing</h3>
                        
                        <!-- Case Summary -->
                        <div class="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg">
                            <h4 class="text-sm font-semibold text-red-300 mb-2">
                                <i class="bi bi-exclamation-triangle mr-2"></i>
                                CRITICAL PRIORITY
                            </h4>
                            <p class="text-xs sm:text-sm text-red-200 break-words">
                                Identify the cyber criminal known as "The Null" through forensic analysis of seized digital evidence.
                            </p>
                        </div>

                        <!-- Success Criteria -->
                        <div class="mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                            <h4 class="text-sm font-semibold text-blue-300 mb-2">Success Criteria</h4>
                            <ul class="text-xs sm:text-sm text-blue-200 space-y-1">
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-check-circle text-green-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Maintain evidence integrity (ISO/IEC 27037)</span>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-check-circle text-green-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Follow NIST SP 800-86 methodology</span>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-check-circle text-green-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Conclusively identify The Null</span>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <i class="bi bi-check-circle text-green-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="break-words">Generate compliant forensic report</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Standards Compliance -->
                        <div class="p-3 bg-green-900/30 border border-green-600 rounded-lg">
                            <h4 class="text-sm font-semibold text-green-300 mb-2">
                                <i class="bi bi-shield-check mr-2"></i>
                                Compliance Status
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

                    <!-- Objectives Panel -->
                    <div class="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <h3 class="text-base sm:text-lg lg:text-xl font-semibold text-blue-300 mb-2 sm:mb-0">Investigation Objectives</h3>
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
                        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                            <button id="analyze-evidence-btn" class="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center min-h-[60px] touch-manipulation">
                                <i class="bi bi-search text-xl mb-2 block"></i>
                                <span class="text-sm sm:text-base">Analyze Evidence</span>
                            </button>
                            <button id="view-progress-btn" class="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center min-h-[60px] touch-manipulation">
                                <i class="bi bi-graph-up text-xl mb-2 block"></i>
                                <span class="text-sm sm:text-base">View Progress</span>
                            </button>
                            <button id="build-report-btn" class="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-center disabled:bg-gray-600 min-h-[60px] touch-manipulation" disabled>
                                <i class="bi bi-file-earmark-text text-xl mb-2 block"></i>
                                <span class="text-sm sm:text-base">Build Report</span>
                            </button>
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
        const progressBtn = document.getElementById('view-progress-btn');
        const reportBtn = document.getElementById('build-report-btn');

        analyzeBtn?.addEventListener('click', () => this.openEvidenceViewer());
        progressBtn?.addEventListener('click', () => this.showDetailedProgress());
        reportBtn?.addEventListener('click', () => this.openReportBuilder());

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
                title: 'Establish Chain of Custody',
                description: 'Verify evidence integrity and document proper forensic handling per ISO/IEC 27037:2012',
                points: 100,
                priority: 'high',
                status: 'pending',
                steps: ['Verify evidence hashes', 'Document custody trail', 'Ensure integrity']
            },
            {
                id: 'obj_2',
                title: 'Analyze Digital Evidence',
                description: 'Systematically examine all evidence sources following NIST SP 800-86 methodology',
                points: 200,
                priority: 'critical',
                status: 'pending',
                steps: ['Examine disk image', 'Analyze memory dump', 'Review network logs']
            },
            {
                id: 'obj_3',
                title: 'Extract Identity Clues',
                description: 'Discover and document evidence pointing to The Null\'s real identity',
                points: 200,
                priority: 'critical', 
                status: 'pending',
                steps: ['Find personal information', 'Extract contact details', 'Correlate identity markers']
            },
            {
                id: 'obj_4',
                title: 'Build Forensic Report',
                description: 'Create comprehensive report documenting findings and conclusions',
                points: 150,
                priority: 'medium',
                status: 'pending',
                steps: ['Organize evidence', 'Document methodology', 'Present conclusions']
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
                this.markObjectiveProgress('obj_2', 50);
                break;
            case 'clue_discovered':
                this.markObjectiveProgress('obj_3', 67);
                break;
            case 'analysis_complete':
                this.completeObjective('obj_2');
                this.completeObjective('obj_3');
                break;
            case 'report_generated':
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
        if (this.completedObjectives.size >= 3) {
            this.emitForensicEvent('open_app', { appId: 'forensic-report' });
            this.showNotification('Opening Report Builder...', 'info');
        } else {
            this.showNotification('Complete evidence analysis before building report.', 'warning');
        }
    }

    showDetailedProgress() {
        const completed = this.completedObjectives.size;
        const total = this.objectives.length;
        const percentage = Math.round((completed / total) * 100);
        
        this.showNotification(`Investigation Progress: ${completed}/${total} objectives (${percentage}%) - Score: ${this.currentScore}/${this.maxScore}`, 'info', 4000);
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