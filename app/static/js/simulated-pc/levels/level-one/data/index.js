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
        fake_articles: 5,
        real_articles: 5,
        total: 10,
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
        // Legitimate Philippine news sources
        'rappler.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'inquirer.net': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'news.abs-cbn.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'gmanetwork.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'mb.com.ph': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'philstar.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        
        // Suspicious/fake news sources - Philippine election misinformation
        'truthpilipinasnews.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'electiontruthdotph.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'pilipinasfraudwatch.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'sovereignpilipinasdefender.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'realpinoynews.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'electionwatchdogph.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'philippinesecuritywatch.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'constitutiondefenderph.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'voterfraudexposedph.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'techfraudwatchph.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'ballotsecurityph.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'democracydefenseph.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'mediacorruptionph.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'philippinesovereignty.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        
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
