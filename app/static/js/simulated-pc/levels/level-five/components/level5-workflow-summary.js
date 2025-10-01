/**
 * Level 5 Workflow Summary Component
 * Displays detailed analysis of forensic workflow actions
 */

export class Level5WorkflowSummary {
    constructor(investigationTracker, stats) {
        this.investigationTracker = investigationTracker;
        this.stats = stats;
        this.element = null;
        this.isVisible = false;
    }

    static createAndShow(investigationTracker, stats) {
        const summary = new Level5WorkflowSummary(investigationTracker, stats);
        summary.show();
        return summary;
    }

    createContent() {
        const {
            score = 0,
            totalPossible = 500,
            objectivesCompleted = 0,
            evidenceAnalyzed = 0,
            correctActions = 0,
            incorrectActions = 0,
            complianceScore = 0,
            correctActionsList = [],
            incorrectActionsList = []
        } = this.stats;

        // Calculate performance metrics
        const scorePercentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
        const overallGrade = this.calculateGrade(scorePercentage);
        const performanceBadge = this.getPerformanceBadge(scorePercentage);

        return `
            <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[10001] p-2 sm:p-4">
                <div class="bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-red-700 to-red-600 p-3 sm:p-4 lg:p-6 border-b border-gray-600 flex-shrink-0">
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div class="min-w-0 flex-1">
                                <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center break-words">
                                    <i class="bi bi-clipboard-data mr-2 sm:mr-3 text-yellow-400 flex-shrink-0"></i>
                                    <span class="break-words">Digital Forensics Investigation Analysis</span>
                                </h2>
                                <p class="text-red-200 mt-1 text-sm sm:text-base">Hunt for The Null - Workflow Assessment</p>
                            </div>
                            <div class="text-center sm:text-right flex-shrink-0">
                                <div class="text-2xl sm:text-3xl font-bold text-yellow-400">${performanceBadge}</div>
                                <div class="text-xs sm:text-sm text-red-200">${overallGrade} Performance</div>
                            </div>
                        </div>
                    </div>

                    <!-- Scrollable Content -->
                    <div class="flex-1 overflow-y-auto">
                        <!-- Summary Cards -->
                        <div class="p-3 sm:p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <!-- Score Card -->
                            <div class="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                                <div class="text-yellow-400 text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-center">
                                    <i class="bi bi-trophy mr-2 flex-shrink-0"></i>
                                    <span>Final Score</span>
                                </div>
                                <div class="text-2xl sm:text-3xl font-bold text-white">${score}</div>
                                <div class="text-gray-400 text-xs sm:text-sm">out of ${totalPossible} points</div>
                                <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                                         style="width: ${scorePercentage}%"></div>
                                </div>
                                <div class="text-xs sm:text-sm text-gray-300 mt-1">${scorePercentage}% Achievement</div>
                            </div>

                            <!-- Objectives Card -->
                            <div class="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                                <div class="text-blue-400 text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-center">
                                    <i class="bi bi-bullseye mr-2 flex-shrink-0"></i>
                                    <span>Objectives</span>
                                </div>
                                <div class="text-2xl sm:text-3xl font-bold text-white">${objectivesCompleted}</div>
                                <div class="text-gray-400 text-xs sm:text-sm">out of 5 completed</div>
                                <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                                         style="width: ${(objectivesCompleted / 5) * 100}%"></div>
                                </div>
                                <div class="text-xs sm:text-sm text-gray-300 mt-1">${Math.round((objectivesCompleted / 5) * 100)}% Complete</div>
                            </div>

                            <!-- Compliance Card -->
                            <div class="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 sm:col-span-2 lg:col-span-1">
                                <div class="text-purple-400 text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-center">
                                    <i class="bi bi-shield-check mr-2 flex-shrink-0"></i>
                                    <span>Compliance</span>
                                </div>
                                <div class="text-2xl sm:text-3xl font-bold text-white">${complianceScore}%</div>
                                <div class="text-gray-400 text-xs sm:text-sm">forensic standards</div>
                                <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                                         style="width: ${complianceScore}%"></div>
                                </div>
                                <div class="text-xs sm:text-sm text-gray-300 mt-1">${this.getComplianceRating(complianceScore)}</div>
                            </div>
                        </div>

                        <!-- Workflow Analysis -->
                        <div class="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                            <h3 class="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                                <i class="bi bi-diagram-3 mr-2 text-green-400 flex-shrink-0"></i>
                                <span>Forensic Workflow Analysis</span>
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <!-- Correct Actions -->
                                <div class="bg-green-900/20 border border-green-600 rounded-lg p-3 sm:p-4">
                                    <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-green-400 mb-2 sm:mb-3 flex items-center">
                                        <i class="bi bi-check-circle mr-2 flex-shrink-0"></i>
                                        <span>Correct Procedures (${correctActions})</span>
                                    </h4>
                                    <div class="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                                        ${correctActionsList.length > 0 ? correctActionsList.map(action => `
                                            <div class="bg-green-800/30 rounded p-2 text-xs sm:text-sm">
                                                <div class="text-green-300 font-medium break-words">${this.formatActionName(action.action)}</div>
                                                ${action.details ? `<div class="text-green-200 text-xs mt-1 break-words">${this.formatActionDetails(action.details)}</div>` : ''}
                                            </div>
                                        `).join('') : '<div class="text-gray-400 text-xs sm:text-sm text-center py-4">No correct actions recorded</div>'}
                                    </div>
                                </div>

                                <!-- Incorrect Actions -->
                                <div class="bg-red-900/20 border border-red-600 rounded-lg p-3 sm:p-4">
                                    <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-red-400 mb-2 sm:mb-3 flex items-center">
                                        <i class="bi bi-exclamation-triangle mr-2 flex-shrink-0"></i>
                                        <span>Procedure Violations (${incorrectActions})</span>
                                    </h4>
                                    <div class="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                                        ${incorrectActionsList.length > 0 ? incorrectActionsList.map(action => `
                                            <div class="bg-red-800/30 rounded p-2 text-xs sm:text-sm">
                                                <div class="text-red-300 font-medium break-words">${this.formatActionName(action.action)}</div>
                                                ${action.details ? `<div class="text-red-200 text-xs mt-1 break-words">${this.formatActionDetails(action.details)}</div>` : ''}
                                                <div class="text-yellow-300 text-xs mt-1">
                                                    <i class="bi bi-lightbulb mr-1"></i>
                                                    <span class="break-words">${this.getImprovementSuggestion(action.action)}</span>
                                                </div>
                                            </div>
                                        `).join('') : '<div class="text-gray-400 text-xs sm:text-sm text-center py-4">No procedure violations - excellent work!</div>'}
                                    </div>
                                </div>
                            </div>

                            <!-- Best Practices Summary -->
                            <div class="mt-4 sm:mt-6 bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                                <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-yellow-400 mb-2 sm:mb-3 flex items-center">
                                    <i class="bi bi-lightbulb mr-2 flex-shrink-0"></i>
                                    <span>Digital Forensics Best Practices Assessment</span>
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    ${this.generateBestPracticesAssessment()}
                                </div>
                            </div>

                            <!-- Performance Recommendations -->
                            <div class="mt-4 sm:mt-6 bg-blue-900/20 border border-blue-600 rounded-lg p-3 sm:p-4">
                                <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-blue-400 mb-2 sm:mb-3 flex items-center">
                                    <i class="bi bi-person-gear mr-2 flex-shrink-0"></i>
                                    <span>Performance Recommendations</span>
                                </h4>
                                <div class="space-y-2 text-xs sm:text-sm text-blue-200">
                                    ${this.generateRecommendations().map(rec => `
                                        <div class="flex items-start">
                                            <i class="bi bi-arrow-right text-blue-400 mr-2 mt-0.5 flex-shrink-0"></i>
                                            <span class="break-words">${rec}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Fixed Footer with Navigation Buttons -->
                    <div class="border-t border-gray-700 bg-gray-800 p-3 sm:p-4 lg:p-6 flex-shrink-0">
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto">
                            <button 
                                id="retry-level5-btn"
                                onclick="window.level5WorkflowSummary?.retryLevel()"
                                class="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center text-sm sm:text-base min-h-[44px] touch-manipulation"
                            >
                                <i class="bi bi-arrow-clockwise mr-2 flex-shrink-0"></i>
                                <span>Retry Level 5</span>
                            </button>
                            <button 
                                id="levels-overview-btn"
                                onclick="window.level5WorkflowSummary?.navigateToLevels()"
                                class="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center text-sm sm:text-base min-h-[44px] touch-manipulation"
                            >
                                <i class="bi bi-grid mr-2 flex-shrink-0"></i>
                                <span>Back to Levels</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    show() {
        if (this.isVisible) return;

        this.element = document.createElement('div');
        this.element.innerHTML = this.createContent();
        
        // Set initial animation styles
        const modal = this.element.querySelector('.bg-gray-900');
        if (modal) {
            modal.style.transform = 'scale(0.9)';
            modal.style.opacity = '0';
            modal.style.transition = 'all 0.3s ease-out';
        }
        
        document.body.appendChild(this.element);

        // Prevent body scrolling on mobile
        document.body.style.overflow = 'hidden';

        // Make globally accessible
        window.level5WorkflowSummary = this;

        // Add entrance animation
        setTimeout(() => {
            if (modal) {
                modal.style.transform = 'scale(1)';
                modal.style.opacity = '1';
            }
        }, 50);

        // Add keyboard event listeners
        this.setupKeyboardEvents();

        this.isVisible = true;
        console.log('[Level5WorkflowSummary] Summary displayed with responsive design');
    }

    setupKeyboardEvents() {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                this.navigateToLevels();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        
        // Store reference to remove later
        this.keyboardHandler = handleKeyPress;
    }

    close() {
        if (!this.isVisible) return;

        // Remove keyboard event listener
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        // Restore body scrolling
        document.body.style.overflow = '';

        // Add exit animation
        if (this.element) {
            const modal = this.element.querySelector('.bg-gray-900');
            if (modal) {
                modal.style.transform = 'scale(0.9)';
                modal.style.opacity = '0';
            }
            this.element.style.opacity = '0';
            
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }, 300);
        }

        this.isVisible = false;

        // Clean up global reference
        if (window.level5WorkflowSummary === this) {
            delete window.level5WorkflowSummary;
        }

        // Redirect to levels overview
        setTimeout(() => {
            window.location.href = '/levels';
        }, 500);
    }

    retryLevel() {
        if (!this.isVisible) return;

        console.log('[Level5WorkflowSummary] Retrying Level 5');
        
        // Remove keyboard event listener
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        // Restore body scrolling
        document.body.style.overflow = '';
        
        // Add exit animation
        if (this.element) {
            const modal = this.element.querySelector('.bg-gray-900');
            if (modal) {
                modal.style.transform = 'scale(0.9)';
                modal.style.opacity = '0';
            }
            this.element.style.opacity = '0';
            
            setTimeout(() => {
                if (this.element) {
                    this.element.remove();
                }
            }, 300);
        }

        this.isVisible = false;

        // Clean up global reference
        if (window.level5WorkflowSummary === this) {
            window.level5WorkflowSummary = null;
        }

        // Clear level 5 progress and navigate to restart
        localStorage.removeItem('cyberquest_level_5_completed');
        localStorage.removeItem('level5_evidence_analysis_complete');
        localStorage.removeItem('level5_evidence_analysis_data');

        // Navigate to Level 5 restart
        setTimeout(() => {
            window.location.href = '/levels/5';
        }, 500);
    }

    navigateToLevels() {
        if (!this.isVisible) return;

        console.log('[Level5WorkflowSummary] Navigating to levels overview');
        
        // Remove keyboard event listener
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        // Restore body scrolling
        document.body.style.overflow = '';
        
        // Add exit animation
        if (this.element) {
            const modal = this.element.querySelector('.bg-gray-900');
            if (modal) {
                modal.style.transform = 'scale(0.9)';
                modal.style.opacity = '0';
            }
            this.element.style.opacity = '0';
            
            setTimeout(() => {
                if (this.element) {
                    this.element.remove();
                }
            }, 300);
        }

        this.isVisible = false;

        // Clean up global reference
        if (window.level5WorkflowSummary === this) {
            window.level5WorkflowSummary = null;
        }

        // Navigate to levels overview
        setTimeout(() => {
            window.location.href = '/levels';
        }, 500);
    }

    // Helper methods
    calculateGrade(percentage) {
        if (percentage >= 90) return 'Expert';
        if (percentage >= 80) return 'Proficient';
        if (percentage >= 70) return 'Competent';
        if (percentage >= 60) return 'Developing';
        return 'Novice';
    }

    getPerformanceBadge(percentage) {
        if (percentage >= 90) return '🏆';
        if (percentage >= 80) return '🥇';
        if (percentage >= 70) return '🥈';
        if (percentage >= 60) return '🥉';
        return '📋';
    }

    getComplianceRating(score) {
        if (score >= 95) return 'Exemplary';
        if (score >= 85) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 65) return 'Satisfactory';
        return 'Needs Improvement';
    }

    formatActionName(action) {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatActionDetails(details) {
        if (typeof details === 'string') return details;
        if (typeof details === 'object' && details !== null) {
            return Object.entries(details)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        }
        return 'Action completed';
    }

    getImprovementSuggestion(action) {
        const suggestions = {
            'evidence_contaminated': 'Ensure proper chain of custody procedures',
            'hash_verification_skipped': 'Always verify evidence integrity before analysis',
            'improper_documentation': 'Document all actions with timestamps and details',
            'unauthorized_access': 'Follow proper authorization protocols',
            'incomplete_analysis': 'Complete all required analysis steps',
            'default': 'Follow established forensic procedures'
        };
        return suggestions[action] || suggestions.default;
    }

    generateBestPracticesAssessment() {
        const practices = [
            { name: 'Chain of Custody', status: this.stats.complianceScore >= 80 },
            { name: 'Evidence Integrity', status: this.stats.correctActions > 0 },
            { name: 'Proper Documentation', status: this.stats.incorrectActions <= 2 },
            { name: 'Systematic Analysis', status: this.stats.evidenceAnalyzed >= 3 },
            { name: 'Objective Completion', status: this.stats.objectivesCompleted >= 3 },
            { name: 'Professional Standards', status: this.stats.complianceScore >= 70 }
        ];

        return practices.map(practice => `
            <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span class="text-gray-300">${practice.name}</span>
                <span class="${practice.status ? 'text-green-400' : 'text-red-400'}">
                    <i class="bi bi-${practice.status ? 'check-circle-fill' : 'x-circle-fill'}"></i>
                    ${practice.status ? 'Met' : 'Not Met'}
                </span>
            </div>
        `).join('');
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.stats.complianceScore < 80) {
            recommendations.push('Focus on following established forensic procedures to improve compliance');
        }
        
        if (this.stats.incorrectActions > 3) {
            recommendations.push('Review digital forensics best practices to reduce procedural errors');
        }
        
        if (this.stats.evidenceAnalyzed < 4) {
            recommendations.push('Ensure thorough analysis of all available evidence sources');
        }
        
        if (this.stats.objectivesCompleted < 4) {
            recommendations.push('Develop systematic approach to objective completion');
        }
        
        if (this.stats.score < 400) {
            recommendations.push('Practice evidence correlation and timeline reconstruction techniques');
        }

        if (recommendations.length === 0) {
            recommendations.push('Excellent work! Continue applying these high standards in future investigations');
            recommendations.push('Consider pursuing advanced digital forensics certifications');
        }

        return recommendations;
    }
}

export default Level5WorkflowSummary;