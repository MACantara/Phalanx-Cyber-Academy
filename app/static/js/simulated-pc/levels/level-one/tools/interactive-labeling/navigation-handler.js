export class NavigationHandler {
    constructor(labelingSystem) {
        this.labelingSystem = labelingSystem;
    }

    async nextArticle() {
        this.labelingSystem.modalManager.removeModal();
        await this.labelingSystem.nextArticleHandler();
    }

    continueToNextLevel() {
        this.labelingSystem.modalManager.removeModal();
        this.labelingSystem.cleanup();
        this.showShutdownSequenceAndNavigate();
    }

    async showShutdownSequenceAndNavigate() {
        console.log('Starting shutdown sequence before navigation...');
        
        // Save completion data first
        const completionData = {
            levelId: 1,
            completed: true,
            score: localStorage.getItem('cyberquest_level1_score'),
            timestamp: new Date().toISOString(),
            results: this.labelingSystem.articleResults
        };
        
        localStorage.setItem('cyberquest_level_1_completion', JSON.stringify(completionData));
        localStorage.setItem('cyberquest_level_1_completed', 'true');
        
        console.log('Level 1 completion stored in localStorage:', {
            completion_flag: localStorage.getItem('cyberquest_level_1_completed'),
            completion_data: localStorage.getItem('cyberquest_level_1_completion')
        });
        
        // Create shutdown overlay
        const shutdownOverlay = document.createElement('div');
        shutdownOverlay.className = 'fixed inset-0 bg-black z-50';
        shutdownOverlay.style.zIndex = '9999';
        document.body.appendChild(shutdownOverlay);
        
        try {
            // Import and run shutdown sequence
            const { ShutdownSequence } = await import('../../../../../../shutdown-sequence.js');
            
            // Run shutdown sequence
            await ShutdownSequence.runShutdown(shutdownOverlay);
            
            // After shutdown completes, navigate to levels overview
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
        console.log('Navigating to levels overview...');
        
        // Navigate to levels overview in the actual browser (not simulated browser)
        window.location.href = '/levels';
    }

    markLevelCompleted() {
        // Store interactive labeling results
        localStorage.setItem('cyberquest_challenge1_interactive_results', 'true');
        
        const overallScore = Math.round(
            this.labelingSystem.articleResults.reduce((sum, result) => sum + result.results.percentage, 0) / 
            this.labelingSystem.articleResults.length
        );
        
        localStorage.setItem('cyberquest_level1_score', overallScore.toString());
        
        console.log('Level 1 analysis completed with score:', overallScore);
        
        // Note: Level completion status will be determined by the modal based on score threshold
        // Don't automatically mark as completed here - let the modal handle pass/fail logic
    }

    canProceedToNextLevel() {
        const overallPerformance = this.labelingSystem.analysisCalculator.getOverallPerformance();
        return overallPerformance && overallPerformance.averageScore >= 60; // 60% minimum to proceed
    }

    getNavigationState() {
        return {
            currentArticle: this.labelingSystem.currentArticleIndex,
            totalArticles: this.labelingSystem.totalArticles,
            hasNextArticle: this.labelingSystem.currentArticleIndex < this.labelingSystem.totalArticles - 1,
            isLastArticle: this.labelingSystem.currentArticleIndex >= this.labelingSystem.totalArticles - 1,
            canProceed: this.canProceedToNextLevel()
        };
    }
}
