/**
 * Level3SessionSummary - Handles displaying session summary and performance metrics for Level 3: Malware Mayhem
 * Integrates with XP system and session tracking
 */
export class Level3SessionSummary {
    /**
     * Create a new Level3SessionSummary instance
     * @param {Object} timer - Reference to the Level 3 timer instance
     */
    constructor(timer) {
        this.timer = timer;
        this.sessionData = {
            startTime: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            levelId: 3,
            sessionId: this.getActiveSessionId(), // Use existing session
            totalSessions: 1
        };

        // Performance tracking
        this.stageCompletionTimes = {};
        this.totalActions = 0;
        this.accurateActions = 0;
        this.stagesCompleted = [];
    }

    /**
     * Get active session ID from storage
     */
    getActiveSessionId() {
        const sessionId = localStorage.getItem('cyberquest_active_session_id') ||
                         sessionStorage.getItem('active_session_id') ||
                         window.currentSessionId;
        
        if (sessionId) {
            const numericSessionId = parseInt(sessionId);
            if (!isNaN(numericSessionId)) {
                console.log('[Level3SessionSummary] Using existing session:', numericSessionId);
                return numericSessionId;
            }
        }
        
        console.warn('[Level3SessionSummary] No active session found');
        return null;
    }

    /**
     * Record stage completion
     */
    recordStageCompletion(stageName, timeSpent) {
        this.stageCompletionTimes[stageName] = timeSpent;
        if (!this.stagesCompleted.includes(stageName)) {
            this.stagesCompleted.push(stageName);
        }
        console.log(`[Level3SessionSummary] Stage completed: ${stageName} in ${timeSpent}s`);
    }

    /**
     * Record an action (process kill, malware action, file decryption)
     */
    recordAction(accurate = true) {
        this.totalActions++;
        if (accurate) {
            this.accurateActions++;
        }
    }

    /**
     * Calculate final score based on comprehensive performance metrics
     */
    calculateScore() {
        const timerStatus = this.timer.getStatus();
        
        // Time Performance (25 points max)
        // Reward faster completion with more points
        const timeUsed = (2 * 60) - timerStatus.timeRemaining;
        const timeEfficiency = Math.max(0, (timerStatus.timeRemaining / (2 * 60))); // 0-1 scale
        const timeBonus = timeEfficiency * 25; // Up to 25 points for speed
        
        // Accuracy Performance (25 points max)
        // Reward accurate actions (correct process kills, malware identification, file recovery)
        const accuracy = this.totalActions > 0 ? (this.accurateActions / this.totalActions) : 1;
        const accuracyBonus = accuracy * 25; // Up to 25 points for accuracy
        
        // Reputation Protection (25 points max)
        // Reward minimizing reputation damage
        const reputationHealth = Math.max(0, (100 - timerStatus.reputationDamage) / 100);
        const reputationBonus = reputationHealth * 25; // Up to 25 points for reputation protection
        
        // Financial Management (15 points max)
        // Reward minimizing financial costs
        const financialHealth = Math.max(0, (100000 - timerStatus.financialDamage) / 100000);
        const financialBonus = financialHealth * 15; // Up to 15 points for cost management
        
        // Stage Completion Bonus (10 points max)
        // Reward completing both stages (process monitor, malware scanner)
        const stageCompletionBonus = (this.stagesCompleted.length / 2) * 10; // Up to 10 points for completion
        
        const totalScore = Math.round(timeBonus + accuracyBonus + reputationBonus + financialBonus + stageCompletionBonus);
        
        // Log performance breakdown for debugging
        console.log('[Level3SessionSummary] Performance Breakdown:', {
            timeBonus: Math.round(timeBonus),
            accuracyBonus: Math.round(accuracyBonus),
            reputationBonus: Math.round(reputationBonus),
            financialBonus: Math.round(financialBonus),
            stageCompletionBonus: Math.round(stageCompletionBonus),
            totalScore: totalScore,
            metrics: {
                timeEfficiency: Math.round(timeEfficiency * 100) + '%',
                accuracy: Math.round(accuracy * 100) + '%',
                reputationHealth: Math.round(reputationHealth * 100) + '%',
                financialHealth: Math.round(financialHealth * 100) + '%',
                stagesCompleted: this.stagesCompleted.length + '/2'
            }
        });
        
        return Math.max(0, Math.min(100, totalScore)); // Clamp score between 0-100
    }

    /**
     * End the session and award XP based on comprehensive performance using centralized utilities
     */
    async endSession() {
        if (!this.sessionData.sessionId) {
            console.warn('[Level3SessionSummary] No session ID, cannot end session');
            return null;
        }

        try {
            console.log('[Level3SessionSummary] Ending session with centralized system');

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            // First, attach to the existing session that was started externally
            const startTime = parseInt(localStorage.getItem('cyberquest_level_3_start_time') || Date.now());
            progressManager.attachToExistingSession(
                this.sessionData.sessionId,
                3, // Level ID
                'Malware-Mayhem', // Level name
                'intermediate', // Difficulty
                startTime
            );

            // Calculate comprehensive performance metrics
            const score = this.calculateScore();
            const timerStatus = this.timer.getStatus();
            const timeSpent = (15 * 60) - timerStatus.timeRemaining; // Time used in seconds
            const accuracy = this.totalActions > 0 ? Math.round((this.accurateActions / this.totalActions) * 100) : 100;
            
            // Complete level using centralized system
            const sessionResult = await progressManager.completeLevel(score, {
                accuracy: accuracy,
                stagesCompleted: this.stagesCompleted.length,
                totalStages: 2,
                reputationDamage: timerStatus.reputationDamage,
                financialDamage: timerStatus.financialDamage,
                timeEfficiency: Math.round((timerStatus.timeRemaining / (15 * 60)) * 100),
                totalActions: this.totalActions,
                accurateActions: this.accurateActions,
                timeSpent: timeSpent,
                stageCompletionTimes: this.stageCompletionTimes,
                completionTime: Date.now() - startTime
            });

            if (sessionResult) {
                console.log('[Level3SessionSummary] Session ended successfully with centralized system:', {
                    xp_awarded: sessionResult.xp ? sessionResult.xp.xp_awarded : 'unknown',
                    score: score,
                    session: sessionResult.session
                });
                
                // Clear session data
                localStorage.removeItem('cyberquest_active_session_id');
                sessionStorage.removeItem('active_session_id');
                window.currentSessionId = null;

                // Show XP earned notification
                if (window.ToastManager && sessionResult.xp && sessionResult.xp.xp_awarded) {
                    window.ToastManager.showToast(
                        `Level completed! You earned ${sessionResult.xp.xp_awarded} XP!`, 
                        'success'
                    );
                } else if (window.ToastManager && sessionResult.session && sessionResult.session.xp_awarded) {
                    window.ToastManager.showToast(
                        `Level completed! You earned ${sessionResult.session.xp_awarded} XP!`, 
                        'success'
                    );
                }
                
                return sessionResult;
            } else {
                console.error('[Level3SessionSummary] Centralized session end failed: no result returned');
            }
        } catch (error) {
            console.error('[Level3SessionSummary] Error ending session with centralized system:', error);
        }
    }

    /**
     * Show comprehensive session summary modal
     */
    async showSessionSummary() {
        // Timer should already be stopped by completion dialogue
        // Just check if timer is still running and log it
        if (this.timer && this.timer.isRunning) {
            console.warn('[Level3SessionSummary] Timer still running when showing summary - this should have been stopped by completion dialogue');
        }
        
        // Show loading modal first for better UX
        const loadingModal = this.createLoadingModal();
        document.body.appendChild(loadingModal);
        
        try {
            // End the session and get XP data in background
            const sessionResultPromise = this.endSession();
            
            // Get timer status and calculate scores (synchronous, fast)
            const timerStatus = this.timer.getStatus();
            const score = this.calculateScore();
            const accuracy = this.totalActions > 0 ? Math.round((this.accurateActions / this.totalActions) * 100) : 100;
            const totalTimeSpent = (15 * 60) - timerStatus.timeRemaining;
            const levelCompleted = score >= 70;
            
            // Wait for session result
            const sessionResult = await sessionResultPromise;
            
            // Remove loading modal
            loadingModal.remove();
            
            // Create and show the actual summary modal
            const modal = this.createSummaryModal(sessionResult, score, accuracy, totalTimeSpent, timerStatus, levelCompleted);
            document.body.appendChild(modal);
            
            // Bind events
            this.bindSummaryEvents(modal, levelCompleted);
            
        } catch (error) {
            console.error('[Level3SessionSummary] Error showing summary:', error);
            loadingModal.remove();
            // Show error state
            this.showErrorModal();
        }
    }

    /**
     * Create loading modal
     */
    createLoadingModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p class="text-white text-lg">Calculating Performance...</p>
                <p class="text-gray-400 text-sm mt-2">Processing session data and XP rewards</p>
            </div>
        `;
        return modal;
    }

    /**
     * Create summary modal (separated for better performance)
     */
    createSummaryModal(sessionResult, score, accuracy, totalTimeSpent, timerStatus, levelCompleted) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        
        const accuracyClass = this.getAccuracyClass(accuracy);
        
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-t-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="bi bi-shield-check text-3xl text-white"></i>
                            <div>
                                <h2 class="text-2xl font-bold text-white">Level 3: Malware Mayhem Complete!</h2>
                                <p class="text-purple-100">Cybersecurity Crisis Response Assessment</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-bold text-white">${score}%</div>
                            <div class="text-purple-100 text-sm">Final Score</div>
                        </div>
                    </div>
                </div>

                <!-- Performance Overview -->
                <div class="p-6 bg-gray-800 border-b border-gray-700">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-yellow-400">${this.formatTime(totalTimeSpent)}</div>
                            <div class="text-gray-400 text-sm">Time Used</div>
                            <div class="text-xs text-gray-400">${this.formatTime(timerStatus.timeRemaining)} remaining</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold ${accuracyClass}">${accuracy}%</div>
                            <div class="text-gray-400 text-sm">Accuracy</div>
                            <div class="text-xs text-gray-400">${this.accurateActions}/${this.totalActions} actions</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold ${this.getReputationColor(100 - timerStatus.reputationDamage)}">${100 - timerStatus.reputationDamage}%</div>
                            <div class="text-gray-400 text-sm">Reputation</div>
                            <div class="text-xs text-gray-400">${timerStatus.reputationDamage}% damage taken</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold ${this.getFinancialColor(timerStatus.financialDamage)}">${this.formatMoney(1000000 - timerStatus.financialDamage)}</div>
                            <div class="text-gray-400 text-sm">Budget Saved</div>
                            <div class="text-xs text-gray-400">${this.formatMoney(timerStatus.financialDamage)} spent</div>
                        </div>
                    </div>
                </div>

                <!-- XP Reward Section -->
                ${sessionResult ? `
                    <div class="p-6 bg-gradient-to-r from-green-800 to-green-700 border-b border-gray-700">
                        <div class="text-center">
                            <div class="flex items-center justify-center mb-4">
                                <i class="bi bi-trophy-fill text-4xl text-yellow-400 mr-3"></i>
                                <div>
                                    <h3 class="text-2xl font-bold text-white">Performance-Based XP Awarded!</h3>
                                    <p class="text-green-100">Your reward reflects speed, accuracy, and crisis management</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-3xl font-bold text-yellow-400">${(sessionResult.xp && sessionResult.xp.xp_awarded) || (sessionResult.session && sessionResult.session.xp_awarded) || 0}</div>
                                    <div class="text-green-100 text-sm">Total XP Earned</div>
                                </div>
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-2xl font-bold text-white">${score}/100</div>
                                    <div class="text-green-100 text-sm">Performance Score</div>
                                </div>
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-2xl font-bold text-white">${this.stagesCompleted.length}/2</div>
                                    <div class="text-green-100 text-sm">Stages Completed</div>
                                </div>
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-2xl font-bold text-white">${Math.round((timerStatus.timeRemaining / (15 * 60)) * 100)}%</div>
                                    <div class="text-green-100 text-sm">Time Efficiency</div>
                                </div>
                            </div>
                            <div class="mt-4 text-center">
                                <p class="text-green-100 text-sm">
                                    XP factors: Time Efficiency (25%), Accuracy (25%), Reputation (25%), Budget (15%), Completion (10%)
                                </p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Stage Analysis -->
                <div class="p-6 bg-gray-800 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="bi bi-list-check text-blue-400 mr-2"></i>
                        Stage Breakdown
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.generateStageAnalysis()}
                    </div>
                </div>

                <!-- Performance Insights -->
                <div class="p-6 bg-gray-800 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="bi bi-graph-up text-purple-400 mr-2"></i>
                        Performance Analysis
                    </h3>
                    ${this.generatePerformanceInsights(score, accuracy, timerStatus)}
                </div>

                <!-- Action Buttons -->
                <div class="p-6 bg-gray-800 rounded-b-lg">
                    <div class="flex flex-col md:flex-row gap-3 justify-center">
                        ${levelCompleted ? `
                            <button id="continue-btn" class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center">
                                <i class="bi bi-arrow-right mr-2"></i>
                                Continue to Level 4
                            </button>
                        ` : `
                            <button id="retry-btn" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center">
                                <i class="bi bi-arrow-clockwise mr-2"></i>
                                Retry Level 3
                            </button>
                        `}
                        <button id="levels-btn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center">
                            <i class="bi bi-grid mr-2"></i>
                            Back to Levels
                        </button>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Show error modal if session summary fails
     */
    showErrorModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-8 border border-red-700 text-center max-w-md">
                <i class="bi bi-exclamation-triangle-fill text-5xl text-red-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">Error Loading Summary</h2>
                <p class="text-gray-300 mb-6">There was an issue loading your performance data.</p>
                <button id="retry-summary-btn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
                    Try Again
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#retry-summary-btn').addEventListener('click', () => {
            modal.remove();
            this.showSessionSummary();
        });
    }

    /**
     * Generate stage analysis
     */
    generateStageAnalysis() {
        const stages = [
            { name: 'Process Monitor', key: 'process-monitor', icon: 'bi-cpu', description: 'Eliminate malicious processes' },
            { name: 'Malware Scanner', key: 'malware-scanner', icon: 'bi-shield-exclamation', description: 'Scan and quarantine threats' }
        ];

        return stages.map(stage => {
            const completed = this.stagesCompleted.includes(stage.key);
            const timeSpent = this.stageCompletionTimes[stage.key] || 0;
            
            return `
                <div class="bg-gray-700 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <i class="${stage.icon} text-lg ${completed ? 'text-green-400' : 'text-gray-400'} mr-2"></i>
                            <span class="font-semibold text-white">${stage.name}</span>
                        </div>
                        ${completed ? '<i class="bi bi-check-circle-fill text-green-400"></i>' : '<i class="bi bi-circle text-gray-400"></i>'}
                    </div>
                    <p class="text-sm text-gray-400 mb-2">${stage.description}</p>
                    <div class="text-xs text-gray-400">
                        ${completed ? `Completed in ${this.formatTime(timeSpent)}` : 'Not completed'}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Generate comprehensive performance insights based on new scoring system
     */
    generatePerformanceInsights(score, accuracy, timerStatus) {
        const insights = [];
        
        // Time Performance Analysis
        const timeUsed = (15 * 60) - timerStatus.timeRemaining;
        const timeEfficiency = (timerStatus.timeRemaining / (15 * 60)) * 100;
        
        if (timeEfficiency > 50) {
            insights.push({ 
                icon: 'bi-lightning-fill', 
                color: 'text-yellow-400', 
                text: `Outstanding speed! Completed with ${Math.round(timeEfficiency)}% time remaining - crucial for incident response.` 
            });
        } else if (timeEfficiency > 25) {
            insights.push({ 
                icon: 'bi-clock-fill', 
                color: 'text-blue-400', 
                text: `Good time management with ${Math.round(timeEfficiency)}% time remaining.` 
            });
        } else if (timeEfficiency > 0) {
            insights.push({ 
                icon: 'bi-hourglass-split', 
                color: 'text-orange-400', 
                text: 'Cutting it close! In real incidents, faster response prevents more damage.' 
            });
        } else {
            insights.push({ 
                icon: 'bi-exclamation-triangle-fill', 
                color: 'text-red-400', 
                text: 'Time critical! Real incidents require faster response to prevent escalation.' 
            });
        }
        
        // Accuracy Performance Analysis
        if (accuracy >= 90) {
            insights.push({ 
                icon: 'bi-bullseye', 
                color: 'text-green-400', 
                text: `Exceptional precision! ${accuracy}% accuracy shows expert-level threat identification.` 
            });
        } else if (accuracy >= 75) {
            insights.push({ 
                icon: 'bi-check-circle-fill', 
                color: 'text-blue-400', 
                text: `Solid accuracy at ${accuracy}% - good threat assessment skills.` 
            });
        } else if (accuracy >= 60) {
            insights.push({ 
                icon: 'bi-exclamation-circle', 
                color: 'text-orange-400', 
                text: `${accuracy}% accuracy - practice identifying malicious processes and files more carefully.` 
            });
        } else {
            insights.push({ 
                icon: 'bi-x-circle-fill', 
                color: 'text-red-400', 
                text: `Low accuracy (${accuracy}%) - review threat indicators and take more time to analyze.` 
            });
        }
        
        // Stage Completion Analysis
        const stagesCompleted = this.stagesCompleted.length;
        if (stagesCompleted === 2) {
            insights.push({ 
                icon: 'bi-trophy-fill', 
                color: 'text-yellow-400', 
                text: 'Perfect execution! Completed both critical response stages successfully.' 
            });
        } else if (stagesCompleted === 1) {
            insights.push({ 
                icon: 'bi-check2-square', 
                color: 'text-blue-400', 
                text: 'Partial response - completed 1/2 stages. Full incident response requires both stages.' 
            });
        } else {
            insights.push({ 
                icon: 'bi-x-square-fill', 
                color: 'text-red-400', 
                text: 'No stages completed - incident response requires systematic approach to all threats.' 
            });
        }
        
        // Reputation Protection Analysis
        if (timerStatus.reputationDamage < 20) {
            insights.push({ 
                icon: 'bi-shield-fill-check', 
                color: 'text-green-400', 
                text: `Outstanding reputation protection! Only ${timerStatus.reputationDamage}% damage taken.` 
            });
        } else if (timerStatus.reputationDamage < 50) {
            insights.push({ 
                icon: 'bi-shield-check', 
                color: 'text-blue-400', 
                text: `Acceptable reputation management with ${timerStatus.reputationDamage}% damage.` 
            });
        } else {
            insights.push({ 
                icon: 'bi-shield-exclamation', 
                color: 'text-red-400', 
                text: `High reputation damage (${timerStatus.reputationDamage}%) - faster response crucial for organization trust.` 
            });
        }

        // Financial Impact Analysis
        const financialPercentage = Math.round((timerStatus.financialDamage / 1000000) * 100);
        if (financialPercentage < 20) {
            insights.push({ 
                icon: 'bi-piggy-bank-fill', 
                color: 'text-green-400', 
                text: `Excellent cost containment! Only ${financialPercentage}% of budget used for incident response.` 
            });
        } else if (financialPercentage < 50) {
            insights.push({ 
                icon: 'bi-cash-stack', 
                color: 'text-blue-400', 
                text: `Reasonable cost management with ${financialPercentage}% budget impact.` 
            });
        } else {
            insights.push({ 
                icon: 'bi-exclamation-diamond-fill', 
                color: 'text-red-400', 
                text: `High financial costs (${financialPercentage}% of budget) - quicker containment crucial for budget protection.` 
            });
        }

        return `
            <div class="grid grid-cols-1 gap-3">
                ${insights.map(insight => `
                    <div class="flex items-start p-3 bg-gray-700 rounded-lg">
                        <i class="${insight.icon} ${insight.color} text-xl mr-3 mt-0.5"></i>
                        <span class="text-gray-200">${insight.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Bind events for summary modal
     */
    bindSummaryEvents(modal, levelCompleted) {
        const continueBtn = modal.querySelector('#continue-btn');
        const retryBtn = modal.querySelector('#retry-btn');
        const levelsBtn = modal.querySelector('#levels-btn');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                modal.remove(); // Close the summary modal first
                this.continueToLevel4();
            });
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                modal.remove(); // Close the summary modal first
                this.retryLevel3();
            });
        }
        
        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => {
                modal.remove(); // Close the summary modal first
                this.showShutdownSequenceAndNavigate();
            });
        }

        // Close modal on background click - navigate back to levels
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.showShutdownSequenceAndNavigate();
            }
        });
    }

    /**
     * Action handlers
     */
    async continueToLevel4() {
        // Mark Level 3 as completed and set current level to 4
        localStorage.setItem('cyberquest_level_3_completed', 'true');
        localStorage.setItem('cyberquest_current_level', '4');
        
        // Show shutdown sequence then navigate to Level 4
        await this.showShutdownSequenceAndNavigateToLevel4();
    }

    async retryLevel3() {
        try {
            console.log('[Level3SessionSummary] Starting retry with centralized session management');

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            // Start new session using centralized system
            const sessionResult = await progressManager.startLevel({
                levelId: 3,
                sessionName: 'Malware Mayhem (Retry)',
                resetProgress: true
            });

            if (sessionResult.success) {
                console.log('[Level3SessionSummary] New retry session started with centralized system:', sessionResult);
                
                // Set new session ID
                localStorage.setItem('cyberquest_active_session_id', sessionResult.session_id);
                window.currentSessionId = sessionResult.session_id;
                
                // Reload the level
                window.location.reload();
            } else {
                console.error('[Level3SessionSummary] Failed to start retry session:', sessionResult.error);
                // Fallback to simple reload
                window.location.reload();
            }
        } catch (error) {
            console.error('[Level3SessionSummary] Error starting retry with centralized system:', error);
            // Fallback to simple reload
            window.location.reload();
        }
    }

    async showShutdownSequenceAndNavigateToLevel4() {
        try {
            const { ShutdownSequence } = await import('../../shutdown-sequence.js');
            const shutdownOverlay = document.createElement('div');
            shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
            shutdownOverlay.style.zIndex = '9999';
            document.body.appendChild(shutdownOverlay);
            
            await ShutdownSequence.runShutdown(shutdownOverlay);
            
            // Navigate to Level 4
            window.location.href = '/levels/4/start?autostart=true';
        } catch (error) {
            console.error('Failed to run shutdown sequence:', error);
            setTimeout(() => {
                window.location.href = '/levels/4/start?autostart=true';
            }, 1000);
        }
    }

    async showShutdownSequenceAndNavigate() {
        try {
            const { ShutdownSequence } = await import('../../shutdown-sequence.js');
            const shutdownOverlay = document.createElement('div');
            shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
            shutdownOverlay.style.zIndex = '9999';
            document.body.appendChild(shutdownOverlay);
            
            await ShutdownSequence.runShutdown(shutdownOverlay);
            this.navigateToLevelsOverview();
        } catch (error) {
            console.error('Failed to run shutdown sequence:', error);
            setTimeout(() => this.navigateToLevelsOverview(), 1000);
        }
    }

    navigateToLevelsOverview() {
        window.location.href = '/levels';
    }

    /**
     * Utility methods
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatMoney(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toLocaleString()}`;
    }

    getAccuracyClass(accuracy) {
        if (accuracy >= 90) return 'text-green-400';
        if (accuracy >= 80) return 'text-blue-400';
        if (accuracy >= 70) return 'text-yellow-400';
        return 'text-red-400';
    }

    getReputationColor(reputation) {
        if (reputation >= 80) return 'text-green-400';
        if (reputation >= 60) return 'text-yellow-400';
        return 'text-red-400';
    }

    getFinancialColor(damage) {
        const percentage = (damage / 1000000) * 100;
        if (percentage < 20) return 'text-green-400';
        if (percentage < 50) return 'text-yellow-400';
        return 'text-red-400';
    }

    // Reset session summary to initial state
    reset() {
        this.sessionData.startTime = new Date().toISOString();
        this.sessionData.lastUpdated = new Date().toISOString();
        this.stageCompletionTimes = {};
        this.totalActions = 0;
        this.accurateActions = 0;
        this.stagesCompleted = [];
    }
}