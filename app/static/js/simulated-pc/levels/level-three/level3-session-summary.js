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
            sessionId: null,
            totalSessions: 1
        };

        // Performance tracking
        this.stageCompletionTimes = {};
        this.totalActions = 0;
        this.accurateActions = 0;
        this.stagesCompleted = [];
    }

    /**
     * Start a new session with the backend
     */
    async startSession() {
        try {
            const response = await fetch('/levels/api/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_name: 'Level 3: Malware Mayhem',
                    level_id: 3
                })
            });

            const data = await response.json();
            if (data.success) {
                this.sessionData.sessionId = data.session_id;
                console.log('[Level3SessionSummary] Session started:', data.session_id);
            } else {
                console.error('[Level3SessionSummary] Failed to start session:', data.error);
            }
        } catch (error) {
            console.error('[Level3SessionSummary] Error starting session:', error);
        }
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
     * Calculate final score based on performance
     */
    calculateScore() {
        const timerStatus = this.timer.getStatus();
        const timeBonus = Math.max(0, (timerStatus.timeRemaining / (15 * 60)) * 30); // Up to 30 points for time
        const reputationBonus = Math.max(0, ((100 - timerStatus.reputationDamage) / 100) * 40); // Up to 40 points for reputation
        const financialBonus = Math.max(0, ((1000000 - timerStatus.financialDamage) / 1000000) * 30); // Up to 30 points for financial health
        
        return Math.round(timeBonus + reputationBonus + financialBonus);
    }

    /**
     * End the session and award XP
     */
    async endSession() {
        if (!this.sessionData.sessionId) {
            console.warn('[Level3SessionSummary] No session ID, cannot end session');
            return null;
        }

        try {
            const score = this.calculateScore();
            const response = await fetch('/levels/api/session/end', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionData.sessionId,
                    score: score
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log('[Level3SessionSummary] Session ended successfully, XP awarded:', data.xp_awarded);
                return data;
            } else {
                console.error('[Level3SessionSummary] Failed to end session:', data.error);
                return null;
            }
        } catch (error) {
            console.error('[Level3SessionSummary] Error ending session:', error);
            return null;
        }
    }

    /**
     * Show comprehensive session summary modal
     */
    async showSessionSummary() {
        // End the session and get XP data
        const sessionResult = await this.endSession();
        
        // Get timer status for final stats
        const timerStatus = this.timer.getStatus();
        const score = this.calculateScore();
        const accuracy = this.totalActions > 0 ? Math.round((this.accurateActions / this.totalActions) * 100) : 100;
        
        // Calculate total time spent
        const totalTimeSpent = (15 * 60) - timerStatus.timeRemaining; // 15 minutes minus remaining time
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        
        const levelCompleted = score >= 70; // 70% threshold for completion
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
                                    <h3 class="text-2xl font-bold text-white">XP Awarded!</h3>
                                    <p class="text-green-100">Experience Points Earned</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-3xl font-bold text-yellow-400">${sessionResult.xp_awarded || 0}</div>
                                    <div class="text-green-100 text-sm">Total XP Earned</div>
                                </div>
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-2xl font-bold text-white">${score}/100</div>
                                    <div class="text-green-100 text-sm">Performance Score</div>
                                </div>
                                <div class="bg-green-900/50 rounded-lg p-4">
                                    <div class="text-2xl font-bold text-white">${this.stagesCompleted.length}/3</div>
                                    <div class="text-green-100 text-sm">Stages Completed</div>
                                </div>
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

        document.body.appendChild(modal);

        // Bind events
        this.bindSummaryEvents(modal, levelCompleted);
    }

    /**
     * Generate stage analysis
     */
    generateStageAnalysis() {
        const stages = [
            { name: 'Process Monitor', key: 'process-monitor', icon: 'bi-cpu', description: 'Eliminate malicious processes' },
            { name: 'Malware Scanner', key: 'malware-scanner', icon: 'bi-shield-exclamation', description: 'Scan and quarantine threats' },
            { name: 'File Recovery', key: 'ransomware-decryptor', icon: 'bi-unlock', description: 'Decrypt ransomware files' }
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
     * Generate performance insights
     */
    generatePerformanceInsights(score, accuracy, timerStatus) {
        const insights = [];
        
        // Time performance
        const timeUsed = (15 * 60) - timerStatus.timeRemaining;
        const timePercentage = (timeUsed / (15 * 60)) * 100;
        
        if (timePercentage < 50) {
            insights.push({ icon: 'bi-lightning-fill', color: 'text-yellow-400', text: 'Excellent time management! You completed the crisis response quickly.' });
        } else if (timePercentage < 80) {
            insights.push({ icon: 'bi-clock-fill', color: 'text-blue-400', text: 'Good pacing throughout the incident response.' });
        } else {
            insights.push({ icon: 'bi-hourglass-split', color: 'text-orange-400', text: 'Consider working more quickly in real-world incidents.' });
        }
        
        // Reputation performance
        if (timerStatus.reputationDamage < 20) {
            insights.push({ icon: 'bi-star-fill', color: 'text-green-400', text: 'Outstanding reputation protection! Minimal damage taken.' });
        } else if (timerStatus.reputationDamage < 50) {
            insights.push({ icon: 'bi-shield-fill-check', color: 'text-blue-400', text: 'Good reputation management with acceptable damage levels.' });
        } else {
            insights.push({ icon: 'bi-exclamation-triangle-fill', color: 'text-red-400', text: 'High reputation damage - faster response needed in real scenarios.' });
        }
        
        // Financial performance
        const financialPercentage = (timerStatus.financialDamage / 1000000) * 100;
        if (financialPercentage < 20) {
            insights.push({ icon: 'bi-piggy-bank-fill', color: 'text-green-400', text: 'Excellent cost containment! Minimal financial impact.' });
        } else if (financialPercentage < 50) {
            insights.push({ icon: 'bi-cash-stack', color: 'text-blue-400', text: 'Reasonable cost management during the incident.' });
        } else {
            insights.push({ icon: 'bi-exclamation-diamond-fill', color: 'text-red-400', text: 'High financial costs - quicker containment crucial for budget protection.' });
        }

        return `
            <div class="grid grid-cols-1 gap-3">
                ${insights.map(insight => `
                    <div class="flex items-center p-3 bg-gray-700 rounded-lg">
                        <i class="${insight.icon} ${insight.color} text-xl mr-3"></i>
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
            continueBtn.addEventListener('click', () => this.continueToLevel4());
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryLevel3());
        }
        
        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => this.navigateToLevelsOverview());
        }

        // Close modal on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.navigateToLevelsOverview();
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
        window.location.reload();
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