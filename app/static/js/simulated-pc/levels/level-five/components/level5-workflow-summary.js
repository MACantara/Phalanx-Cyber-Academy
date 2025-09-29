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
            <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[10001] p-4">
                <div class="bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-red-700 to-red-600 p-6 border-b border-gray-600">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-2xl font-bold text-white flex items-center">
                                    <i class="bi bi-clipboard-data mr-3 text-yellow-400"></i>
                                    Digital Forensics Investigation Analysis
                                </h2>
                                <p class="text-red-200 mt-1">Hunt for The Null - Workflow Assessment</p>
                            </div>
                            <div class="text-right">
                                <div class="text-3xl font-bold text-yellow-400">${performanceBadge}</div>
                                <div class="text-sm text-red-200">${overallGrade} Performance</div>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Cards -->
                    <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Score Card -->
                        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div class="text-yellow-400 text-lg font-semibold mb-2 flex items-center">
                                <i class="bi bi-trophy mr-2"></i>
                                Final Score
                            </div>
                            <div class="text-3xl font-bold text-white">${score}</div>
                            <div class="text-gray-400">out of ${totalPossible} points</div>
                            <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                                     style="width: ${scorePercentage}%"></div>
                            </div>
                            <div class="text-sm text-gray-300 mt-1">${scorePercentage}% Achievement</div>
                        </div>

                        <!-- Objectives Card -->
                        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div class="text-blue-400 text-lg font-semibold mb-2 flex items-center">
                                <i class="bi bi-bullseye mr-2"></i>
                                Objectives
                            </div>
                            <div class="text-3xl font-bold text-white">${objectivesCompleted}</div>
                            <div class="text-gray-400">out of 5 completed</div>
                            <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                                     style="width: ${(objectivesCompleted / 5) * 100}%"></div>
                            </div>
                            <div class="text-sm text-gray-300 mt-1">${Math.round((objectivesCompleted / 5) * 100)}% Complete</div>
                        </div>

                        <!-- Compliance Card -->
                        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div class="text-purple-400 text-lg font-semibold mb-2 flex items-center">
                                <i class="bi bi-shield-check mr-2"></i>
                                Compliance
                            </div>
                            <div class="text-3xl font-bold text-white">${complianceScore}%</div>
                            <div class="text-gray-400">forensic standards</div>
                            <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                                     style="width: ${complianceScore}%"></div>
                            </div>
                            <div class="text-sm text-gray-300 mt-1">${this.getComplianceRating(complianceScore)}</div>
                        </div>
                    </div>

                    <!-- Workflow Analysis -->
                    <div class="px-6 pb-6">
                        <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                            <i class="bi bi-diagram-3 mr-2 text-green-400"></i>
                            Forensic Workflow Analysis
                        </h3>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Correct Actions -->
                            <div class="bg-green-900/20 border border-green-600 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-green-400 mb-3 flex items-center">
                                    <i class="bi bi-check-circle mr-2"></i>
                                    Correct Procedures (${correctActions})
                                </h4>
                                <div class="space-y-2 max-h-48 overflow-y-auto">
                                    ${correctActionsList.length > 0 ? correctActionsList.map(action => `
                                        <div class="bg-green-800/30 rounded p-2 text-sm">
                                            <div class="text-green-300 font-medium">${this.formatActionName(action.action)}</div>
                                            ${action.details ? `<div class="text-green-200 text-xs mt-1">${this.formatActionDetails(action.details)}</div>` : ''}
                                        </div>
                                    `).join('') : '<div class="text-gray-400 text-sm text-center py-4">No correct actions recorded</div>'}
                                </div>
                            </div>

                            <!-- Incorrect Actions -->
                            <div class="bg-red-900/20 border border-red-600 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-red-400 mb-3 flex items-center">
                                    <i class="bi bi-exclamation-triangle mr-2"></i>
                                    Procedure Violations (${incorrectActions})
                                </h4>
                                <div class="space-y-2 max-h-48 overflow-y-auto">
                                    ${incorrectActionsList.length > 0 ? incorrectActionsList.map(action => `
                                        <div class="bg-red-800/30 rounded p-2 text-sm">
                                            <div class="text-red-300 font-medium">${this.formatActionName(action.action)}</div>
                                            ${action.details ? `<div class="text-red-200 text-xs mt-1">${this.formatActionDetails(action.details)}</div>` : ''}
                                            <div class="text-yellow-300 text-xs mt-1">
                                                <i class="bi bi-lightbulb mr-1"></i>
                                                ${this.getImprovementSuggestion(action.action)}
                                            </div>
                                        </div>
                                    `).join('') : '<div class="text-gray-400 text-sm text-center py-4">No procedure violations - excellent work!</div>'}
                                </div>
                            </div>
                        </div>

                        <!-- Best Practices Summary -->
                        <div class="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <h4 class="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                                <i class="bi bi-lightbulb mr-2"></i>
                                Digital Forensics Best Practices Assessment
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                ${this.generateBestPracticesAssessment()}
                            </div>
                        </div>

                        <!-- Performance Recommendations -->
                        <div class="mt-6 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                                <i class="bi bi-person-gear mr-2"></i>
                                Performance Recommendations
                            </h4>
                            <div class="space-y-2 text-sm text-blue-200">
                                ${this.generateRecommendations().map(rec => `
                                    <div class="flex items-start">
                                        <i class="bi bi-arrow-right text-blue-400 mr-2 mt-0.5"></i>
                                        <span>${rec}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Next Steps -->
                    <div class="text-center p-6">
                        <div class="flex flex-col md:flex-row gap-3 justify-center">
                            <button 
                                id="retry-level5-btn"
                                onclick="window.level5WorkflowSummary?.retryLevel()"
                                class="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center"
                            >
                                <i class="bi bi-arrow-clockwise mr-2"></i>
                                <span>Retry Level 5</span>
                            </button>
                            <button 
                                id="levels-overview-btn"
                                onclick="window.level5WorkflowSummary?.navigateToLevels()"
                                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center"
                            >
                                <i class="bi bi-grid mr-2"></i>
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
        document.body.appendChild(this.element);

        // Make globally accessible
        window.level5WorkflowSummary = this;

        // Add animation
        setTimeout(() => {
            this.element.querySelector('.bg-gray-900').style.transform = 'scale(1)';
            this.element.querySelector('.bg-gray-900').style.opacity = '1';
        }, 100);

        this.isVisible = true;
        console.log('[Level5WorkflowSummary] Summary displayed');
    }

    close() {
        if (!this.isVisible) return;

        // Add exit animation
        if (this.element) {
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
        
        // Add exit animation
        if (this.element) {
            this.element.style.opacity = '0';
            this.element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.element.remove();
            }, 300);
        }

        this.isVisible = false;

        // Clean up global reference
        if (window.level5WorkflowSummary === this) {
            window.level5WorkflowSummary = null;
        }

        // Navigate to Level 5 restart
        setTimeout(() => {
            window.location.href = '/levels/5/start';
        }, 500);
    }

    navigateToLevels() {
        if (!this.isVisible) return;

        console.log('[Level5WorkflowSummary] Navigating to levels overview');
        
        // Add exit animation
        if (this.element) {
            this.element.style.opacity = '0';
            this.element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.element.remove();
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