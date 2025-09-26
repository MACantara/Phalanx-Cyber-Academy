/**
 * EmailSessionSummary - Handles displaying session summary and performance metrics
 * Now uses in-memory state management only, with no server persistence
 */
export class EmailSessionSummary {
    /**
     * Create a new EmailSessionSummary instance
     * @param {Object} emailApp - Reference to the main email application instance
     */
    constructor(emailApp) {
        this.emailApp = emailApp;
        this.sessionData = {
            startTime: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            totalSessions: 1
        };

        // In-memory feedback store used for the session UI (not persisted server-side)
        this.feedbackStore = new InMemoryFeedbackStore();
    }

    // Allow external code (email app) to attach its feedback store
    attachFeedbackStore(store) {
        if (store && typeof store.getAll === 'function') {
            this.feedbackStore = store;
        }
    }

    /**
     * Show comprehensive session summary modal
     * @param {Object} sessionStats - Session statistics from EmailFeedback
     * @param {Array} feedbackHistory - Array of all feedback interactions
     */
    showSessionSummary(sessionStats, feedbackHistory = []) {
        // If no explicit history passed, use the in-memory feedback store
        if ((!feedbackHistory || feedbackHistory.length === 0) && this.feedbackStore) {
            feedbackHistory = this.feedbackStore.getAll();
        }
        // If sessionStats is missing or appears empty, try to derive it from feedbackHistory or attached app feedback
        const isEmptyStats = !sessionStats || (typeof sessionStats === 'object' && (sessionStats.totalActions === 0 || sessionStats.totalActions === undefined) && (sessionStats.accuracy === 0 || sessionStats.accuracy === undefined));
        if (isEmptyStats) {
            // Try derive from passed feedbackHistory
            if (feedbackHistory && feedbackHistory.length > 0) {
                const totalActions = feedbackHistory.length;
                const correctActions = feedbackHistory.filter(f => f.isCorrect).length;
                const accuracy = totalActions > 0 ? Math.round((correctActions / totalActions) * 100) : 0;
                sessionStats = {
                    totalActions,
                    correctActions,
                    accuracy,
                    feedbackHistory
                };
            } else if (this.feedbackStore && typeof this.feedbackStore.getAll === 'function') {
                const fb = this.feedbackStore.getAll();
                if (fb && fb.length > 0) {
                    const totalActions = fb.length;
                    const correctActions = fb.filter(f => f.isCorrect).length;
                    const accuracy = totalActions > 0 ? Math.round((correctActions / totalActions) * 100) : 0;
                    sessionStats = { totalActions, correctActions, accuracy, feedbackHistory: fb };
                }
            } else if (this.emailApp && this.emailApp.actionHandler && this.emailApp.actionHandler.feedback && typeof this.emailApp.actionHandler.feedback.getSessionStats === 'function') {
                sessionStats = this.emailApp.actionHandler.feedback.getSessionStats();
                feedbackHistory = feedbackHistory.length > 0 ? feedbackHistory : (sessionStats.feedbackHistory || []);
            } else {
                sessionStats = sessionStats || { totalActions: 0, correctActions: 0, accuracy: 0, feedbackHistory: [] };
            }
        }
        // Update session data
        this.sessionData.lastUpdated = new Date().toISOString();
        this.sessionData.totalSessions = (this.sessionData.totalSessions || 0) + 1;
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        
        // Calculate accuracy from feedback history if sessionStats.accuracy is 0 or undefined
        let calculatedAccuracy = sessionStats.accuracy || 0;
        if (calculatedAccuracy === 0 && feedbackHistory.length > 0) {
            const correctActions = feedbackHistory.filter(f => f.isCorrect).length;
            calculatedAccuracy = Math.round((correctActions / feedbackHistory.length) * 100);
        }
        
        // If still 0, try to calculate from session stats properties
        if (calculatedAccuracy === 0 && sessionStats.totalActions > 0) {
            calculatedAccuracy = Math.round((sessionStats.correctActions / sessionStats.totalActions) * 100);
        }
        
        const accuracyClass = this.getAccuracyClass(calculatedAccuracy);
        const levelCompleted = calculatedAccuracy >= 70; // 70% threshold for completion
        
        console.log('Email Session Summary - Calculated accuracy:', calculatedAccuracy, 'from stats:', sessionStats, 'and history:', feedbackHistory.length);
        
        modal.innerHTML = `
            <div class="bg-gray-800 text-white rounded p-8 max-w-4xl mx-4 max-h-150 overflow-y-auto border border-gray-600">
                <div class="text-center mb-8">
                    <div class="flex items-center justify-center gap-2 mb-4">
                        <i class="bi bi-shield-check text-3xl text-blue-400"></i>
                        <h1 class="text-3xl font-bold">Level 2 Complete!</h1>
                    </div>
                    <div class="text-6xl font-bold mb-4 ${accuracyClass}">${calculatedAccuracy}%</div>
                    <p class="text-lg">Email Security Training Performance</p>
                    <p class="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <i class="bi bi-envelope-check-fill text-blue-400"></i>
                        ${this.countUniqueEmails(feedbackHistory)} emails analyzed with AI-powered threat detection training
                    </p>
                </div>
                
                <!-- Performance Summary -->
                <div class="bg-gray-700 border border-gray-600 rounded p-6 mb-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="bi bi-trophy text-yellow-400 mr-2"></i>
                        Performance Summary
                    </h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold ${accuracyClass} mb-2 flex items-center justify-center gap-2">
                                <i class="bi bi-percent"></i>
                                ${calculatedAccuracy}
                            </div>
                            <div class="text-gray-400 text-sm">Overall Accuracy</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-400 mb-2 flex items-center justify-center gap-2">
                                <i class="bi bi-envelope-fill"></i>
                                ${this.countUniqueEmails(feedbackHistory)}
                            </div>
                            <div class="text-gray-400 text-sm">Emails Analyzed</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-400 mb-2 flex items-center justify-center gap-2">
                                <i class="bi bi-check-circle-fill"></i>
                                ${sessionStats.correctActions || feedbackHistory.filter(f => f.isCorrect).length}
                            </div>
                            <div class="text-gray-400 text-sm">Correct Actions</div>
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Email Analysis -->
                <div class="space-y-4 mb-8">
                    <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
                        <i class="bi bi-clipboard-data text-blue-400 mr-2"></i>
                        Detailed Email Analysis
                    </h2>
                    
                    ${this.generateDetailedEmailAnalysis(feedbackHistory)}
                </div>
                
                <!-- Email Categories Performance -->
                <div class="bg-gray-700 border border-gray-600 rounded p-6 mb-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="bi bi-envelope-check text-purple-400 mr-2"></i>
                        Email Category Performance
                    </h3>
                    
                    ${this.generateEmailCategoriesChart(feedbackHistory)}
                </div>
                
                <!-- Areas for Improvement -->
                ${this.generateImprovementSection(feedbackHistory, calculatedAccuracy)}
                
                <div class="text-center">
                    ${levelCompleted ? `
                        <button onclick="window.emailSessionSummary?.completeLevel2()" class="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700 transition-colors font-semibold text-lg cursor-pointer flex items-center justify-center gap-2 mx-auto">
                            <i class="bi bi-rocket-takeoff-fill"></i>
                            Continue to Level 3
                        </button>
                    ` : `
                        <div class="space-y-3">
                            <button onclick="window.emailSessionSummary?.completeLevel2()" class="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition-colors font-semibold text-lg cursor-pointer flex items-center justify-center gap-2 mx-auto">
                                <i class="bi bi-save-fill"></i>
                                Save Progress & Exit
                            </button>
                            <button onclick="window.emailSessionSummary?.retryTraining()" class="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2 mx-auto">
                                <i class="bi bi-arrow-clockwise"></i>
                                Retry Training
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Store global reference for button handlers
        window.emailSessionSummary = this;
        
        // Store session data for future reference
        this.lastSessionStats = { ...sessionStats, accuracy: calculatedAccuracy };
        this.lastFeedbackHistory = feedbackHistory;
    }

    /**
     * Generate detailed email analysis similar to article analysis
     */
    generateDetailedEmailAnalysis(feedbackHistory) {
        if (feedbackHistory.length === 0) {
            return `
                <div class="bg-gray-700 border border-gray-600 rounded p-4 text-center">
                    <p class="text-gray-400">No email analysis data available</p>
                </div>
            `;
        }
        
        const emailGroups = this.groupEmailsByType(feedbackHistory);
        
        return Object.entries(emailGroups).map(([type, emails]) => {
            const typeAccuracy = emails.length > 0 ? Math.round((emails.filter(e => e.isCorrect).length / emails.length) * 100) : 0;
            const typeAccuracyClass = this.getAccuracyClass(typeAccuracy);
            
            return `
                <div class="bg-gray-700 border border-gray-600 rounded p-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <div class="font-semibold text-white mb-1 flex items-center gap-2">
                                <i class="bi bi-envelope-fill text-gray-400"></i>
                                ${type} Emails
                            </div>
                            <div class="text-gray-400 text-sm flex items-center gap-2">
                                <i class="bi bi-collection-fill text-gray-500"></i>
                                <strong>Count:</strong> ${emails.length} emails • 
                                <i class="bi bi-target text-gray-500"></i>
                                <strong>Accuracy:</strong> ${emails.filter(e => e.isCorrect).length}/${emails.length} correct
                            </div>
                        </div>
                        <div class="text-2xl font-bold ${typeAccuracyClass} ml-4">
                            ${typeAccuracy}%
                        </div>
                    </div>
                    
                    <!-- Action Breakdown -->
                    <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div class="bg-green-900/30 border border-green-600/30 rounded p-2 text-center">
                            <div class="text-green-400 font-bold flex items-center justify-center gap-1">
                                <i class="bi bi-check-circle-fill"></i>
                                ${emails.filter(e => e.isCorrect).length}
                            </div>
                            <div class="text-green-300 text-xs">Correct</div>
                        </div>
                        <div class="bg-red-900/30 border border-red-600/30 rounded p-2 text-center">
                            <div class="text-red-400 font-bold flex items-center justify-center gap-1">
                                <i class="bi bi-x-circle-fill"></i>
                                ${emails.filter(e => !e.isCorrect).length}
                            </div>
                            <div class="text-red-300 text-xs">Incorrect</div>
                        </div>
                    </div>
                    
                    <!-- Key Learning Points -->
                    <div class="bg-gray-800 rounded p-3">
                        <div class="text-xs text-gray-400 mb-2 flex items-start gap-1">
                            <i class="bi bi-key-fill text-yellow-400 mt-0.5"></i>
                            <div>
                                <strong>Key Indicators:</strong> ${this.getEmailTypeIndicators(type)}
                            </div>
                        </div>
                        ${typeAccuracy < 75 ? `
                            <div class="text-xs text-blue-300 flex items-start gap-1">
                                <i class="bi bi-lightbulb-fill text-blue-400 mt-0.5"></i>
                                <div>
                                    <strong>Learning Tip:</strong> ${this.generateEmailTypeTip(type, typeAccuracy)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Generate email categories chart similar to the modal manager format
     */
    generateEmailCategoriesChart(feedbackHistory) {
        const categories = this.categorizeEmailPerformance(feedbackHistory);
        
        return `
            <div class="grid md:grid-cols-2 gap-4">
                ${Object.entries(categories).map(([category, data]) => `
                    <div class="bg-gray-800 border border-gray-600 rounded p-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium text-white flex items-center gap-2">
                                <i class="bi ${category.includes('Phishing') ? 'bi-exclamation-triangle-fill text-red-400' : 'bi-check-circle-fill text-green-400'}"></i>
                                ${category}
                            </span>
                            <span class="text-sm font-semibold ${data.accuracy >= 70 ? 'text-green-400' : 'text-red-400'}">
                                ${data.accuracy}%
                            </span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="h-2 rounded-full transition-all duration-1000 ${data.accuracy >= 70 ? 'bg-green-500' : 'bg-red-500'}" 
                                 style="width: ${data.accuracy}%"></div>
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            ${data.correct}/${data.total} correct
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate improvement suggestions
     */
    generateImprovementSection(feedbackHistory, accuracy) {
        if (accuracy >= 80) return '';
        
        const suggestions = this.generateImprovementSuggestions(feedbackHistory);
        
        return `
            <div class="bg-blue-900/30 border border-blue-600 rounded p-6 mb-6">
                <h3 class="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                    <i class="bi bi-lightbulb text-blue-400 mr-2"></i>
                    Areas for Improvement
                </h3>
                
                <div class="space-y-3">
                    ${suggestions.map(suggestion => `
                        <div class="flex items-start">
                            <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">!</div>
                            <div class="text-blue-200 text-sm">${suggestion}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Helper methods for email analysis
     */
    groupEmailsByType(feedbackHistory) {
        const groups = {
            'Phishing': [],
            'Legitimate': []
        };
        
        feedbackHistory.forEach(feedback => {
            if (feedback.isSuspicious) {
                groups['Phishing'].push(feedback);
            } else {
                groups['Legitimate'].push(feedback);
            }
        });
        
        return groups;
    }

    getEmailTypeIndicators(type) {
        if (type === 'Phishing') {
            return 'Suspicious sender domains, urgent language, suspicious links, requests for personal information';
        } else {
            return 'Professional formatting, legitimate sender domains, business-appropriate language, proper signatures';
        }
    }

    generateEmailTypeTip(type, accuracy) {
        if (type === 'Phishing') {
            return "Focus on examining sender domains, looking for spelling errors, and identifying urgent/threatening language patterns.";
        } else {
            return "Learn to recognize legitimate business communications and professional email formatting standards.";
        }
    }

    /**
     * Helper methods for calculations and analysis
     */
    getAccuracyClass(accuracy) {
        if (accuracy >= 80) return 'text-green-600';
        if (accuracy >= 70) return 'text-yellow-600';
        return 'text-red-600';
    }

    getAccuracyEmoji(accuracy) {
        if (accuracy >= 90) return '🏆';
        if (accuracy >= 80) return '🎉';
        if (accuracy >= 70) return '👍';
        return '📚';
    }

    countUniqueEmails(feedbackHistory) {
        if (!feedbackHistory || feedbackHistory.length === 0) return 0;
        const uniqueEmails = new Set(feedbackHistory.map(f => f.emailId || f.emailSender));
        return uniqueEmails.size;
    }

    calculateSessionDuration(feedbackHistory) {
        if (feedbackHistory.length < 2) return 'N/A';
        
        const start = new Date(feedbackHistory[0].timestamp);
        const end = new Date(feedbackHistory[feedbackHistory.length - 1].timestamp);
        const durationMinutes = Math.round((end - start) / (1000 * 60));
        
        return durationMinutes > 0 ? `${durationMinutes} minutes` : '< 1 minute';
    }

    calculateAverageResponseTime(feedbackHistory) {
        // This would require tracking response times in the feedback system
        // For now, return a simulated value
        return Math.random() * 60 + 30; // 30-90 seconds
    }

    categorizeEmailPerformance(feedbackHistory) {
        const categories = {
            'Phishing Emails': { correct: 0, total: 0, accuracy: 0 },
            'Legitimate Emails': { correct: 0, total: 0, accuracy: 0 }
        };
        
        feedbackHistory.forEach(feedback => {
            if (feedback.isSuspicious !== undefined) {
                if (feedback.isSuspicious) {
                    categories['Phishing Emails'].total++;
                    if (feedback.isCorrect) categories['Phishing Emails'].correct++;
                } else {
                    categories['Legitimate Emails'].total++;
                    if (feedback.isCorrect) categories['Legitimate Emails'].correct++;
                }
            }
        });
        
        // Calculate accuracies
        Object.keys(categories).forEach(key => {
            const cat = categories[key];
            cat.accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
        });
        
        return categories;
    }

    generateImprovementSuggestions(feedbackHistory) {
        const suggestions = [];
        
        const phishingMistakes = feedbackHistory.filter(f => f.isSuspicious && !f.isCorrect);
        const legitimateMistakes = feedbackHistory.filter(f => !f.isSuspicious && !f.isCorrect);
        
        if (phishingMistakes.length > legitimateMistakes.length) {
            suggestions.push("Practice identifying red flags in suspicious emails such as urgent language, suspicious links, and requests for personal information.");
            suggestions.push("Pay closer attention to sender domains and email formatting inconsistencies.");
        } else if (legitimateMistakes.length > phishingMistakes.length) {
            suggestions.push("Learn to recognize legitimate business communications and professional email formatting.");
            suggestions.push("Consider the context and necessity of the email request before marking as suspicious.");
        }
        
        if (suggestions.length === 0) {
            suggestions.push("Review email security best practices and common phishing techniques.");
            suggestions.push("Practice with more email examples to build confidence in decision-making.");
        }
        
        return suggestions;
    }

    /**
     * Action handlers for buttons
     */
    async completeLevel2(isRetry = false) {
        try {
            // Mark Level 2 as completed via server API call
            const completionData = {
                level_id: 2,
                score: this.lastSessionStats.accuracy,
                time_spent: 1800, // 30 minutes estimate
                completion_data: {
                    sessionStats: this.lastSessionStats,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Make API call to complete the level
            const response = await fetch('/levels/api/complete/2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(completionData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Level 2 marked as completed:', result);
            } else {
                console.error('Failed to mark Level 2 as completed');
            }
        } catch (error) {
            console.error('Error completing Level 2:', error);
        }
        
        if (isRetry) {
            // Close the current modal with a nice fade out
            const modal = document.querySelector('.fixed.inset-0.bg-black\/75');
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transition = 'opacity 300ms ease-in-out';
                setTimeout(() => modal.remove(), 300);
            }
            
            // Start the retry process after recording completion
            this.startRetryProcess();
        } else {
            // Close modal first
            document.querySelector('.fixed')?.remove();
            
            // Show shutdown sequence before navigation
            await this.showShutdownSequenceAndNavigate();
        }
    }

    async showShutdownSequenceAndNavigate() {
        // Create shutdown overlay
        const shutdownOverlay = document.createElement('div');
        shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
        shutdownOverlay.style.zIndex = '9999';
        document.body.appendChild(shutdownOverlay);
        
        try {
            // Import and run shutdown sequence
            const { ShutdownSequence } = await import('../../../shutdown-sequence.js');
            
            // Run shutdown sequence
            await ShutdownSequence.runShutdown(shutdownOverlay);
            
            // After shutdown completes, navigate to levels overview in actual browser
            this.navigateToLevelsOverview();
            
        } catch (error) {
            console.error('Failed to run shutdown sequence:', error);
            // Fallback to direct navigation if shutdown fails
            setTimeout(() => {
                this.navigateToLevelsOverview();
            }, 1000);
        } finally {
            // Clean up shutdown overlay
            if (shutdownOverlay.parentNode) {
                shutdownOverlay.remove();
            }
        }
    }

    navigateToLevelsOverview() {
        // Navigate to levels overview in the actual browser (not simulated browser)
        window.location.href = '/levels';
    }

    async retryTraining() {
        // First record the end time by calling completeLevel2
        await this.completeLevel2(true); // Pass true to indicate this is a retry
    }

    async startRetryProcess() {
        // Show loading state
        const loadingModal = document.createElement('div');
        loadingModal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50';
        loadingModal.innerHTML = `
            <div class="bg-gray-800 p-8 rounded text-center max-w-md mx-4">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
                <h3 class="text-xl font-semibold text-white mb-2">Preparing Your Training Session</h3>
                <p class="text-gray-300">Loading your progress and resetting the simulation...</p>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-6">
                    <div class="bg-blue-600 h-2.5 rounded-full animate-pulse" style="width: 80%"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // First, save any pending progress
            if (this.emailApp && typeof this.emailApp.saveProgress === 'function') {
                await this.emailApp.saveProgress();
            }
            
            // Clear any client-side state that might interfere with retry
            localStorage.setItem('cyberquest_level_2_retry', 'true');
            
            // Reload the level with retry flag
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error during retry training:', error);
            if (loadingModal && loadingModal.parentNode) {
                loadingModal.innerHTML = `
                    <div class="bg-gray-800 p-8 rounded text-center max-w-md mx-4">
                        <div class="text-red-500 text-5xl mb-4">⚠️</div>
                        <h3 class="text-xl font-semibold text-white mb-2">Error Resetting Training</h3>
                        <p class="text-gray-300 mb-4">There was an error preparing your training session. Please try again or refresh the page.</p>
                        <button onclick="window.location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors">
                            <i class="bi bi-arrow-clockwise mr-2"></i> Refresh Page
                        </button>
                    </div>
                `;
            }
        } finally {
            // Ensure loading modal is removed if still present after a short delay
            if (loadingModal && loadingModal.parentNode) {
                setTimeout(() => {
                    if (loadingModal.parentNode) {
                        loadingModal.remove();
                    }
                }, 5000);
            }
        }
    }

    async startNewSession() {
        try {
            // Start a new session without clearing previous attempts
            const response = await fetch('/levels/api/level/2/new-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (response.ok) {
                console.log('New Level 2 retry session started');
            } else {
                console.warn('Failed to start new Level 2 retry session');
            }
        } catch (error) {
            console.warn('Failed to start new Level 2 retry session:', error);
        }
    }

    reviewMistakes() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        
        const mistakes = this.lastFeedbackHistory.filter(f => !f.isCorrect);
        
        modal.innerHTML = `
            <div class="bg-gray-800 text-white rounded p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto border border-gray-600">
                <h2 class="text-xl font-bold text-white mb-4">Review Your Mistakes</h2>
                
                ${mistakes.length === 0 ? `
                    <div class="text-center py-8">
                        <div class="text-4xl mb-4">🎯</div>
                        <div class="text-lg font-semibold text-green-400">Perfect Score!</div>
                        <div class="text-gray-400">You didn't make any mistakes in this session.</div>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${mistakes.map((mistake, index) => `
                            <div class="border border-gray-600 rounded p-4 bg-gray-700">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="font-semibold text-white">Email ${index + 1}</div>
                                    <div class="text-xs text-gray-400">${mistake.timestamp}</div>
                                </div>
                                
                                <div class="text-sm text-gray-300 mb-2">
                                    <strong>From:</strong> ${mistake.emailSender}<br>
                                    <strong>Subject:</strong> ${mistake.emailSubject}
                                </div>
                                
                                <div class="bg-red-900/50 border border-red-600 rounded p-3 mb-2">
                                    <div class="text-red-300 font-medium">Your Action: ${mistake.playerAction}</div>
                                    <div class="text-red-400 text-sm">This email was ${mistake.isSuspicious ? 'suspicious' : 'legitimate'}</div>
                                </div>
                                
                                <div class="text-xs text-gray-400">
                                    ${mistake.reasoning || 'Review the email characteristics and learn to identify similar patterns in the future.'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
                
                <div class="text-center mt-6">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors border border-blue-500 cursor-pointer">
                        Close Review
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Reset session summary to initial state
    reset() {
        // EmailSessionSummary doesn't maintain persistent state,
        // it generates reports from feedback data
        console.log('EmailSessionSummary reset completed');
    }
}

/**
 * Simple in-memory feedback store for a single session.
 * Methods: add(feedback), getAll(), clear()
 */
export class InMemoryFeedbackStore {
    constructor() {
        this.items = [];
    }

    add(feedback) {
        if (!feedback) return;
        // Ensure timestamp
        if (!feedback.timestamp) feedback.timestamp = new Date().toISOString();
        this.items.push(feedback);
    }

    getAll() {
        return Array.from(this.items);
    }

    clear() {
        this.items = [];
    }
}
