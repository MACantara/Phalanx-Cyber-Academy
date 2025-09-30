from flask import Blueprint, jsonify, current_app
import json
import random
import os
from pathlib import Path

news_api_bp = Blueprint('news_api', __name__, url_prefix='/api/news')

# Cache for JSON data to avoid reading file multiple times
_json_cache = None

def load_json_data():
    """Load and cache the news_articles.json data"""
    global _json_cache
    if _json_cache is not None:
        return _json_cache
    
    try:
        # Load the JSON data
        json_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-one', 'data', 'news_articles.json'
        )
        
        # Check if file exists
        if not os.path.exists(json_path):
            print(f"JSON file not found at: {json_path}")
            return []
        
        # Read JSON file
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        _json_cache = data.get('articles', [])
        
        fake_articles = [article for article in _json_cache if article['label'] == 1]
        real_articles = [article for article in _json_cache if article['label'] == 0]
        
        print(f"Loaded {len(_json_cache)} articles from news_articles.json")
        print(f"Fake articles: {len(fake_articles)}")
        print(f"Real articles: {len(real_articles)}")
        
        return _json_cache
        
    except Exception as e:
        print(f"Error loading news_articles.json: {e}")
        import traceback
        traceback.print_exc()
        return []

def convert_json_to_article_format(json_articles):
    """Convert JSON articles to the format expected by frontend"""
    articles = []
    
    for article_data in json_articles:
        # Determine if article is real (0 = real, 1 = fake)
        is_real = article_data['label'] == 0
        
        # Create article object with required fields
        article = {
            'id': article_data.get('id', f'article_{len(articles)}'),
            'author': article_data.get('author', 'Unknown Author'),
            'author_credentials': article_data.get('author_credentials', ''),
            'published': article_data.get('date', ''),
            'title': article_data.get('title', 'Untitled'),
            'text': article_data.get('content', ''),
            'site_url': article_data.get('website', ''),
            'main_img_url': 'https://via.placeholder.com/400x200/10b981/ffffff?text=News+Article',
            'is_real': is_real,
            'label': 'real' if is_real else 'fake',
            'source': article_data.get('website', 'unknown'),
            'article_type': 'real' if is_real else 'fake',
            'source_type': article_data.get('source_type', 'unknown'),
            'ai_analysis': {
                'clickable_elements': [],
                'article_analysis': {
                    'overall_credibility': 'high' if is_real else 'low',
                    'primary_red_flags': [] if is_real else [
                        'Questionable source credibility',
                        'Potentially misleading content',
                        'Emotional manipulation tactics',
                        'Unverified claims'
                    ],
                    'credibility_factors': [
                        'Established news organization',
                        'Verified author credentials', 
                        'Balanced reporting',
                        'Multiple source citations'
                    ] if is_real else [],
                    'educational_focus': f'This article demonstrates how to analyze {"legitimate journalism" if is_real else "misinformation content"}.',
                    'misinformation_tactics': [] if is_real else [
                        'Sensational headlines',
                        'Emotional manipulation',
                        'Unverified claims',
                        'Appeal to fear',
                        'Conspiracy theories'
                    ],
                    'verification_tips': [
                        'Check the source reputation and domain',
                        'Verify author credentials and expertise',
                        'Cross-reference with other reliable sources',
                        'Look for emotional manipulation in language',
                        'Check for proper citations and evidence',
                        'Analyze the website design and professionalism'
                    ]
                }
            }
        }
        
        articles.append(article)
    
    return articles

@news_api_bp.route('/mixed-articles', methods=['GET'])
def get_mixed_news_articles():
    """Get a balanced mix of news articles from JSON with 5 fake and 5 real articles"""
    try:
        json_articles = load_json_data()
        
        if not json_articles:
            return jsonify({
                'success': False,
                'error': 'No JSON data available'
            }), 500
        
        # Separate fake and real articles
        fake_articles = [article for article in json_articles if article['label'] == 1]
        real_articles = [article for article in json_articles if article['label'] == 0]
        
        # Check if we have enough articles
        if len(fake_articles) < 5:
            print(f"Warning: Only {len(fake_articles)} fake articles available, requested 5")
        if len(real_articles) < 5:
            print(f"Warning: Only {len(real_articles)} real articles available, requested 5")

        # Sample the required number of articles
        selected_fake = random.sample(fake_articles, min(5, len(fake_articles)))
        selected_real = random.sample(real_articles, min(5, len(real_articles)))

        # Combine the selected articles
        selected_articles = selected_fake + selected_real
        
        # Convert to article format expected by frontend
        articles = convert_json_to_article_format(selected_articles)
        
        if not articles:
            return jsonify({
                'success': False,
                'error': 'No articles could be processed from JSON data'
            }), 500
        
        # Shuffle articles for variety
        random.shuffle(articles)
        
        # Calculate summary stats
        real_count = sum(1 for article in articles if article['is_real'])
        fake_count = len(articles) - real_count
        
        return jsonify({
            'success': True,
            'articles': articles,
            'summary': {
                'total': len(articles),
                'real_count': real_count,
                'fake_count': fake_count,
                'source': 'news_articles.json'
            }
        })
        
    except Exception as e:
        print(f"Error getting mixed news articles: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@news_api_bp.route('/stats', methods=['GET'])
def get_news_stats():
    """Get statistics about the JSON dataset"""
    try:
        json_articles = load_json_data()
        
        if not json_articles:
            return jsonify({
                'success': False,
                'error': 'No JSON data available'
            }), 500
        
        articles = convert_json_to_article_format(json_articles)
        
        real_count = sum(1 for article in articles if article['is_real'])
        fake_count = len(articles) - real_count
        
        return jsonify({
            'success': True,
            'stats': {
                'total_articles': len(articles),
                'real_articles': real_count,
                'fake_articles': fake_count,
                'real_percentage': round((real_count / len(articles)) * 100, 2) if articles else 0,
                'fake_percentage': round((fake_count / len(articles)) * 100, 2) if articles else 0,
                'source': 'news_articles.json'
            }
        })
        
    except Exception as e:
        print(f"Error getting news stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@news_api_bp.route('/data-status', methods=['GET'])
def get_data_status():
    """Get status of JSON data loading"""
    try:
        json_articles = load_json_data()
        
        if not json_articles:
            return jsonify({
                'success': True,
                'data_available': False,
                'message': 'No JSON data available'
            })
        
        # Get basic statistics
        fake_count = len([article for article in json_articles if article['label'] == 1])
        real_count = len([article for article in json_articles if article['label'] == 0])
        
        return jsonify({
            'success': True,
            'data_available': True,
            'total_articles': len(json_articles),
            'fake_articles': fake_count,
            'real_articles': real_count,
            'source_file': 'news_articles.json'
        })
        
    except Exception as e:
        print(f"Error getting data status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
