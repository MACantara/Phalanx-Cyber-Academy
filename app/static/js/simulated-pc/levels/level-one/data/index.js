/**
 * Level 1 Data
 * Misinformation detection scenario data
 * Now loads from news_articles_cleaned.csv
 */

export const Level1Data = {
    // Data source configuration
    dataSource: {
        type: 'csv',
        file: 'news_articles_cleaned.csv',
        api_endpoint: '/api/news/mixed-articles'
    },
    
    // Article selection criteria
    articleSelection: {
        fake_articles: 8,
        real_articles: 7,
        total: 15,
        shuffle: true
    },
    
    // Required fields from CSV
    requiredFields: [
        'author',
        'published', 
        'title_without_stopwords',
        'text_without_stopwords',
        'site_url',
        'label' // For checking only, not displayed
    ],
    
    // Source verification database (can be expanded based on CSV data)
    sourceDatabase: {
        // This will be populated dynamically based on site_url values from CSV
        'default': { credibility: 'unknown', bias: 'unknown' }
    },
    
    // Training configuration
    trainingConfig: {
        showLabels: false, // Hide true labels during training
        enableHints: true,
        enableAnalysis: true,
        randomizeOrder: true
    }
};

export default Level1Data;
