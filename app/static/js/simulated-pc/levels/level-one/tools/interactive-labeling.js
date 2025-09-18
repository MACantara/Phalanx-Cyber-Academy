import { InteractiveUI } from './interactive-labeling/interactive-ui.js';
import { ModalManager } from './interactive-labeling/modal-manager.js';
import { AnalysisCalculator } from './interactive-labeling/analysis-calculator.js';
import { NavigationHandler } from './interactive-labeling/navigation-handler.js';

export class InteractiveLabeling {
    constructor(browserApp, pageRegistry) {
        this.browserApp = browserApp;
        this.pageRegistry = pageRegistry;
        this.currentPageConfig = null;
        this.labeledElements = new Map();
        this.articleResults = [];
        this.isActive = false;
        this.currentArticleIndex = 0;
        this.totalArticles = 0;
        this.batchAnalysis = null;
        this.analysisSource = 'batch-json';
        this.articlesData = []; // Store all articles data centrally
        this.initialized = false;
        this.selectedElementId = null; // Track currently selected element for labeling
        
        // Initialize modular components
        this.ui = new InteractiveUI(this);
        this.modalManager = new ModalManager(this);
        this.analysisCalculator = new AnalysisCalculator(this);
        this.navigationHandler = new NavigationHandler(this);
        
        // Bind methods to preserve context
        this.handleElementClick = this.handleElementClick.bind(this);
        this.applyLabel = this.applyLabel.bind(this);
        this.submitAnalysis = this.submitAnalysis.bind(this);
        this.nextArticle = this.nextArticle.bind(this);
    }

    async initializeWithArticles(articlesData) {
        if (this.initialized) return;
        
        this.articlesData = articlesData;
        this.totalArticles = articlesData.length;
        this.currentArticleIndex = 0;
        this.initialized = true;
        
        console.log('Interactive labeling initialized with', this.totalArticles, 'articles');
        
        // Start with first article
        await this.loadArticle(0);
    }

    async loadArticle(articleIndex) {
        if (articleIndex < 0 || articleIndex >= this.articlesData.length) {
            console.warn('Invalid article index:', articleIndex);
            return;
        }

        this.cleanupCurrentElements();
        
        this.currentArticleIndex = articleIndex;
        const articleData = this.articlesData[articleIndex];
        
        console.log(`Loading article ${articleIndex + 1} of ${this.totalArticles}:`, 
                    articleData.title?.substring(0, 50) || 'Unknown');

        // No need to add custom styles anymore
        this.loadAnalysisFromBatch(articleData);
        
        setTimeout(() => {
            this.makeElementsInteractive();
            this.ui.showInstructions();
        }, 200);
        
        this.isActive = true;
    }

    async nextArticleHandler() {
        if (this.currentArticleIndex < this.totalArticles - 1) {
            const nextIndex = this.currentArticleIndex + 1;
            
            // Navigate to next article in challenge1Page
            if (window.challenge1Page) {
                window.challenge1Page.currentArticleIndex = nextIndex;
                window.challenge1Page.articleData = this.articlesData[nextIndex];
                window.challenge1Page.updatePageContent();
            }
            
            // Load the new article data
            await this.loadArticle(nextIndex);
        }
    }

    cleanupCurrentElements() {
        // Clear interactive elements and remove Tailwind classes
        document.querySelectorAll('.interactive-element').forEach(el => {
            el.classList.remove(
                'interactive-element', 'cursor-pointer', 'transition-all', 'duration-300', 
                'relative', 'rounded', 'p-1', 'm-1',
                'bg-red-600/20', 'border-2', 'border-red-500',
                'bg-green-600/20', 'border-green-500',
                'bg-gray-600/20', 'border-gray-400',
                'bg-green-600/30', 'border-green-500',
                'bg-red-600/30', 'border-red-500',
                'hover:bg-blue-600/10', 'hover:shadow-lg',
                'ring-2', 'ring-blue-500', 'ring-opacity-75'
            );
            el.removeAttribute('data-element-id');
            el.removeAttribute('data-label');
            el.removeAttribute('data-reasoning');
            el.removeAttribute('title');
            
            if (el._interactiveClickHandler) {
                el.removeEventListener('click', el._interactiveClickHandler);
                delete el._interactiveClickHandler;
            }
        });
        
        this.labeledElements.clear();
        this.selectedElementId = null;
    }

    loadAnalysisFromBatch(articleData) {
        console.log('Loading analysis from batch, articleData keys:', Object.keys(articleData || {}));
        
        // Check if article data has batchAnalysis property (loaded from batch-1.json)
        if (articleData && articleData.batchAnalysis) {
            const batchContent = articleData.batchAnalysis;
            console.log('Found batchAnalysis property with clickable_elements:', batchContent.clickable_elements?.length || 0);
            
            if (batchContent.clickable_elements && Array.isArray(batchContent.clickable_elements)) {
                this.batchAnalysis = batchContent;
                this.analysisSource = 'batch-json';
                console.log(`Using batch-1.json analysis for article:`, batchContent.article_metadata?.title?.substring(0, 50) || 'Unknown');
                console.log('Clickable elements found:', batchContent.clickable_elements.length);
                return;
            }
        }
        
        console.error('No valid batchAnalysis found in article data');
        console.log('Available articleData structure:', {
            keys: Object.keys(articleData || {}),
            hasBatchAnalysis: !!(articleData?.batchAnalysis),
            batchAnalysisKeys: articleData?.batchAnalysis ? Object.keys(articleData.batchAnalysis) : []
        });
        this.batchAnalysis = null;
        this.analysisSource = 'none';
    }

    makeElementsInteractive() {
        if (!this.batchAnalysis || !this.batchAnalysis.clickable_elements || !Array.isArray(this.batchAnalysis.clickable_elements)) {
            console.warn('No valid clickable_elements array found in batch analysis data');
            return;
        }
        
        console.log('Processing clickable elements from batch-1.json:', this.batchAnalysis.clickable_elements.length);
        
        // Map batch-1.json clickable_elements to interactive elements
        const interactiveElements = this.batchAnalysis.clickable_elements.map(element => {
            return {
                selector: `[data-element-id="${element.element_id}"]`,
                id: element.element_id,
                expectedFake: element.expected_label === 'fake',
                label: element.element_name,
                reasoning: element.reasoning || 'No reasoning provided',
                elementText: element.element_text || ''
            };
        });
        
        console.log('Mapped interactive elements:', interactiveElements.map(el => ({
            id: el.id,
            label: el.label,
            expectedFake: el.expectedFake
        })));
        
        let successCount = 0;
        interactiveElements.forEach(elementDef => {
            const element = document.querySelector(elementDef.selector);
            if (element) {
                // Add Tailwind classes for interactive styling
                element.classList.add(
                    'interactive-element', 'cursor-pointer', 'transition-all', 'duration-300', 
                    'relative', 'rounded', 'p-1', 'm-1',
                    'hover:bg-blue-600/10', 'hover:shadow-lg'
                );
                element.setAttribute('data-element-id', elementDef.id);
                element.setAttribute('data-label', elementDef.label);
                element.setAttribute('data-reasoning', elementDef.reasoning);
                element.setAttribute('title', `Click to open label menu for "${elementDef.label}"`);
                
                // Initialize in labeledElements
                this.labeledElements.set(elementDef.id, {
                    labeled: false,
                    labeledAsFake: false,
                    expectedFake: elementDef.expectedFake,
                    label: elementDef.label,
                    reasoning: elementDef.reasoning,
                    element: element,
                    elementText: elementDef.elementText
                });
                
                // Add click event listener
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleElementClick(elementDef.id);
                };
                
                element.addEventListener('click', clickHandler);
                element._interactiveClickHandler = clickHandler;
                
                successCount++;
                console.log(`✅ Successfully made element ${elementDef.id} interactive`);
            } else {
                console.warn(`❌ Element not found for selector: ${elementDef.selector} (element_id: ${elementDef.id})`);
            }
        });
        
        console.log(`Interactive labeling initialized with ${successCount}/${interactiveElements.length} elements`);
    }

    handleElementClick(elementId) {
        const elementData = this.labeledElements.get(elementId);
        if (!elementData) return;
        
        // Remove highlight from all elements
        document.querySelectorAll('.interactive-element').forEach(el => {
            el.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-75');
        });
        
        // Highlight the selected element
        elementData.element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-75');
        
        // Show the dropdown menu next to the clicked element
        this.ui.showDropdownMenu(elementData.element, elementId, elementData.label);
    }

    applyLabel(labelType) {
        if (!this.selectedElementId) return;
        
        const elementData = this.labeledElements.get(this.selectedElementId);
        if (!elementData) return;
        
        // Remove previous styling
        elementData.element.classList.remove(
            'bg-red-600/20', 'border-2', 'border-red-500',
            'bg-green-600/20', 'border-green-500',
            'bg-gray-600/20', 'border-gray-400',
            'ring-2', 'ring-blue-500', 'ring-opacity-75'
        );
        
        // Apply new label and styling
        switch (labelType) {
            case 'fake':
                elementData.labeled = true;
                elementData.labeledAsFake = true;
                elementData.element.classList.add('bg-red-600/20', 'border-2', 'border-red-500');
                elementData.element.setAttribute('title', `Labeled as: Fake News - ${elementData.label}`);
                break;
            case 'real':
                elementData.labeled = true;
                elementData.labeledAsFake = false;
                elementData.element.classList.add('bg-green-600/20', 'border-2', 'border-green-500');
                elementData.element.setAttribute('title', `Labeled as: Real News - ${elementData.label}`);
                break;
            case 'none':
                elementData.labeled = false;
                elementData.labeledAsFake = false;
                elementData.element.classList.add('bg-gray-600/20', 'border-2', 'border-gray-400');
                elementData.element.setAttribute('title', `No label applied - ${elementData.label}`);
                break;
        }
        
        // Update UI
        this.ui.updateInstructions();
    }

    submitAnalysis() {
        const results = this.analysisCalculator.calculateResults();
        this.modalManager.showFeedback(results);
        
        // Store results for final summary
        this.articleResults.push({
            articleIndex: this.currentArticleIndex,
            articleData: this.articlesData[this.currentArticleIndex],
            results: results,
            timestamp: new Date().toISOString()
        });
        
        // Check if this is the last article
        if (this.currentArticleIndex >= this.totalArticles - 1) {
            setTimeout(() => {
                this.modalManager.showFinalSummary();
                this.navigationHandler.markLevelCompleted();
            }, 3000);
        }
    }

    async nextArticle() {
        // Remove the feedback modal using modalManager
        this.modalManager.removeModal();
        
        // Navigate to next article
        await this.nextArticleHandler();
    }

    continueToNextLevel() {
        this.navigationHandler.continueToNextLevel();
    }

    // Method to handle level completion with server-side tracking
    async completeLevel(isRetry = false) {
        const overallScore = Math.round(
            this.articleResults.reduce((sum, result) => sum + result.results.percentage, 0) / 
            this.articleResults.length
        );
        
        try {
            // Send completion data to server
            const completionData = {
                level_id: 1,
                score: overallScore,
                time_spent: this.getTotalTimeSpent(),
                xp_earned: 100, // Base XP for Level 1
                completion_data: {
                    articleResults: this.articleResults,
                    overallScore: overallScore,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Make API call to mark level as completed
            const response = await fetch('/levels/api/complete/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(completionData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Level 1 completed successfully:', result);
            } else {
                console.error('Failed to mark level as completed');
            }
        } catch (error) {
            console.error('Error completing level:', error);
        }
        
        // Store local completion data as backup
        localStorage.setItem('cyberquest_level_1_completed', 'true');
        localStorage.setItem('cyberquest_level1_score', overallScore.toString());
        
        if (isRetry) {
            // Clear current results
            this.articleResults = [];
            this.currentArticleIndex = 0;
            
            // Remove the modal
            this.modalManager.removeModal();
            
            // Clean up current elements
            this.cleanupCurrentElements();
            
            // Restart the level by reloading the page
            window.location.reload();
        } else {
            // Clean up and navigate to levels page
            this.modalManager.removeModal();
            this.cleanup();
            this.showShutdownSequenceAndNavigate();
        }
    }

    // New method to handle level retry
    retryLevel() {
        // First record the end time by calling completeLevel
        this.completeLevel(true); // Pass true to indicate this is a retry (will reload after completion)
    }

    // Helper method to calculate total time spent
    getTotalTimeSpent() {
        // Simple calculation based on number of articles and average time
        // In a real implementation, you'd track actual time spent
        return this.articleResults.length * 120; // 2 minutes per article average
    }

    async showShutdownSequenceAndNavigate() {
        console.log('Starting shutdown sequence before navigation...');
        
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

    cleanup() {
        this.ui.cleanup();
        this.cleanupCurrentElements();
        
        this.isActive = false;
        this.batchAnalysis = null;
        this.analysisSource = 'none';
        this.initialized = false;
        this.selectedElementId = null;
        
        // Only clear global reference if this is the active instance
        if (window.interactiveLabeling === this) {
            window.interactiveLabeling = null;
        }
    }
}