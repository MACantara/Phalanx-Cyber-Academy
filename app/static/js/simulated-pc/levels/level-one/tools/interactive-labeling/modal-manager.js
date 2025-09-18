export class ModalManager {
    constructor(labelingSystem) {
        this.labelingSystem = labelingSystem;
    }

    showFeedback(results) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50 feedback-modal';
        
        const scoreClass = results.percentage >= 75 ? 'text-green-400' : results.percentage >= 50 ? 'text-yellow-400' : 'text-red-400';
        const iconClass = results.percentage >= 75 ? 'bi-trophy-fill' : results.percentage >= 50 ? 'bi-hand-thumbs-up-fill' : 'bi-question-circle-fill';
        
        modal.innerHTML = `
            <div class="bg-gray-800 text-white rounded p-6 max-w-md mx-4 border border-gray-600">
                <div class="text-center">
                    <i class="bi ${iconClass} text-4xl ${scoreClass} mb-4"></i>
                    <h2 class="text-xl font-bold mb-4">Analysis Complete!</h2>
                    <div class="text-4xl font-bold my-4 ${scoreClass}">${results.percentage}%</div>
                    <p class="text-gray-300 mb-4">You correctly identified ${results.correctLabels} out of ${results.totalElements} elements.</p>
                    
                    <!-- Quick Summary -->
                    <div class="bg-gray-700 rounded p-4 mb-4">
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div class="text-center">
                                <div class="text-green-400 font-bold flex items-center justify-center gap-1">
                                    <i class="bi bi-check-circle-fill"></i>
                                    ${results.correctLabels}
                                </div>
                                <div class="text-gray-400">Correct</div>
                            </div>
                            <div class="text-center">
                                <div class="text-red-400 font-bold flex items-center justify-center gap-1">
                                    <i class="bi bi-x-circle-fill"></i>
                                    ${results.incorrectLabels}
                                </div>
                                <div class="text-gray-400">Incorrect</div>
                            </div>
                            <div class="text-center">
                                <div class="text-yellow-400 font-bold flex items-center justify-center gap-1">
                                    <i class="bi bi-dash-circle-fill"></i>
                                    ${results.unlabeledElements}
                                </div>
                                <div class="text-gray-400">Unlabeled</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Performance Message -->
                    <div class="text-sm mb-4">
                        ${results.percentage >= 75 ? 
                            '<span class="text-green-400 flex items-center justify-center gap-1"><i class="bi bi-check-circle"></i>Excellent analysis! You have strong detection skills.</span>' :
                            results.percentage >= 50 ?
                            '<span class="text-yellow-400 flex items-center justify-center gap-1"><i class="bi bi-hand-thumbs-up"></i>Good work! Review the final summary for improvement tips.</span>' :
                            '<span class="text-red-400 flex items-center justify-center gap-1"><i class="bi bi-book"></i>Keep learning! The final summary will help you improve.</span>'
                        }
                    </div>
                    
                    <button onclick="window.interactiveLabeling?.nextArticle()" class="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2">
                        ${this.labelingSystem.currentArticleIndex >= this.labelingSystem.totalArticles - 1 ? 
                            '<i class="bi bi-bar-chart-fill"></i>View Detailed Summary' : 
                            '<i class="bi bi-arrow-right-circle-fill"></i>Continue to Next Article'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showFinalSummary() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        
        const overallScore = Math.round(
            this.labelingSystem.articleResults.reduce((sum, result) => sum + result.results.percentage, 0) / 
            this.labelingSystem.articleResults.length
        );
        
        const minimumScore = 70; // 70% minimum to pass
        const hasPassedLevel = overallScore >= minimumScore;
        
        const overallClass = overallScore >= 75 ? 'text-green-400' : overallScore >= 50 ? 'text-yellow-400' : 'text-red-400';
        const batchAnalysisCount = this.labelingSystem.articleResults.filter(result => 
            result.articleData.clickable_elements || 
            (result.articleData.batchAnalysis && Object.keys(result.articleData.batchAnalysis).length > 0)
        ).length;
        
        modal.innerHTML = `
            <div class="bg-gray-800 text-white rounded p-8 max-w-4xl mx-4 max-h-150 overflow-y-auto border border-gray-600">
                <div class="text-center mb-8">
                    <div class="flex items-center justify-center gap-2 mb-4">
                        <i class="bi ${hasPassedLevel ? 'bi-trophy-fill text-yellow-400' : 'bi-arrow-clockwise text-orange-400'} text-3xl"></i>
                        <h1 class="text-3xl font-bold">${hasPassedLevel ? 'Level 1 Complete!' : 'Level 1 - Try Again'}</h1>
                    </div>
                    <div class="text-6xl font-bold mb-4 ${overallClass}">${overallScore}%</div>
                    <p class="text-lg">${hasPassedLevel ? 'Congratulations! You passed Level 1.' : 'You need 70% or higher to pass.'}</p>
                    <p class="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <i class="bi bi-cpu-fill text-blue-400"></i>
                        ${batchAnalysisCount} articles analyzed with AI-powered detection training
                    </p>
                    
                    ${hasPassedLevel ? '' : `
                    <div class="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mt-4">
                        <div class="flex items-center justify-center gap-2 mb-2">
                            <i class="bi bi-info-circle text-orange-400"></i>
                            <h3 class="text-lg font-semibold text-orange-400">Keep Learning!</h3>
                        </div>
                        <p class="text-sm text-gray-300">
                            Don't worry! Cybersecurity skills take practice. Review the detailed analysis below, 
                            then try the level again to improve your score.
                        </p>
                    </div>
                    `}
                </div>
                
                <!-- Detailed Article Analysis -->
                <div class="space-y-4 mb-8">
                    <h2 class="text-xl font-bold text-gray-200 flex items-center gap-2">
                        <i class="bi bi-graph-up text-green-400"></i>
                        Detailed Analysis
                    </h2>
                    ${this.labelingSystem.articleResults.map((result, index) => `
                        <div class="bg-gray-700 border border-gray-600 rounded p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="font-semibold text-lg">Article ${index + 1}</h3>
                                <div class="text-2xl font-bold ${result.results.percentage >= 75 ? 'text-green-400' : result.results.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}">
                                    ${result.results.percentage}%
                                </div>
                            </div>
                            <div class="grid md:grid-cols-3 gap-4 mb-3">
                                <div class="text-center">
                                    <div class="text-green-400 font-bold flex items-center justify-center gap-1">
                                        <i class="bi bi-check-circle-fill"></i>
                                        ${result.results.correctLabels}
                                    </div>
                                    <div class="text-gray-400 text-sm">Correct</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-red-400 font-bold flex items-center justify-center gap-1">
                                        <i class="bi bi-x-circle-fill"></i>
                                        ${result.results.incorrectLabels}
                                    </div>
                                    <div class="text-gray-400 text-sm">Incorrect</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-yellow-400 font-bold flex items-center justify-center gap-1">
                                        <i class="bi bi-dash-circle-fill"></i>
                                        ${result.results.unlabeledElements}
                                    </div>
                                    <div class="text-gray-400 text-sm">Unlabeled</div>
                                </div>
                            </div>
                            <div class="text-sm text-gray-300 bg-gray-800 rounded p-3">
                                <strong>Key Indicators:</strong> ${this.getKeyIndicators(result.articleData)}
                            </div>
                            <div class="text-sm text-blue-300 mt-2">
                                <strong>Learning Tip:</strong> ${this.generateLearningTip(result.results)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Overall Performance Summary -->
                <div class="bg-gray-700 border border-gray-600 rounded p-6 mb-8">
                    <h3 class="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                        <i class="bi bi-trophy text-yellow-400 mr-2"></i>
                        Performance Summary
                    </h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold ${overallClass} mb-2 flex items-center justify-center gap-2">
                                <i class="bi bi-percent"></i>
                                ${overallScore}
                            </div>
                            <div class="text-gray-400 text-sm">Overall Score</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-400 mb-2 flex items-center justify-center gap-2">
                                <i class="bi bi-file-earmark-text-fill"></i>
                                ${this.labelingSystem.articleResults.length}
                            </div>
                            <div class="text-gray-400 text-sm">Articles Analyzed</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
                                <i class="bi bi-collection-fill"></i>
                                ${this.getTotalElementsAnalyzed()}
                            </div>
                            <div class="text-gray-400 text-sm">Elements Reviewed</div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center">
                    ${hasPassedLevel ? `
                        <button onclick="window.interactiveLabeling?.completeLevel()" class="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700 transition-colors font-semibold text-lg cursor-pointer flex items-center justify-center gap-2 mx-auto">
                            <i class="bi bi-house-fill"></i>
                            Return to Levels
                        </button>
                    ` : `
                        <div class="space-y-3">
                            <button onclick="window.interactiveLabeling?.completeLevel()" class="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition-colors font-semibold text-lg cursor-pointer flex items-center justify-center gap-2 mx-auto">
                                <i class="bi bi-save-fill"></i>
                                Save Progress & Exit
                            </button>
                            <button onclick="window.interactiveLabeling?.retryLevel()" class="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2 mx-auto">
                                <i class="bi bi-arrow-repeat"></i>
                                Try Again
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    generateLearningTip(results) {
        if (results.incorrectLabels > results.correctLabels) {
            return "Focus on identifying suspicious patterns like emotional language, urgent calls to action, and unverified sources.";
        } else if (results.unlabeledElements > 2) {
            return "Try to analyze all elements - practice helps build your detection skills.";
        } else {
            return "Good effort! Pay attention to source credibility and factual consistency.";
        }
    }

    getTotalElementsAnalyzed() {
        return this.labelingSystem.articleResults.reduce((total, result) => total + result.results.totalElements, 0);
    }

    getKeyIndicators(articleData) {
        if (!articleData) return "No article data available";
        
        if (articleData.batchAnalysis && articleData.batchAnalysis.clickable_elements) {
            const indicators = articleData.batchAnalysis.clickable_elements
                .map(element => element.reasoning)
                .filter(reasoning => reasoning && reasoning.length > 0)
                .slice(0, 2);
            return indicators.join(', ') || 'Batch analysis available';
        }
        
        if (typeof articleData === 'object') {
            const articleIds = Object.keys(articleData).filter(key => !isNaN(key));
            if (articleIds.length > 0) {
                const articleId = articleIds[this.labelingSystem.currentArticleIndex] || articleIds[0];
                const articleContent = articleData[articleId];
                
                if (articleContent?.clickable_elements && Array.isArray(articleContent.clickable_elements)) {
                    const indicators = articleContent.clickable_elements
                        .map(element => element.reasoning)
                        .filter(reasoning => reasoning && reasoning.length > 0)
                        .slice(0, 2);
                    return indicators.join(', ') || 'Batch analysis available';
                }
            }
        }
        
        if (articleData.clickable_elements && Array.isArray(articleData.clickable_elements)) {
            const indicators = articleData.clickable_elements
                .map(element => element.reasoning)
                .filter(reasoning => reasoning && reasoning.length > 0)
                .slice(0, 2);
            return indicators.join(', ') || 'Batch analysis available';
        }
        
        return 'No clickable elements available';
    }

    removeModal() {
        // Remove any feedback modal by class name
        const modal = document.querySelector('.feedback-modal');
        if (modal) {
            modal.remove();
            return;
        }
        
        // Fallback: remove by combined selector
        const modalAlt = document.querySelector('.fixed.inset-0.bg-black');
        if (modalAlt) {
            modalAlt.remove();
        }
    }
}
