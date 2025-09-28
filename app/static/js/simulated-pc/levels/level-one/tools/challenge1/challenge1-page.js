import { BasePage } from '../../pages/base-page.js';
import { EventHandlers } from './utils/event-handlers.js';
import { ArticleFormatter } from './utils/article-formatter.js';
import { ProgressBar } from './components/progress-bar.js';
import { ArticleService } from './services/article-service.js';

class Challenge1PageClass extends BasePage {
    constructor() {
        super({
            url: 'https://daily-politico-news.com/breaking-news',
            title: 'Daily Politico News - Breaking News',
            ipAddress: '192.0.2.47',
            securityLevel: 'suspicious',
            useIframe: false,
            security: {
                isHttps: false,
                hasValidCertificate: false,
                threats: ['Phishing attempt', 'Suspicious domain'],
                riskFactors: [
                    'No HTTPS',
                    'New domain (registered 2 weeks ago)',
                    'Sensational headline',
                    'No author information',
                    'No contact information'
                ]
            }
        });
        
        this.eventHandlers = new EventHandlers(this);
        this.articlesData = []; // Store all 15 articles
        this.currentArticleIndex = 0; // Track which article is being displayed
        this.classifiedArticles = new Set(); // Track which articles have been classified
        this.correctClassifications = 0; // Track correct classifications for scoring
        this.fetchPromise = null;
    }

    async createContent() {
        // If we don't have articles data yet, fetch it
        if (this.articlesData.length === 0) {
            try {
                this.articlesData = await ArticleService.fetchMixedNewsArticles();
                
                // Log batch analysis availability
                const batchAnalysisCount = this.articlesData.filter(article => 
                    article.batchAnalysis && Object.keys(article.batchAnalysis).length > 0
                ).length;
                console.log(`Articles loaded: ${this.articlesData.length}, Batch analysis available: ${batchAnalysisCount}`);
                
                // Log detailed info about first article's batch analysis
                if (this.articlesData.length > 0 && this.articlesData[0].batchAnalysis) {
                    console.log('First article batch analysis:', {
                        clickableElements: this.articlesData[0].batchAnalysis.clickable_elements?.length || 0,
                        metadata: this.articlesData[0].batchAnalysis.article_metadata?.title?.substring(0, 50) || 'No title'
                    });
                }
                
                // Update page metadata based on the first article
                this.title = `${this.articlesData[0].title} - Daily Politico News`;
                this.articleData = this.articlesData[0]; // Set current article for overlay tools
            } catch (error) {
                console.error('Failed to fetch mixed news articles:', error);
                return ArticleService.createErrorContent();
            }
        }

        return this.generateNewsPageHTML();
    }

    generateNewsPageHTML() {
        if (this.articlesData.length === 0) {
            return ArticleService.createErrorContent();
        }

        const currentArticle = this.articlesData[this.currentArticleIndex];
        
        // Format the published date for display
        const formattedDate = ArticleFormatter.formatDate(currentArticle.published);
        
        // Truncate text if too long for better display
        const displayText = ArticleFormatter.truncateText(currentArticle.text, 1200);
        
        // Add suspicious elements only subtly for fake news
        const isFakeNews = !currentArticle.is_real;
        
        return `
            <div class="font-sans bg-white min-h-screen w-full">
                <!-- Header Section -->
                <section class="bg-gray-800 text-white p-5 w-full">
                    <div class="flex justify-between items-center max-w-4xl mx-auto">
                        <div>
                            <h1 class="m-0 text-3xl">Daily Politico News</h1>
                            <p class="mt-1 mb-0 text-gray-400">Your Source for News and Analysis</p>
                        </div>
                        
                        <!-- Progress Bar -->
                        ${ProgressBar.create(this.currentArticleIndex, this.articlesData.length, this.classifiedArticles.size)}
                    </div>
                </section>
                
                <!-- Content Section -->
                <section class="w-full">
                    <div class="px-8 py-6 max-w-4xl mx-auto">
                        <h2 class="text-slate-900 text-3xl mb-3" data-element-type="title" data-element-id="title_analysis">
                            ${ArticleFormatter.toTitleCase(currentArticle.title)}
                        </h2>
                        
                        <!-- Article Metadata -->
                        <div class="text-gray-700 mb-5 text-sm flex gap-4 flex-wrap items-center">
                            <span data-element-type="date" data-element-id="date_analysis" class="px-2 py-1 bg-slate-50 border border-slate-200 rounded flex items-center gap-1 text-slate-800">
                                <i class="bi bi-calendar-event text-xs"></i>
                                Published: ${formattedDate}
                            </span>
                            <span class="text-slate-500">•</span>
                            <span data-element-type="author" data-element-id="author_analysis" class="px-2 py-1 bg-slate-50 border border-slate-200 rounded flex items-center gap-1 text-slate-800">
                                <i class="bi bi-pencil text-xs"></i>
                                By: ${currentArticle.author || 'Staff Reporter'}
                            </span>
                            <span class="text-slate-500">•</span>
                            <span data-element-type="source" data-element-id="source_analysis" class="px-2 py-1 bg-sky-50 border border-sky-500 rounded flex items-center gap-1">
                                <i class="bi bi-globe text-xs"></i>
                                <strong class="text-sky-800">Source:</strong>
                                <span class="text-sky-800 font-mono text-xs">${currentArticle.source || 'Unknown'}</span>
                            </span>
                        </div>
                        
                        <!-- Article Text -->
                        <div class="text-lg leading-relaxed text-slate-800 mb-6" data-element-type="content" data-element-id="content_analysis">
                            ${ArticleFormatter.formatArticleText(displayText, isFakeNews, currentArticle)}
                        </div>
                        
                        <!-- Classification Interface -->
                        <div class="mt-6 mb-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 class="mt-0 text-slate-800 text-xl">Classify this Article</h3>
                            <p class="text-slate-600 mb-5">Based on your analysis, is this article real or fake news?</p>
                            
                            <div class="flex gap-4 mb-5">
                                <button id="classify-real" 
                                        class="flex-1 px-5 py-3 bg-emerald-500 text-white border-none rounded-md text-base cursor-pointer transition-colors hover:bg-emerald-600">
                                    <i class="bi bi-newspaper me-2"></i> Real News
                                </button>
                                <button id="classify-fake" 
                                        class="flex-1 px-5 py-3 bg-red-500 text-white border-none rounded-md text-base cursor-pointer transition-colors hover:bg-red-600">
                                    <i class="bi bi-exclamation-triangle me-2"></i> Fake News
                                </button>
                            </div>
                            
                            <div id="classification-result" class="hidden p-4 rounded-md mt-4">
                                <!-- Result will be shown here -->
                            </div>
                            
                            <div class="text-center mt-5">
                                <span class="text-slate-600 text-sm">
                                    Article ${this.currentArticleIndex + 1} of ${this.articlesData.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Footer Section -->
                <section class="bg-slate-50 p-5 text-center text-slate-600 border-t border-slate-200">
                    <div class="max-w-4xl mx-auto">
                        <p class="mb-3 font-medium text-slate-800">© 2025 Daily Politico News - CyberQuest Training Environment</p>
                        <div class="text-xs leading-relaxed text-slate-700">
                            <p class="my-1">
                                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium"><i class="bi bi-exclamation-triangle"></i> Training Purpose Only</span>
                            </p>
                            <p class="my-1">
                                This is a simulated news website for cybersecurity education. 
                                Articles are sourced from various datasets for educational analysis of misinformation patterns.
                            </p>
                            <p class="my-1 italic">
                                Current article sourced from: <span class="font-mono bg-slate-100 px-1 rounded text-slate-900">${currentArticle.source || 'Training Dataset'}</span>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    // Navigation methods for articles
    nextArticle() {
        if (this.currentArticleIndex < this.articlesData.length - 1) {
            this.currentArticleIndex++;
            this.articleData = this.articlesData[this.currentArticleIndex]; // Update for overlay tools
            this.updatePageContent();
        }
    }

    previousArticle() {
        if (this.currentArticleIndex > 0) {
            this.currentArticleIndex--;
            this.articleData = this.articlesData[this.currentArticleIndex]; // Update for overlay tools
            this.updatePageContent();
        }
    }

    updatePageContent() {
        // Find the browser content element and update it
        const browserContent = document.querySelector('#browser-content');
        if (browserContent) {
            browserContent.innerHTML = this.generateNewsPageHTML();
            
            // Re-bind navigation and classification events
            this.bindClassificationEvents();
            window.challenge1Page = this;
        }
    }

    updateTrainingOverlay() {
        // Check if we have an analysis overlay and update it
        const pageRenderer = this.getPageRenderer();
        if (pageRenderer && pageRenderer.analysisOverlay) {
            pageRenderer.analysisOverlay.updateForNewArticle(this.toPageObject());
        }
    }

    getPageRenderer() {
        // Get the page renderer from the browser app
        const browserApp = document.querySelector('#browser-content')?.closest('.window')?.browserApp;
        return browserApp?.pageRenderer;
    }

    bindEvents(contentElement) {
        // Events are now handled by the overlay in page-renderer
        setTimeout(() => {
            this.eventHandlers.bindAllEvents(document);
            this.bindClassificationEvents();
        }, 100);
    }

    bindClassificationEvents() {
        // Bind classification buttons
        const realBtn = document.getElementById('classify-real');
        const fakeBtn = document.getElementById('classify-fake');

        if (realBtn) {
            realBtn.addEventListener('click', () => this.classifyArticle('real'));
        }
        if (fakeBtn) {
            fakeBtn.addEventListener('click', () => this.classifyArticle('fake'));
        }
    }

    classifyArticle(classification) {
        const currentArticle = this.articlesData[this.currentArticleIndex];
        const isCorrect = (classification === 'real' && currentArticle.is_real) || 
                         (classification === 'fake' && !currentArticle.is_real);
        
        const resultDiv = document.getElementById('classification-result');
        const realBtn = document.getElementById('classify-real');
        const fakeBtn = document.getElementById('classify-fake');
        
        // Disable buttons after classification
        realBtn.disabled = true;
        fakeBtn.disabled = true;
        realBtn.classList.add('opacity-60');
        fakeBtn.classList.add('opacity-60');
        
        // Show result
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('block');
        
        if (isCorrect) {
            resultDiv.className = 'block p-4 rounded-md mt-4 bg-green-100 border border-green-600 text-green-800';
            resultDiv.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="bi bi-check-circle text-xl"></i>
                    <div>
                        <strong>Correct!</strong><br>
                        This article is indeed ${currentArticle.is_real ? 'real' : 'fake'} news.
                    </div>
                </div>
            `;
        } else {
            resultDiv.className = 'block p-4 rounded-md mt-4 bg-red-50 border border-red-600 text-red-600';
            resultDiv.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="bi bi-x-circle text-xl"></i>
                    <div>
                        <strong>Incorrect.</strong><br>
                        This article is actually ${currentArticle.is_real ? 'real' : 'fake'} news.
                    </div>
                </div>
            `;
        }

        // Track correct classifications for scoring
        if (isCorrect) {
            this.correctClassifications++;
        }

        // Show toast notification
        if (window.ToastManager) {
            const message = isCorrect ? 
                `Correct! Article ${this.currentArticleIndex + 1} classified successfully.` :
                `Incorrect. Article ${this.currentArticleIndex + 1} was ${currentArticle.is_real ? 'real' : 'fake'} news.`;
            
            window.ToastManager.showToast(message, isCorrect ? 'success' : 'error');
        }

        // Track that this article has been classified
        this.classifiedArticles.add(this.currentArticleIndex);
        
        // Check if this is the last article
        const isLastArticle = this.currentArticleIndex === this.articlesData.length - 1;
        
        if (isLastArticle) {
            // Check for completion if this was the last article
            this.checkChallengeCompletion();
        } else {
            // Update progress bar after classification
            this.updateProgressBar();
            
            // Auto-advance to next article after 3 seconds
            setTimeout(() => {
                this.nextArticle();
            }, 3000);
        }
    }

    updateProgressBar() {
        // Find and update the progress bar in the header section
        const headerElement = document.querySelector('section');
        if (headerElement) {
            const progressBarHtml = ProgressBar.create(this.currentArticleIndex, this.articlesData.length, this.classifiedArticles.size);
            // Extract just the progress bar div from the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = progressBarHtml;
            const newProgressBar = tempDiv.firstElementChild;
            
            // Find the existing progress bar and replace it
            const existingProgressBar = headerElement.querySelector('.bg-white\\/10, [class*="bg-white/10"]');
            if (existingProgressBar && newProgressBar) {
                existingProgressBar.replaceWith(newProgressBar);
            }
        }
    }

    checkChallengeCompletion() {
        // Complete the challenge when the user has classified all 15 articles
        const totalArticles = this.articlesData.length;
        
        if (this.classifiedArticles.size >= totalArticles) {
            // Mark challenge as completed after a short delay
            setTimeout(() => {
                this.completeChallenge();
            }, 2000);
        }
    }

    completeChallenge() {
        // Mark challenge 1 as completed
        localStorage.setItem('cyberquest_challenge1_completed', 'true');
        
        // Calculate final score
        const finalScore = Math.round((this.correctClassifications / this.articlesData.length) * 100);
        
        // Show completion message
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-[10000]';
        modal.innerHTML = `
            <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-lg mx-4 text-center shadow-2xl">
                <div class="text-5xl mb-4"><i class="bi bi-party-popper"></i></div>
                <h2 class="text-emerald-400 text-2xl font-bold mb-4">Challenge Complete!</h2>
                <p class="text-gray-300 mb-5 leading-relaxed">
                    Excellent work! You've successfully classified all ${this.articlesData.length} articles and completed Level 1: The Misinformation Maze!
                </p>
                <div class="bg-gray-600 border border-gray-500 p-4 rounded-md mb-5">
                    <div class="text-gray-100 text-lg font-bold mb-2">Final Score: ${finalScore}%</div>
                    <div class="text-gray-400 text-sm">Correct Classifications: ${this.correctClassifications}/${this.articlesData.length}</div>
                </div>
                <div class="bg-green-900 border border-green-700 p-3 rounded-md mb-5">
                    <p class="text-green-200 text-sm m-0">
                        <i class="bi bi-trophy me-2"></i>You've earned XP in Information Literacy and unlocked the 'Fact-Checker' badge!
                    </p>
                </div>
                <button onclick="this.closest('.fixed').remove(); window.challenge1Page?.completeLevelOne?.()" 
                        class="bg-emerald-500 text-white px-6 py-3 border border-emerald-600 rounded-md text-base cursor-pointer transition-all w-full hover:bg-emerald-600 hover:shadow-md">
                    Complete Level
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    completeLevelOne() {
        // Mark Level 1 as completed
        localStorage.setItem('cyberquest_level_1_completed', 'true');
        localStorage.setItem('cyberquest_challenge1_completed', 'true');
        
        console.log('Level 1 marked as completed:', {
            level_completed: localStorage.getItem('cyberquest_level_1_completed'),
            challenge_completed: localStorage.getItem('cyberquest_challenge1_completed'),
            articlesClassified: this.classifiedArticles.size
        });
        
        // Get session ID from level data
        const levelData = window.currentSimulation?.level;
        const sessionId = levelData?.session_id;
        
        // Calculate final score
        const finalScore = Math.round((this.correctClassifications / this.articlesData.length) * 100);
        
        // End the session via API if session ID is available
        if (sessionId) {
            this.endSession(sessionId, finalScore);
        } else {
            console.warn('No session ID found, skipping session end API call');
        }
        
        // Navigate back to levels overview in the actual browser (not simulation)
        setTimeout(() => {
            // Exit the simulation and go to actual levels page
            window.location.href = '/levels';
        }, 1000);
    }

    async endSession(sessionId, score) {
        try {
            console.log('[Challenge1] Ending session:', sessionId, 'with score:', score);

            // Import centralized utilities
            const { GameProgressManager } = await import('/static/js/utils/game-progress-manager.js');
            const progressManager = new GameProgressManager();

            // First, attach to the existing session that was started externally
            const startTime = parseInt(localStorage.getItem('challenge1_start_time') || Date.now());
            progressManager.attachToExistingSession(
                sessionId,
                1, // Level ID
                'The-Misinformation-Maze', // Level name
                'beginner', // Difficulty
                startTime
            );

            // Now complete the level using the centralized system
            const sessionResult = await progressManager.completeLevel(score, {
                articlesClassified: this.classifiedArticles.size,
                correctClassifications: this.correctClassifications,
                accuracy: (this.correctClassifications / this.classifiedArticles.size) * 100,
                completionTime: Date.now() - startTime,
                levelId: 1,
                metrics: {
                    articlesClassified: this.classifiedArticles.size,
                    correctClassifications: this.correctClassifications,
                    accuracy: (this.correctClassifications / this.classifiedArticles.size) * 100,
                    completionTime: Date.now() - startTime
                }
            });

            if (sessionResult) {
                console.log('[Challenge1] Session ended successfully with centralized system:', sessionResult);
                
                // Show toast with XP earned
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
                console.error('[Challenge1] Centralized session end failed: no result returned');
            }
        } catch (error) {
            console.error('[Challenge1] Error ending session with centralized system:', error);
        }
        return null;
    }

    toPageObject() {
        const pageInstance = this;
        return {
            url: this.url,
            title: this.title,
            ipAddress: this.ipAddress,
            securityLevel: this.securityLevel,
            security: this.security,
            useIframe: this.useIframe,
            createContent: () => pageInstance.createContent(),
            bindEvents: (contentElement) => pageInstance.bindEvents(contentElement),
            articleData: pageInstance.articleData // Make sure articleData is accessible
        };
    }
}

// Set up global reference for navigation
window.challenge1Page = new Challenge1PageClass();

// Export as page object for compatibility
export const Challenge1Page = window.challenge1Page.toPageObject();