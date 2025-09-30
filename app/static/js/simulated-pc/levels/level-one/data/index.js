/**
 * Level 1 Data
 * Misinformation detection scenario data
 * Now loads from news_articles.json with comprehensive real/fake article dataset
 */

export const Level1Data = {
    // Data source configuration
    dataSource: {
        type: 'json',
        file: 'news_articles.json',
        api_endpoint: '/api/news/mixed-articles'
    },
    
    // Article selection criteria
    articleSelection: {
        fake_articles: 8,
        real_articles: 7,
        total: 15,
        shuffle: true
    },
    
    // Required fields from JSON
    requiredFields: [
        'author',
        'date', 
        'title',
        'content',
        'website',
        'label' // 0=real, 1=fake
    ],
    
    // Source verification database for misinformation detection training
    sourceDatabase: {
        // Legitimate news sources
        'apnews.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'reuters.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'bbc.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'cnn.com': { credibility: 'high', bias: 'moderate', type: 'established_news' },
        'wsj.com': { credibility: 'high', bias: 'slight', type: 'established_news' },
        'nationalgeographic.com': { credibility: 'high', bias: 'minimal', type: 'specialized' },
        'heraldtribune.com': { credibility: 'moderate', bias: 'slight', type: 'local_news' },
        
        // Suspicious/fake news sources (examples from dataset)
        'truthpatriotnews.net': { credibility: 'very_low', bias: 'extreme', type: 'conspiracy' },
        'realhealthtruth.com': { credibility: 'very_low', bias: 'extreme', type: 'pseudoscience' },
        'americandefensewatch.org': { credibility: 'very_low', bias: 'extreme', type: 'conspiracy' },
        'hiddentruthexposed.net': { credibility: 'very_low', bias: 'extreme', type: 'conspiracy' },
        'exposetheconspiracy.com': { credibility: 'very_low', bias: 'extreme', type: 'conspiracy' },
        'techfreedomfighter.org': { credibility: 'very_low', bias: 'extreme', type: 'conspiracy' },
        'pyramidpowersecrets.org': { credibility: 'very_low', bias: 'extreme', type: 'pseudoscience' },
        'climatetruthexposed.com': { credibility: 'very_low', bias: 'extreme', type: 'conspiracy' },
        
        'default': { credibility: 'unknown', bias: 'unknown', type: 'unknown' }
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
