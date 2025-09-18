export class ArticleService {
    static async fetchMixedNewsArticles() {
        try {
            console.log('Fetching news articles from CSV data...');
            
            const response = await fetch('/api/news/mixed-articles');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.articles) {
                console.log('News articles loaded from CSV data:', {
                    total: data.articles.length,
                    real: data.summary.real_count,
                    fake: data.summary.fake_count,
                    firstArticle: {
                        title: data.articles[0].title.substring(0, 50) + '...',
                        source: data.articles[0].source,
                        author: data.articles[0].author,
                        isReal: data.articles[0].is_real
                    }
                });
                
                return data.articles;
            } else {
                throw new Error(data.error || 'Failed to get news articles');
            }
        } catch (error) {
            console.error('Error fetching news articles:', error);
            throw error;
        }
    }

    static async fetchNewsStats() {
        try {
            const response = await fetch('/api/news/stats');
            const data = await response.json();
            
            if (data.success) {
                return data.stats;
            } else {
                console.error('Failed to fetch news stats:', data.error);
                throw new Error(data.error || 'Failed to fetch stats');
            }
        } catch (error) {
            console.error('Error fetching news stats:', error);
            throw error;
        }
    }

    static createErrorContent() {
        return `
            <div style="font-family: Arial, sans-serif; background: #ffffff; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; max-width: 500px; padding: 20px;">
                    <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">⚠️ Error Loading Articles</h1>
                    <p style="color: #6b7280; margin-bottom: 20px;">
                        Unable to load news articles from CSV data. Please check if the data is available and properly formatted.
                    </p>
                    <button onclick="location.reload()" style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
}