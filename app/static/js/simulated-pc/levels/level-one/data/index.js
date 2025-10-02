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
        // Legitimate news sources
        'apnews.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'reuters.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'bbc.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        'cnn.com': { credibility: 'high', bias: 'moderate', type: 'established_news' },
        'wsj.com': { credibility: 'high', bias: 'slight', type: 'established_news' },
        'usatoday.com': { credibility: 'high', bias: 'minimal', type: 'established_news' },
        
        // Suspicious/fake news sources - election misinformation
        'truthpatriotnews.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'electiontruthexposed.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'americandefensewatch.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'electionfraudwatch.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'digitaltruthexposed.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'shadowgovernmentwatch.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'realpollwatch.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'votingtruthdefender.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'newworldorderexposed.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'techcensorshipwatch.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'voterfraudwatch.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'politicalcorruptionexposed.com': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'ballotfraudexposed.org': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        'mediabiastruth.net': { credibility: 'very_low', bias: 'extreme', type: 'election_disinfo' },
        
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
