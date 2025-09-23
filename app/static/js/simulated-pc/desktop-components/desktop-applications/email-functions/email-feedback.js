/**
 * EmailFeedback - Handles feedback and scoring for email interactions
 * Now uses in-memory state management only, with no server persistence
 */
export class EmailFeedback {
    constructor(emailApp) {
        this.emailApp = emailApp;
        // Initialize feedback tracking
        this.feedbackHistory = [];
        this.sessionScore = 0;
        this.totalActions = 0;
        this.dataLoaded = true; // Always loaded since we're not waiting for server
    }

    /**
     * Evaluate player action and provide feedback
     * @param {Object} email - Email object with suspicious property or is_phishing property
     * @param {string} action - Player action: 'report', 'trust', 'delete', 'ignore'
     * @param {string} reasoning - Optional reasoning for the action
     */
    async evaluateAction(email, action, reasoning = '') {
        const isCorrectAction = this.isActionCorrect(email, action);
        const isSuspicious = email.suspicious || email.is_phishing === 1;
        
        const feedbackData = {
            emailId: email.id,
            emailSubject: email.subject,
            emailSender: email.sender,
            isSuspicious: isSuspicious,
            playerAction: action,
            isCorrect: isCorrectAction,
            reasoning: reasoning,
            timestamp: new Date().toISOString(),
            feedback: this.generateFeedback(email, action, isCorrectAction)
        };

        await this.recordFeedback(feedbackData);
        this.showFeedbackModal(feedbackData);
        
        return feedbackData;
    }

    /**
     * Determine if the player's action is correct
     * @param {Object} email - Email object
     * @param {string} action - Player action
     * @returns {boolean} True if action is correct
     */
    isActionCorrect(email, action) {
        // Check both suspicious property and is_phishing property for compatibility
        const isSuspicious = email.suspicious || email.is_phishing === 1;
        
        if (isSuspicious) {
            // For suspicious emails, correct actions are: report, delete
            return ['report', 'delete'].includes(action);
        } else {
            // For legitimate emails, correct actions are: trust, ignore (normal processing)
            return ['trust', 'ignore'].includes(action);
        }
    }

    /**
     * Generate detailed feedback based on email and action using AI analysis
     * @param {Object} email - Email object with ai_analysis property
     * @param {string} action - Player action
     * @param {boolean} isCorrect - Whether action was correct
     * @returns {Object} Feedback object with details
     */
    generateFeedback(email, action, isCorrect) {
        const feedback = {
            result: isCorrect ? 'correct' : 'incorrect',
            title: '',
            message: '',
            redFlags: [],
            goodSigns: [],
            tips: [],
            aiAnalysis: email.ai_analysis || null
        };

        // Use AI analysis data if available, otherwise fall back to basic detection
        const aiAnalysis = email.ai_analysis;
        const isSuspicious = email.suspicious || email.is_phishing === 1;

        if (isSuspicious) {
            // Suspicious email feedback
            if (isCorrect) {
                feedback.title = '✅ Excellent Security Awareness!';
                feedback.message = `You correctly identified this as a suspicious email and took appropriate action by ${action === 'report' ? 'reporting' : 'deleting'} it.`;
            } else {
                feedback.title = '❌ Security Risk - Incorrect Action';
                feedback.message = `This was a suspicious email that should have been reported or deleted. ${action === 'trust' ? 'Trusting this email could lead to security breaches.' : 'Ignoring suspicious emails allows threats to persist.'}`;
            }

            // Use AI analysis red flags if available, otherwise fall back to detection
            if (aiAnalysis) {
                feedback.redFlags = [
                    ...(aiAnalysis.phishing_indicators || []),
                    ...(aiAnalysis.red_flags || [])
                ];
                feedback.tips = aiAnalysis.verification_tips || [
                    'Always verify sender identity through alternative channels',
                    'Be cautious of urgent requests for sensitive information',
                    'Check for spelling errors and suspicious domains',
                    'When in doubt, report to your security team'
                ];
            } else {
                feedback.redFlags = this.identifyRedFlags(email);
                feedback.tips = [
                    'Always verify sender identity through alternative channels',
                    'Be cautious of urgent requests for sensitive information',
                    'Check for spelling errors and suspicious domains',
                    'When in doubt, report to your security team'
                ];
            }
        } else {
            // Legitimate email feedback
            if (isCorrect) {
                feedback.title = '✅ Good Email Management';
            } else {
                feedback.title = '⚠️ Overly Cautious Action';
            }

            // Use AI analysis safety factors if available, otherwise fall back to detection
            if (aiAnalysis) {
                feedback.goodSigns = aiAnalysis.safety_factors || [];
                feedback.tips = aiAnalysis.verification_tips || [
                    'Legitimate emails often come from known domains',
                    'Professional formatting and proper grammar are good signs',
                    'Reasonable requests that align with business needs',
                    'Contact information and proper signatures indicate legitimacy'
                ];
            } else {
                feedback.goodSigns = this.identifyGoodSigns(email);
                feedback.tips = [
                    'Legitimate emails often come from known domains',
                    'Professional formatting and proper grammar are good signs',
                    'Reasonable requests that align with business needs',
                    'Contact information and proper signatures indicate legitimacy'
                ];
            }
        }

        return feedback;
    }

    /**
     * Identify red flags in suspicious emails using AI analysis when available
     * @param {Object} email - Email object with optional ai_analysis property
     * @returns {Array} List of red flags
     */
    identifyRedFlags(email) {
        // Use AI analysis data if available
        if (email.ai_analysis) {
            const redFlags = [
                ...(email.ai_analysis.phishing_indicators || []),
                ...(email.ai_analysis.red_flags || [])
            ];
            return redFlags;
        }

        // Fallback to hardcoded detection for emails without AI analysis
        const redFlags = [];
        
        // Check sender domain
        const senderDomain = email.sender.split('@')[1];
        if (senderDomain && (
            senderDomain.includes('gmail.com') && !email.sender.includes('cyberquest') ||
            senderDomain.includes('suspicious') ||
            senderDomain.includes('phish') ||
            senderDomain.includes('fake')
        )) {
            redFlags.push('Suspicious sender domain');
        }

        // Check subject line
        if (email.subject.includes('URGENT') || 
            email.subject.includes('IMMEDIATE') ||
            email.subject.includes('ACTION REQUIRED') ||
            email.subject.includes('VERIFY') ||
            email.subject.includes('SUSPENDED')) {
            redFlags.push('Urgent or threatening language in subject');
        }

        // Check for common phishing indicators in subject
        if (email.subject.toLowerCase().includes('password') ||
            email.subject.toLowerCase().includes('account') ||
            email.subject.toLowerCase().includes('security') ||
            email.subject.toLowerCase().includes('limited')) {
            redFlags.push('Subject mentions sensitive account information');
        }

        // Check sender patterns
        if (email.sender.includes('noreply') && email.suspicious) {
            redFlags.push('Suspicious use of no-reply address');
        }

        return redFlags;
    }

    /**
     * Identify good signs in legitimate emails using AI analysis when available
     * @param {Object} email - Email object with optional ai_analysis property
     * @returns {Array} List of positive indicators
     */
    identifyGoodSigns(email) {
        // Use AI analysis data if available
        if (email.ai_analysis && email.ai_analysis.safety_factors) {
            return email.ai_analysis.safety_factors;
        }

        // Fallback to hardcoded detection for emails without AI analysis
        const goodSigns = [];
        
        // Check sender domain
        const senderDomain = email.sender.split('@')[1];
        if (senderDomain && senderDomain.includes('cyberquest.com')) {
            goodSigns.push('Email from trusted organizational domain');
        }

        // Check for professional communication patterns
        if (email.subject && !email.subject.includes('!!!') && !email.subject.toUpperCase() === email.subject) {
            goodSigns.push('Professional subject line formatting');
        }

        // Check priority level
        if (email.priority === 'normal') {
            goodSigns.push('Normal priority level (not artificially urgent)');
        }

        return goodSigns;
    }

    /**
     * Update the UI to show the current score and XP
     * @param {number} xp - Current XP
     * @param {number} score - Current score
     */
    updateScoreUI(xp, score) {
        // Find and update the score display in the UI
        const scoreElements = document.querySelectorAll('.score-display, [data-score]');
        const xpElements = document.querySelectorAll('.xp-display, [data-xp]');
        
        scoreElements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = score;
            } else {
                el.textContent = score;
            }
        });
        
        xpElements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = xp;
            } else {
                el.textContent = xp;
            }
        });
        
        // Dispatch event for other components to listen to
        document.dispatchEvent(new CustomEvent('score-updated', {
            detail: { xp, score }
        }));
    }

    /**
     * Record feedback for session tracking
     * @param {Object} feedbackData - Feedback data to record
     */
    async recordFeedback(feedbackData) {
        try {
            // Add timestamp for tracking time spent
            feedbackData.timestamp = Date.now();
            this.feedbackHistory.push(feedbackData);
            this.totalActions++;
            
            // Initialize progress if it doesn't exist
            if (!window.cyberQuestProgress?.lessons?.[2]) {
                window.cyberQuestProgress = window.cyberQuestProgress || {
                    level: 1,
                    xp: 0,
                    totalXp: 0,
                    levelThreshold: 100,
                    lessons: {}
                };
                window.cyberQuestProgress.lessons[2] = {
                    attempts: 0,
                    xpEarned: 0,
                    timeSpent: 0,
                    mistakes: 0,
                    lastAttempt: null,
                    _cumulativeXp: 0,
                    _cumulativeScore: 0,
                    _lastUpdateTime: Date.now(),
                    totalScore: 0  // Add totalScore to track overall score
                };
            }
            
            const lesson = window.cyberQuestProgress.lessons[2];
            
            // Update score and track mistakes
            if (feedbackData.isCorrect) {
                this.sessionScore++;
                // Award XP for correct actions and force UI update
                await this.awardXP(10, true);
            } else {
                // Track mistakes for learning analytics
                this.trackMistake(feedbackData);
            }
            
            // Update session stats
            this.updateSessionStats();
            
            // Update UI with current values
            this.updateScoreUI(lesson.xpEarned, lesson.totalScore);
        } catch (error) {
            console.error('Error in recordFeedback:', error);
        }
    }

    /**
     * Award XP for correct actions and update level progress
     * @param {number} xp - Amount of XP to award
     * @param {boolean} forceUpdate - Whether to force update server immediately
     */
    async awardXP(xp, forceUpdate = false) {
        try {
            if (!window.cyberQuestProgress) {
                window.cyberQuestProgress = {
                    level: 1,
                    xp: 0,
                    totalXp: 0,
                    levelThreshold: 100,
                    lessons: {}
                };
            }

            // Initialize lesson 2 progress if it doesn't exist
            if (!window.cyberQuestProgress.lessons[2]) {
                window.cyberQuestProgress.lessons[2] = { 
                    attempts: 0,
                    xpEarned: 0,
                    timeSpent: 0, // in seconds
                    mistakes: 0,
                    lastAttempt: null,
                    // Track cumulative values for server updates
                    _cumulativeXp: 0,
                    _cumulativeScore: 0,
                    _lastUpdateTime: Date.now(),
                    totalScore: 0  // Track total score across all updates
                };
            }

            const lesson = window.cyberQuestProgress.lessons[2];
            
            // Update XP and level progress
            window.cyberQuestProgress.xp += xp;
            window.cyberQuestProgress.totalXp += xp;
            lesson.xpEarned += xp;
            lesson._cumulativeXp += xp;
            
            // Initialize totalScore if it doesn't exist
            if (typeof lesson.totalScore !== 'number') {
                lesson.totalScore = 0;
            }
            
            // Calculate points for this action (10 points per correct answer)
            const pointsEarned = 10;
            lesson._cumulativeScore += pointsEarned;
            lesson.totalScore += pointsEarned;
            
            // Update UI immediately with the total score
            this.updateScoreUI(lesson.xpEarned, lesson.totalScore);
            
            // Check for level up
            if (window.cyberQuestProgress.xp >= window.cyberQuestProgress.levelThreshold) {
                await this.levelUp();
            }
            
            console.log(`Awarded ${xp} XP for Lesson 2. Total XP: ${lesson.xpEarned}, Score: ${lesson.totalScore}`);
            
            // Update server progress (throttled)
            const now = Date.now();
            if (forceUpdate || now - lesson._lastUpdateTime > 5000) { // Update at most every 5 seconds
                try {
                    await this.updateServerProgress(2, {
                        xp_earned: lesson._cumulativeXp,
                        score: lesson.totalScore,
                        time_spent: Math.floor(lesson.timeSpent / 1000) // Convert to seconds
                    });
                    lesson._lastUpdateTime = now;
                    // Reset cumulative counters after successful update
                    lesson._cumulativeXp = 0;
                    lesson._cumulativeScore = 0;
                } catch (error) {
                    console.error('Error updating server progress:', error);
                    // Don't update _lastUpdateTime on error so we'll retry next time
                }
            }
        } catch (error) {
            console.error('Error in awardXP:', error);
        }
    }

    /**
     * Track and categorize mistakes for learning analytics
     * @param {Object} feedbackData - Feedback data containing mistake information
     */
    trackMistake() {
        // Initialize progress tracking structure if it doesn't exist
        if (!window.cyberQuestProgress) {
            window.cyberQuestProgress = {
                level: 1,
                xp: 0,
                totalXp: 0,
                levelThreshold: 100,
                lessons: {}
            };
        }
        if (!window.cyberQuestProgress.lessons) {
            window.cyberQuestProgress.lessons = {};
        }
        if (!window.cyberQuestProgress.lessons[2]) {
            window.cyberQuestProgress.lessons[2] = { 
                mistakes: 0
            };
        }

        // Increment total mistakes
        window.cyberQuestProgress.lessons[2].mistakes += 1;
        
        console.log(`Mistake recorded. Total mistakes: ${window.cyberQuestProgress.lessons[2].mistakes}`);
    }

    /**
     * Categorize the type of mistake made
     * @param {Object} feedbackData - Feedback data from the action
     * @returns {string} Category of mistake
     */
    categorizeMistake(feedbackData) {
        if (!feedbackData.isSuspicious && feedbackData.playerAction === 'report') {
            return 'false_positive';
        } else if (feedbackData.isSuspicious && feedbackData.playerAction === 'trust') {
            return 'false_negative';
        } else if (feedbackData.isSuspicious && feedbackData.playerAction === 'ignore') {
            return 'missed_threat';
        }
        return 'other';
    }

    /**
     * Handle level up logic
     */
    levelUp() {
        window.cyberQuestProgress.level++;
        window.cyberQuestProgress.xp -= window.cyberQuestProgress.levelThreshold;
        window.cyberQuestProgress.levelThreshold = Math.floor(window.cyberQuestProgress.levelThreshold * 1.5);
        
        console.log(`Level Up! You are now level ${window.cyberQuestProgress.level}`);
        
        // Trigger level up event
        document.dispatchEvent(new CustomEvent('level-up', {
            detail: {
                level: window.cyberQuestProgress.level,
                xp: window.cyberQuestProgress.xp,
                nextLevelThreshold: window.cyberQuestProgress.levelThreshold
            }
        }));
    }

    /**
     * Update session statistics including time spent
     */
    updateSessionStats() {
        if (!this.feedbackHistory.length) return;
        
        const now = Date.now();
        const firstAction = this.feedbackHistory[0].timestamp;
        const timeSpentSeconds = Math.floor((now - firstAction) / 1000);
        
        // Update lesson 2 time spent
        if (!window.cyberQuestProgress?.lessons) window.cyberQuestProgress.lessons = {};
        if (!window.cyberQuestProgress.lessons[2]) window.cyberQuestProgress.lessons[2] = {};
        
        window.cyberQuestProgress.lessons[2].timeSpent = timeSpentSeconds;
        window.cyberQuestProgress.lessons[2].lastAttempt = now;
        window.cyberQuestProgress.lessons[2].attempts = (window.cyberQuestProgress.lessons[2].attempts || 0) + 1;
        
        console.log(`Session stats updated - Time spent: ${timeSpentSeconds}s, Attempts: ${window.cyberQuestProgress.lessons[2].attempts}`);
    }
    
    /**
     * Show feedback modal to the user
     * @param {Object} feedbackData - Feedback data to display
     */
    showFeedbackModal(feedbackData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4';
        
        const { feedback } = feedbackData;
        const resultColor = feedback.result === 'correct' ? '#22c55e' : '#ef4444';
        const accuracy = this.totalActions > 0 ? Math.round((this.sessionScore / this.totalActions) * 100) : 0;
        
        // Combine red flags and good signs into a single insights section
        const insights = [
            ...(feedback.redFlags.map(flag => ({ type: 'warning', icon: '🚩', text: flag, color: 'text-red-300' }))),
            ...(feedback.goodSigns.map(sign => ({ type: 'positive', icon: '✅', text: sign, color: 'text-green-300' })))
        ];
        
        modal.innerHTML = `
            <div class="bg-gray-800 rounded border border-gray-600 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r ${feedback.result === 'correct' ? 'from-green-600 to-emerald-600' : 'from-red-600 to-pink-600'} px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="text-3xl">${feedback.result === 'correct' ? '✅' : '❌'}</div>
                            <div>
                                <h2 class="text-lg font-bold text-white">${feedback.title}</h2>
                                <p class="text-sm text-white/90">${feedbackData.emailSubject}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-white font-bold text-lg">${accuracy}%</div>
                            <div class="text-white/80 text-xs">Accuracy</div>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Left Column -->
                        <div class="space-y-3">
                            <!-- Email Info -->
                            <div class="bg-gray-700/50 rounded p-3 border border-gray-600/50">
                                <h3 class="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                                    📧 <span class="ml-1">Email Analysis</span>
                                </h3>
                                <div class="space-y-1 text-xs">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Action:</span>
                                        <span class="text-white capitalize">${feedbackData.playerAction}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Type:</span>
                                        <span class="${feedbackData.isSuspicious ? 'text-red-400' : 'text-green-400'} font-medium">
                                            ${feedbackData.isSuspicious ? 'Phishing' : 'Legitimate'}
                                        </span>
                                    </div>
                                    ${feedback.aiAnalysis?.risk_level ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Risk Level:</span>
                                        <span class="px-2 py-0.5 rounded text-xs font-semibold ${
                                            feedback.aiAnalysis.risk_level === 'high' ? 'bg-red-600 text-white' :
                                            feedback.aiAnalysis.risk_level === 'medium' ? 'bg-yellow-600 text-white' :
                                            'bg-green-600 text-white'
                                        }">${feedback.aiAnalysis.risk_level.toUpperCase()}</span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>

                            <!-- Session Progress -->
                            <div class="bg-gray-700/50 rounded p-3 border border-gray-600/50">
                                <h3 class="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                                    📊 <span class="ml-1">Session Progress</span>
                                </h3>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-xs text-gray-400">Score:</span>
                                    <span class="text-sm text-white">${this.sessionScore}/${this.totalActions}</span>
                                </div>
                                <div class="w-full bg-gray-600 rounded-full h-1.5">
                                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                                         style="width: ${accuracy}%"></div>
                                </div>
                            </div>

                            <!-- Education Focus -->
                            ${feedback.aiAnalysis?.educational_focus ? `
                            <div class="bg-purple-900/20 rounded p-3 border border-purple-600/30">
                                <h3 class="text-sm font-semibold text-purple-400 mb-2 flex items-center">
                                    🎓 <span class="ml-1">Education Focus</span>
                                </h3>
                                <p class="text-xs text-purple-300 leading-relaxed">${feedback.aiAnalysis.educational_focus}</p>
                            </div>
                            ` : ''}
                        </div>

                        <!-- Right Column -->
                        <div class="space-y-3">
                            <!-- Key Insights -->
                            ${insights.length > 0 ? `
                            <div class="bg-gray-700/50 rounded p-3 border border-gray-600/50">
                                <h3 class="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                                    🔍 <span class="ml-1">Key Insights</span>
                                </h3>
                                <div class="space-y-1 max-h-24 overflow-y-auto">
                                    ${insights.slice(0, 4).map(insight => `
                                        <div class="flex items-start space-x-2 text-xs">
                                            <span class="flex-shrink-0">${insight.icon}</span>
                                            <span class="${insight.color}">${insight.text}</span>
                                        </div>
                                    `).join('')}
                                    ${insights.length > 4 ? `<div class="text-xs text-gray-500 italic">+${insights.length - 4} more insights...</div>` : ''}
                                </div>
                            </div>
                            ` : ''}

                            <!-- Security Tips -->
                            <div class="bg-blue-900/20 rounded p-3 border border-blue-600/30">
                                <h3 class="text-sm font-semibold text-blue-400 mb-2 flex items-center">
                                    💡 <span class="ml-1">Quick Tips</span>
                                </h3>
                                <div class="space-y-1 max-h-24 overflow-y-auto">
                                    ${feedback.tips.slice(0, 3).map(tip => `
                                        <div class="flex items-start space-x-2 text-xs">
                                            <span class="text-blue-400 flex-shrink-0">•</span>
                                            <span class="text-blue-300">${tip}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 bg-gray-750 border-t border-gray-600">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full bg-gradient-to-r ${feedback.result === 'correct' ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-blue-700'} text-white py-2 px-4 rounded hover:shadow-lg transition-all duration-300 font-medium text-sm cursor-pointer">
                        Continue Training <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    }

    /**
     * Get session statistics
     * @returns {Object} Session statistics
     */
    getSessionStats() {
        return {
            totalActions: this.totalActions,
            correctActions: this.sessionScore,
            accuracy: this.totalActions > 0 ? Math.round((this.sessionScore / this.totalActions) * 100) : 0,
            feedbackHistory: this.feedbackHistory
        };
    }

    /**
     * Clear all feedback data (in-memory only)
     * @returns {boolean} Always returns true
     */
    async clearAllFeedback() {
        this.feedbackHistory = [];
        this.sessionScore = 0;
        this.totalActions = 0;
        return true;
    }

    /**
     * Save feedback to memory
     * @param {Object} feedback - Feedback data to save
     * @returns {boolean} Always returns true since we're not persisting
     */
    async saveFeedbackToServer(feedback) {
        // No-op since we're not persisting feedback
        return true;
    }

    /**
     * Update server with the latest progress
     * @param {number} levelId - The level ID
     * @param {Object} data - Progress data to update
     */
    async updateServerProgress(levelId, data) {
        try {
            const response = await fetch(`/levels/api/level/${levelId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    status: 'in_progress',
                    score: data.score,
                    completion_percentage: Math.min(100, Math.floor((this.sessionScore / this.totalActions) * 100)),
                    time_spent: data.time_spent,
                    xp_earned: data.xp_earned,
                    mistakes_made: window.cyberQuestProgress?.lessons[2]?.mistakes || 0
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update progress on server');
            }

            const result = await response.json();
            console.log('Progress updated on server:', result);
            
            // Reset cumulative counters after successful update
            if (window.cyberQuestProgress?.lessons[2]) {
                window.cyberQuestProgress.lessons[2]._cumulativeXp = 0;
                window.cyberQuestProgress.lessons[2]._cumulativeScore = 0;
            }
            
            return result;
        } catch (error) {
            console.error('Error updating progress:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Show final session summary and update server with final progress
     */
    async showSessionSummary() {
        // Final update to server with all progress
        if (window.cyberQuestProgress?.lessons[2]) {
            const lesson = window.cyberQuestProgress.lessons[2];
            try {
                await this.updateServerProgress(2, {
                    xp_earned: lesson.xpEarned,
                    score: lesson.xpEarned * 10, // Convert XP to score (10 points per XP)
                    time_spent: Math.floor(lesson.timeSpent / 1000), // Convert to seconds
                    status: 'completed'
                });
            } catch (error) {
                console.error('Failed to save final progress:', error);
            }
        }
        const stats = this.getSessionStats();
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/85 flex items-center justify-center z-50';
        
        const accuracyClass = stats.accuracy >= 80 ? 'text-green-400' : stats.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400';
        const emoji = stats.accuracy >= 80 ? '🏆' : stats.accuracy >= 60 ? '👍' : '📚';
        const bgGradient = stats.accuracy >= 80 ? 'from-green-600 to-emerald-600' : stats.accuracy >= 60 ? 'from-yellow-600 to-orange-600' : 'from-red-600 to-pink-600';
        
        modal.innerHTML = `
            <div class="bg-gray-800 rounded border border-gray-600 shadow-2xl p-8 max-w-md mx-4">
                <div class="text-center">
                    <div class="text-6xl mb-4">${emoji}</div>
                    <h2 class="text-2xl font-bold text-white mb-4">Email Security Training Complete!</h2>
                    
                    <div class="space-y-3 mb-6">
                        <div class="text-lg">
                            <span class="font-semibold text-gray-200">Final Score:</span>
                            <span class="${accuracyClass} font-bold text-2xl"> ${stats.accuracy}%</span>
                        </div>
                        
                        <!-- Animated Progress Ring -->
                        <div class="relative w-24 h-24 mx-auto mb-4">
                            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                                <path class="text-gray-600" stroke="currentColor" stroke-width="2" fill="none" 
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                <path class="${accuracyClass}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"
                                      stroke-dasharray="${stats.accuracy}, 100" 
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="${accuracyClass} text-lg font-bold">${stats.accuracy}%</span>
                            </div>
                        </div>
                        
                        <div class="text-gray-300 text-sm">
                            Correct Actions: <span class="text-green-400 font-semibold">${stats.correctActions}</span> out of <span class="text-gray-200">${stats.totalActions}</span>
                        </div>
                    </div>
                    
                    <div class="text-sm text-gray-400 mb-6 p-3 bg-gray-700 rounded border border-gray-600">
                        ${stats.accuracy >= 80 ? 
                            'Excellent work! You demonstrated strong email security awareness.' :
                            stats.accuracy >= 60 ?
                            'Good job! Continue practicing to improve your security skills.' :
                            'Keep learning! Email security is crucial for cybersecurity.'
                        }
                    </div>
                    
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-gradient-to-r ${bgGradient} text-white px-8 py-3 rounded hover:shadow-lg transition-all duration-300 font-semibold">
                        Continue to Next Level
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Reset feedback system to initial state
    async reset() {
        try {
            this.feedbackHistory = [];
            this.sessionScore = 0;
            this.totalActions = 0;
            this.dataLoaded = false;

            // Clear server-side session data
            await this.emailServerAPI.saveSessionData({
                feedbackHistory: [],
                sessionScore: 0,
                totalActions: 0
            });

            console.log('EmailFeedback reset completed');
        } catch (error) {
            console.error('Failed to reset EmailFeedback:', error);
        }
    }
}
