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
            <div style="font-family: Arial, sans-serif; background: #ffffff; min-height: 100vh;">
                <!-- Header -->
                <header style="background: #1f2937; color: white; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h1 style="margin: 0; font-size: 28px;">Daily Politico News</h1>
                            <p style="margin: 5px 0 0 0; color: #9ca3af;">Your Source for News and Analysis</p>
                        </div>
                        
                        <!-- Progress Bar -->
                        ${ProgressBar.create(this.currentArticleIndex, this.articlesData.length, this.classifiedArticles.size)}
                    </div>
                </header>
                
                <!-- Main Content -->
                <main style="padding: 30px; max-width: 800px; margin: 0 auto;">
                    <h2 style="color: #374151; font-size: 32px; margin-bottom: 10px;" data-element-type="title" data-element-id="title_analysis">
                        ${ArticleFormatter.toTitleCase(currentArticle.title)}
                    </h2>
                    
                    <div style="color: #6b7280; margin-bottom: 20px; font-size: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <span data-element-type="date" data-element-id="date_analysis" style="padding: 2px 4px; border-radius: 3px;">Published: ${formattedDate}</span>
                        <span style="color: #d1d5db;">|</span>
                        <span data-element-type="author" data-element-id="author_analysis" style="padding: 2px 4px; border-radius: 3px;">By: ${currentArticle.author || 'Staff Reporter'}</span>
                    </div>
                    
                    <!-- Article Text -->
                    <div style="font-size: 18px; line-height: 1.6; color: #374151;" data-element-type="content" data-element-id="content_analysis">
                        ${ArticleFormatter.formatArticleText(displayText, isFakeNews, currentArticle)}
                    </div>
                    
                    <!-- Classification Interface -->
                    <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h3 style="margin-top: 0; color: #374151; font-size: 20px;">Classify this Article</h3>
                        <p style="color: #6b7280; margin-bottom: 20px;">Based on your analysis, is this article real or fake news?</p>
                        
                        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                            <button id="classify-real" 
                                    style="flex: 1; padding: 12px 20px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.2s;"
                                    onmouseover="this.style.background='#059669'" 
                                    onmouseout="this.style.background='#10b981'">
                                📰 Real News
                            </button>
                            <button id="classify-fake" 
                                    style="flex: 1; padding: 12px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.2s;"
                                    onmouseover="this.style.background='#dc2626'" 
                                    onmouseout="this.style.background='#ef4444'">
                                ⚠️ Fake News
                            </button>
                        </div>
                        
                        <div id="classification-result" style="display: none; padding: 15px; border-radius: 6px; margin-top: 15px;">
                            <!-- Result will be shown here -->
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <span style="color: #6b7280; font-size: 14px;">
                                Article ${this.currentArticleIndex + 1} of ${this.articlesData.length}
                            </span>
                        </div>
                    </div>
                </main>
                
                <!-- Footer -->
                <footer style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>© 2024 Daily Politico News | Contact: tips@daily-politico-news.com</p>
                    <p style="font-size: 12px;">
                        This website is for CyberQuest training purposes. Article source: ${currentArticle.source}
                    </p>
                </footer>
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
        realBtn.style.opacity = '0.6';
        fakeBtn.style.opacity = '0.6';
        
        // Show result
        resultDiv.style.display = 'block';
        
        if (isCorrect) {
            resultDiv.style.background = '#dcfce7';
            resultDiv.style.border = '1px solid #16a34a';
            resultDiv.style.color = '#15803d';
            resultDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">✅</span>
                    <div>
                        <strong>Correct!</strong><br>
                        This article is indeed ${currentArticle.is_real ? 'real' : 'fake'} news.
                    </div>
                </div>
            `;
        } else {
            resultDiv.style.background = '#fef2f2';
            resultDiv.style.border = '1px solid #dc2626';
            resultDiv.style.color = '#dc2626';
            resultDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">❌</span>
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
        // Find and update the progress bar in the header
        const headerElement = document.querySelector('header');
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
        modal.className = 'fixed inset-0 bg-black/75 flex items-center justify-center z-50';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 24px; max-width: 500px; margin: 16px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h2 style="color: #16a34a; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Challenge Complete!</h2>
                <p style="color: #374151; margin-bottom: 20px;">
                    Excellent work! You've successfully classified all ${this.articlesData.length} articles and completed Level 1: The Misinformation Maze!
                </p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                    <div style="color: #374151; font-size: 18px; font-weight: bold;">Final Score: ${finalScore}%</div>
                    <div style="color: #6b7280; font-size: 14px;">Correct Classifications: ${this.correctClassifications}/${this.articlesData.length}</div>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                    You've earned XP in Information Literacy and unlocked the 'Fact-Checker' badge.
                </p>
                <button onclick="this.closest('.fixed').remove(); window.challenge1Page?.completeLevelOne?.()" 
                        style="background: #16a34a; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
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
        
        // Navigate back to levels overview in the actual browser (not simulation)
        setTimeout(() => {
            // Exit the simulation and go to actual levels page
            window.location.href = '/levels';
        }, 1000);
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