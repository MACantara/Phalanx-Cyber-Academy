from flask import Blueprint, jsonify, current_app
import json
import random
import os
import pandas as pd
from pathlib import Path

news_api_bp = Blueprint('news_api', __name__, url_prefix='/api/news')

# Cache for CSV data to avoid reading file multiple times
_csv_cache = None

def load_csv_data():
    """Load and cache the news_articles_cleaned.csv data"""
    global _csv_cache
    if _csv_cache is not None:
        return _csv_cache
    
    try:
        # Load the cleaned CSV data
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-one', 'data', 'processed', 'news_articles_cleaned.csv'
        )
        
        # Check if file exists
        if not os.path.exists(csv_path):
            print(f"CSV file not found at: {csv_path}")
            return pd.DataFrame()
        
        # Read CSV with pandas
        _csv_cache = pd.read_csv(csv_path)
        
        # Filter for only Fake and Real labels (case-insensitive)
        _csv_cache = _csv_cache[_csv_cache['label'].str.lower().isin(['fake', 'real'])].copy()
        
        print(f"Loaded {len(_csv_cache)} articles from news_articles_cleaned.csv")
        print(f"Fake articles: {len(_csv_cache[_csv_cache['label'].str.lower() == 'fake'])}")
        print(f"Real articles: {len(_csv_cache[_csv_cache['label'].str.lower() == 'real'])}")
        
        return _csv_cache
        
    except Exception as e:
        print(f"Error loading news_articles_cleaned.csv: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

def convert_csv_to_article_format(df):
    """Convert CSV dataframe to article format expected by frontend"""
    articles = []
    
    for index, row in df.iterrows():
        # Skip rows with missing essential data
        if pd.isna(row['title_without_stopwords']) or pd.isna(row['text_without_stopwords']):
            continue
        
        # Determine if article is real (case-insensitive check)
        is_real = str(row['label']).lower() == 'real'
        
        # Create article object with required fields
        article = {
            'id': f'article_{index}',
            'author': str(row['author']) if pd.notna(row['author']) else 'Unknown Author',
            'published': str(row['published']) if pd.notna(row['published']) else '',
            'title': str(row['title_without_stopwords']) if pd.notna(row['title_without_stopwords']) else 'Untitled',
            'text': str(row['text_without_stopwords']) if pd.notna(row['text_without_stopwords']) else '',
            'site_url': str(row['site_url']) if pd.notna(row['site_url']) else '',
            'main_img_url': 'https://via.placeholder.com/400x200/10b981/ffffff?text=News+Article',
            'is_real': is_real,
            'label': str(row['label']),  # For checking purposes (not displayed)
            'source': str(row['site_url']) if pd.notna(row['site_url']) else 'unknown',
            'article_type': 'fake' if not is_real else 'real',
            'ai_analysis': {
                'clickable_elements': [],
                'article_analysis': {
                    'overall_credibility': 'high' if is_real else 'low',
                    'primary_red_flags': [] if is_real else [
                        'Questionable source credibility',
                        'Potentially misleading content'
                    ],
                    'credibility_factors': [
                        'Source verification needed',
                        'Cross-reference recommended'
                    ] if is_real else [],
                    'educational_focus': f'This article demonstrates how to analyze {"real" if is_real else "fake"} news content.',
                    'misinformation_tactics': [] if is_real else [
                        'Emotional manipulation',
                        'Unverified claims'
                    ],
                    'verification_tips': [
                        'Check the source reputation',
                        'Verify author credentials',
                        'Cross-reference with other sources',
                        'Look for emotional manipulation'
                    ]
                }
            }
        }
        
        articles.append(article)
    
    return articles

@news_api_bp.route('/mixed-articles', methods=['GET'])
def get_mixed_news_articles():
    """Get a balanced mix of news articles from CSV with 8 fake and 7 real articles"""
    try:
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': False,
                'error': 'No CSV data available'
            }), 500
        
        # Separate fake and real articles
        fake_articles = df[df['label'].str.lower() == 'fake'].copy()
        real_articles = df[df['label'].str.lower() == 'real'].copy()
        
        # Check if we have enough articles
        if len(fake_articles) < 8:
            print(f"Warning: Only {len(fake_articles)} fake articles available, requested 8")
        if len(real_articles) < 7:
            print(f"Warning: Only {len(real_articles)} real articles available, requested 7")
        
        # Sample the required number of articles
        selected_fake = fake_articles.sample(n=min(8, len(fake_articles)), random_state=random.randint(1, 1000))
        selected_real = real_articles.sample(n=min(7, len(real_articles)), random_state=random.randint(1, 1000))
        
        # Combine the selected articles
        selected_df = pd.concat([selected_fake, selected_real], ignore_index=True)
        
        # Convert to article format
        articles = convert_csv_to_article_format(selected_df)
        
        if not articles:
            return jsonify({
                'success': False,
                'error': 'No articles could be processed from CSV data'
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
                'source': 'news_articles_cleaned.csv'
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
    """Get statistics about the CSV dataset"""
    try:
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': False,
                'error': 'No CSV data available'
            }), 500
        
        articles = convert_csv_to_article_format(df)
        
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
                'source': 'news_articles_cleaned.csv'
            }
        })
        
    except Exception as e:
        print(f"Error getting news stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@news_api_bp.route('/csv-status', methods=['GET'])
def get_csv_status():
    """Get status of CSV data loading"""
    try:
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': True,
                'csv_data_available': False,
                'message': 'No CSV data available'
            })
        
        # Get basic statistics
        fake_count = len(df[df['label'].str.lower() == 'fake'])
        real_count = len(df[df['label'].str.lower() == 'real'])
        
        return jsonify({
            'success': True,
            'csv_data_available': True,
            'total_articles': len(df),
            'fake_articles': fake_count,
            'real_articles': real_count,
            'source_file': 'news_articles_cleaned.csv'
        })
        
    except Exception as e:
        print(f"Error getting CSV status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
