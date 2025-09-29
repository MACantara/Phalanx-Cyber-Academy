/**
 * Level 5: Hunt for The Null - Investigation Progress Tracker
 * Static app element displaying current investigation progress at the top right
 * Tracks evidence analysis, objectives completion, and forensic workflow
 */

export class Level5InvestigationTracker {
    constructor() {
        this.id = 'level5-investigation-tracker';
        this.title = 'Investigation Progress';
        
        // Investigation state
        this.objectives = [];
        this.evidenceAnalyzed = new Set(); // Evidence IDs that have been analyzed
        this.objectivesCompleted = new Set(); // Objective IDs that have been completed
        this.currentObjectiveIndex = 0;
        this.isMinimized = false;
        this.investigationScore = 0;
        this.totalPossibleScore = 500;
        
        // Workflow tracking
        this.forensicActions = [];
        this.correctActions = [];
        this.incorrectActions = [];
        
        // DOM element
        this.element = null;
        
        // Load investigation data on construction
        this.loadInvestigationData();
        this.initializeEventListeners();
    }

    // Load investigation objectives and case data from API
    async loadInvestigationData() {
        try {
            const response = await fetch('/api/level5/investigation-objectives-data');
            if (!response.ok) {
                throw new Error(`Failed to load investigation data: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.data && data.data.investigation_objectives) {
                this.objectives = data.data.investigation_objectives.map(obj => ({
                    id: obj.id,
                    title: obj.title,
                    description: obj.description,
                    points: obj.points || 100,
                    critical: obj.critical || false,
                    required_evidence: obj.required_evidence || [],
                    validation_criteria: obj.validation_criteria || []
                }));
                
                // Calculate total possible score
                this.totalPossibleScore = this.objectives.reduce((total, obj) => total + obj.points, 0);
            } else {
                // Fallback objectives
                this.objectives = [
                    { id: 'obj_001', title: "Identify The Null's Identity", description: 'Determine the real identity of the hacker', points: 150, critical: true },
                    { id: 'obj_002', title: 'Reconstruct Attack Timeline', description: 'Create detailed timeline of the attack', points: 100, critical: true },
                    { id: 'obj_003', title: 'Document Malware Activities', description: 'Analyze and document malicious software', points: 100, critical: true },
                    { id: 'obj_004', title: 'Trace Network Communications', description: 'Map suspicious network activities', points: 75, critical: false },
                    { id: 'obj_005', title: 'Assess Data Compromise', description: 'Determine what data was accessed or stolen', points: 75, critical: false }
                ];
                this.totalPossibleScore = 500;
            }
            
            console.log('[InvestigationTracker] Loaded', this.objectives.length, 'objectives');
            this.updateContent();
        } catch (error) {
            console.error('[InvestigationTracker] Error loading investigation data:', error);
            // Fallback to loading message
            this.objectives = [{
                id: 'loading',
                title: 'Loading Investigation...',
                description: 'Initializing digital forensics investigation...',
                points: 0
            }];
            this.updateContent();
        }
    }

    // Initialize event listeners for forensic activities
    initializeEventListeners() {
        if (typeof window !== 'undefined') {
            // Listen for evidence analysis events
            window.addEventListener('forensic_evidence_analyzed', (event) => {
                this.trackForensicAction('evidence_analyzed', event.detail, true);
            });

            // Listen for evidence mounting events
            window.addEventListener('forensic_evidence_mounted', (event) => {
                this.trackForensicAction('evidence_mounted', event.detail, true);
            });

            // Listen for report generation events
            window.addEventListener('forensic_report_generated', (event) => {
                this.trackForensicAction('report_generated', event.detail, true);
                this.onInvestigationCompleted();
            });

            // Listen for objective completion events
            window.addEventListener('forensic_objective_completed', (event) => {
                this.completeObjective(event.detail.objectiveId, event.detail.score || 0);
            });

            // Listen for incorrect actions
            window.addEventListener('forensic_incorrect_action', (event) => {
                this.trackForensicAction(event.detail.action, event.detail, false);
            });
        }
    }

    // Create the static tracker element
    createElement() {
        this.element = document.createElement('div');
        this.element.id = 'level5-investigation-tracker-static';
        this.element.className = 'fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 backdrop-blur-sm';
        this.element.style.width = this.isMinimized ? '60px' : '350px';
        this.element.style.transition = 'width 0.3s ease';
        
        this.updateContent();
        return this.element;
    }

    // Create content HTML
    createContent() {
        if (this.isMinimized) {
            return `
                <div class="bg-gradient-to-r from-red-700 to-red-600 px-3 py-2 rounded cursor-pointer" 
                     onclick="window.level5InvestigationTracker?.toggleMinimize()">
                    <div class="text-white text-sm font-semibold flex items-center justify-center">
                        <i class="bi bi-search text-yellow-400"></i>
                    </div>
                </div>
            `;
        }

        const currentObjective = this.objectives[this.currentObjectiveIndex] || null;
        const progress = `${this.objectivesCompleted.size}/${this.objectives.length}`;
        const scoreProgress = `${this.investigationScore}/${this.totalPossibleScore}`;
        
        return `
            <div class="bg-gradient-to-r from-red-700 to-red-600 px-3 py-2 border-b border-gray-600 cursor-pointer"
                 onclick="window.level5InvestigationTracker?.toggleMinimize()">
                <div class="text-white text-xs font-semibold flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="bi bi-search text-yellow-400"></i>
                        <span>HUNT FOR THE NULL</span>
                    </div>
                    <div class="flex flex-col items-end space-y-1">
                        <div class="flex items-center space-x-2">
                            <span class="text-xs bg-red-800 px-2 py-1 rounded">${progress}</span>
                            <span class="text-xs bg-yellow-800 px-2 py-1 rounded">${scoreProgress}</span>
                            <i class="bi bi-chevron-up text-gray-300"></i>
                        </div>
                        <div class="w-20 bg-gray-600 rounded-full h-1">
                            <div class="bg-gradient-to-r from-red-400 to-yellow-400 h-1 rounded-full transition-all duration-500" 
                                 style="width: ${this.objectives.length > 0 ? (this.objectivesCompleted.size / this.objectives.length) * 100 : 0}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-3 text-white max-h-96 overflow-y-auto">
                <!-- Investigation Score -->
                <div class="mb-3 bg-gray-700 rounded p-2">
                    <div class="text-sm font-semibold text-yellow-300 mb-1 flex items-center">
                        <i class="bi bi-trophy mr-1"></i>
                        Investigation Score
                    </div>
                    <div class="text-lg font-bold text-yellow-400">${this.investigationScore} / ${this.totalPossibleScore}</div>
                    <div class="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div class="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                             style="width: ${this.totalPossibleScore > 0 ? (this.investigationScore / this.totalPossibleScore) * 100 : 0}%"></div>
                    </div>
                </div>

                <!-- Current Objective -->
                <div class="mb-3">
                    <div class="text-sm font-semibold text-red-300 mb-2">
                        <div class="flex items-center">
                            <i class="bi bi-bullseye mr-1"></i>
                            Current Objective
                        </div>
                    </div>
                    <!-- Objective Dropdown -->
                    <div class="mb-3">
                        <select onchange="window.level5InvestigationTracker?.selectObjective(parseInt(this.value))" 
                                class="w-full text-xs bg-gray-600 text-white rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-red-400 cursor-pointer"
                                value="${this.currentObjectiveIndex}">
                            ${this.objectives.map((objective, index) => `
                                <option value="${index}" ${index === this.currentObjectiveIndex ? 'selected' : ''}>
                                    ${this.objectivesCompleted.has(objective.id) ? '✓' : '○'} ${index + 1}. ${objective.title}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    ${currentObjective ? `
                        <div class="bg-gray-700 rounded p-3 ${this.objectivesCompleted.has(currentObjective.id) ? 'ring-2 ring-green-400 bg-green-900/20' : ''}">
                            <div class="flex items-center mb-2">
                                <div class="flex items-center mr-2">
                                    ${this.objectivesCompleted.has(currentObjective.id) ? 
                                        '<i class="bi bi-check-circle-fill text-green-400 text-lg"></i>' : 
                                        '<i class="bi bi-circle text-gray-500"></i>'
                                    }
                                </div>
                                <div class="text-xs font-semibold ${this.objectivesCompleted.has(currentObjective.id) ? 'text-green-300' : 'text-gray-300'}">${currentObjective.title}</div>
                                <div class="ml-auto text-xs ${currentObjective.critical ? 'text-red-400' : 'text-gray-400'}">
                                    ${currentObjective.points}pts ${currentObjective.critical ? '(Critical)' : ''}
                                </div>
                            </div>
                            <div class="text-sm leading-relaxed ${this.objectivesCompleted.has(currentObjective.id) ? 'text-gray-300 line-through opacity-75' : ''}">${currentObjective.description}</div>
                            ${this.objectivesCompleted.has(currentObjective.id) ? 
                                '<div class="mt-2 text-xs text-green-400 flex items-center"><i class="bi bi-trophy mr-1"></i>Objective completed!</div>' : 
                                ''
                            }
                        </div>
                    ` : `
                        <div class="bg-gray-700 rounded p-3 text-center text-gray-400">
                            <i class="bi bi-hourglass-split"></i>
                            <div>Loading investigation...</div>
                        </div>
                    `}
                </div>
                
                <!-- Evidence Analysis Status -->
                <div class="mb-3 border-t border-gray-600 pt-3">
                    <div class="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                        <i class="bi bi-shield-shaded text-green-400 mr-1"></i>
                        Evidence Analysis
                    </div>
                    <div class="text-xs text-gray-300">
                        <div class="flex justify-between">
                            <span>Analyzed:</span>
                            <span class="text-blue-400">${this.evidenceAnalyzed.size}/4 items</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-1 mt-1">
                            <div class="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full transition-all duration-500" 
                                 style="width: ${(this.evidenceAnalyzed.size / 4) * 100}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Forensic Workflow Status -->
                <div class="border-t border-gray-600 pt-3">
                    <div class="text-sm font-semibold text-purple-300 mb-2 flex items-center">
                        <i class="bi bi-diagram-3 text-purple-400 mr-1"></i>
                        Workflow Status
                    </div>
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between">
                            <span class="text-gray-300">Correct Actions:</span>
                            <span class="text-green-400">${this.correctActions.length}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Procedure Errors:</span>
                            <span class="text-red-400">${this.incorrectActions.length}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Compliance Score:</span>
                            <span class="text-yellow-400">${this.calculateComplianceScore()}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Update content of the element
    updateContent() {
        if (this.element) {
            this.element.innerHTML = this.createContent();
            this.element.style.width = this.isMinimized ? '60px' : '350px';
        }
    }

    // Append to desktop (called by application launcher)
    appendTo(container) {
        if (!container) {
            console.error('[InvestigationTracker] No container provided, using document.body');
            container = document.body;
        }
        
        if (!this.element) {
            this.createElement();
        }
        
        try {
            container.appendChild(this.element);
            console.log('[InvestigationTracker] Tracker element appended to container');
        } catch (error) {
            console.error('[InvestigationTracker] Failed to append tracker element:', error);
            // Fallback to document.body
            document.body.appendChild(this.element);
        }
        
        // Make globally accessible for onclick handlers
        window.level5InvestigationTracker = this;
    }

    // Remove from DOM
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clean up global reference
        if (window.level5InvestigationTracker === this) {
            delete window.level5InvestigationTracker;
        }
    }

    // Objective navigation
    selectObjective(index) {
        if (index >= 0 && index < this.objectives.length) {
            this.currentObjectiveIndex = index;
            this.updateContent();
            console.log('[InvestigationTracker] Selected objective', index + 1);
        }
    }

    // Complete an objective
    completeObjective(objectiveId, score = 0) {
        if (!this.objectivesCompleted.has(objectiveId)) {
            this.objectivesCompleted.add(objectiveId);
            this.investigationScore += score;
            
            const objective = this.objectives.find(obj => obj.id === objectiveId);
            if (objective) {
                this.trackForensicAction('objective_completed', { objectiveId, title: objective.title, score }, true);
                this.showNotification(`🎯 Objective completed: ${objective.title} (+${score} pts)`, 'success');
            }
            
            this.updateContent();
            
            // Move to next incomplete objective
            const nextIncompleteIndex = this.objectives.findIndex((obj, index) => 
                index > this.currentObjectiveIndex && !this.objectivesCompleted.has(obj.id)
            );
            
            if (nextIncompleteIndex !== -1) {
                this.currentObjectiveIndex = nextIncompleteIndex;
                this.updateContent();
            }
            
            console.log('[InvestigationTracker] Objective completed:', objectiveId, 'Score:', score);
        }
    }

    // Track forensic actions for workflow analysis
    trackForensicAction(action, details, isCorrect) {
        const actionRecord = {
            action,
            details,
            timestamp: new Date().toISOString(),
            isCorrect
        };
        
        this.forensicActions.push(actionRecord);
        
        if (isCorrect) {
            this.correctActions.push(actionRecord);
        } else {
            this.incorrectActions.push(actionRecord);
        }
        
        this.updateContent();
        console.log('[InvestigationTracker] Forensic action tracked:', action, isCorrect ? 'CORRECT' : 'INCORRECT');
    }

    // Mark evidence as analyzed
    markEvidenceAnalyzed(evidenceId) {
        if (!this.evidenceAnalyzed.has(evidenceId)) {
            this.evidenceAnalyzed.add(evidenceId);
            this.trackForensicAction('evidence_analyzed', { evidenceId }, true);
            this.updateContent();
            console.log('[InvestigationTracker] Evidence analyzed:', evidenceId);
        }
    }

    // Calculate compliance score
    calculateComplianceScore() {
        const totalActions = this.forensicActions.length;
        if (totalActions === 0) return 100;
        return Math.round((this.correctActions.length / totalActions) * 100);
    }

    // Toggle minimize/maximize
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.updateContent();
    }

    // Show notification popup
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-600 border-green-500 text-green-100',
            error: 'bg-red-600 border-red-500 text-red-100',
            warning: 'bg-yellow-600 border-yellow-500 text-yellow-100',
            info: 'bg-blue-600 border-blue-500 text-blue-100'
        };

        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} border px-4 py-3 rounded shadow-lg z-50 max-w-sm transition-all duration-300 -translate-y-full opacity-0`;
        notification.innerHTML = `
            <div class="flex items-start space-x-2">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'} flex-shrink-0 mt-0.5"></i>
                <span class="text-sm font-medium whitespace-pre-line">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.remove('-translate-y-full', 'opacity-0');
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.add('-translate-y-full', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // Handle investigation completion
    onInvestigationCompleted() {
        console.log('[InvestigationTracker] Investigation completed!');
        
        // Calculate final score
        const completionBonus = this.objectivesCompleted.size === this.objectives.length ? 100 : 0;
        const complianceBonus = Math.round((this.calculateComplianceScore() / 100) * 50);
        this.investigationScore += completionBonus + complianceBonus;
        
        // Show completion notification
        this.showNotification('🎉 INVESTIGATION COMPLETED! 🎉\nPreparing forensic report analysis...', 'success', 5000);
        
        // Dispatch completion event
        try {
            window.dispatchEvent(new CustomEvent('level5-investigation-completed', {
                detail: {
                    score: this.investigationScore,
                    totalPossible: this.totalPossibleScore,
                    objectivesCompleted: Array.from(this.objectivesCompleted),
                    evidenceAnalyzed: Array.from(this.evidenceAnalyzed),
                    correctActions: this.correctActions,
                    incorrectActions: this.incorrectActions,
                    complianceScore: this.calculateComplianceScore(),
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error('[InvestigationTracker] Error dispatching completion event:', error);
        }
        
        // Show completion dialogue after delay
        setTimeout(() => {
            this.showCompletionDialogue();
        }, 3000);
    }

    // Show the completion dialogue
    async showCompletionDialogue() {
        try {
            // Import the completion dialogue
            const { Level5CompletionDialogue } = await import('../dialogues/level5-completion-dialogue.js');
            
            // Get desktop reference
            let desktop = window.simulatedPC?.desktop || window.desktop || {
                element: document.body,
                addWindow: (window) => document.body.appendChild(window.element),
                removeWindow: (window) => window.element?.parentNode?.removeChild(window.element)
            };
            
            // Start the completion dialogue
            Level5CompletionDialogue.startLevel5CompletionDialogue(desktop, this);
            console.log('[InvestigationTracker] Completion dialogue started successfully');
            
        } catch (error) {
            console.error('[InvestigationTracker] Failed to load completion dialogue:', error);
            
            // Fallback: Show summary directly
            try {
                const { Level5WorkflowSummary } = await import('../components/level5-workflow-summary.js');
                const stats = {
                    score: this.investigationScore,
                    totalPossible: this.totalPossibleScore,
                    objectivesCompleted: this.objectivesCompleted.size,
                    evidenceAnalyzed: this.evidenceAnalyzed.size,
                    correctActions: this.correctActions.length,
                    incorrectActions: this.incorrectActions.length,
                    complianceScore: this.calculateComplianceScore()
                };
                Level5WorkflowSummary.createAndShow(this, stats);
            } catch (summaryError) {
                console.error('[InvestigationTracker] Summary fallback failed:', summaryError);
                this.showNotification('Investigation completed! Redirecting...', 'success', 5000);
                setTimeout(() => window.location.href = '/levels', 5000);
            }
        }
    }

    // Get current status for API
    getStatus() {
        return {
            investigationScore: this.investigationScore,
            objectivesCompleted: Array.from(this.objectivesCompleted),
            evidenceAnalyzed: Array.from(this.evidenceAnalyzed),
            currentObjectiveIndex: this.currentObjectiveIndex,
            correctActions: this.correctActions.length,
            incorrectActions: this.incorrectActions.length,
            complianceScore: this.calculateComplianceScore(),
            isMinimized: this.isMinimized
        };
    }

    // Initialize the tracker
    initialize() {
        console.log('[InvestigationTracker] Investigation tracker initialized');
    }

    // Cleanup when tracker is destroyed
    cleanup() {
        this.remove();
    }
}

// Export factory function
export function createLevel5InvestigationTracker() {
    return new Level5InvestigationTracker();
}