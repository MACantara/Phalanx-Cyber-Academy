#!/usr/bin/env python3
"""
Comprehensive News Article Preprocessing Script

This script performs advanced cleaning and preprocessing of the news articles CSV dataset,
focusing on improving the quality of:
- title_without_stopwords
- text_without_stopwords  
- author names

Author: CyberQuest Team
Date: September 2025
"""

import pandas as pd
import numpy as np
import re
import string
from collections import Counter
import logging
from pathlib import Path
import unicodedata

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NewsArticlePreprocessor:
    """Comprehensive news article preprocessing class."""
    
    def __init__(self):
        # Extended stopwords list including common website elements
        self.extended_stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
            'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'have', 'had', 'this', 'they',
            'but', 'or', 'not', 'can', 'you', 'your', 'we', 'our', 'all', 'any', 'been', 'were', 'would',
            'could', 'should', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'am', 'i', 'me', 'my',
            'him', 'his', 'her', 'hers', 'us', 'them', 'their', 'theirs', 'one', 'two', 'three', 'four',
            'five', 'six', 'seven', 'eight', 'nine', 'ten', 'more', 'most', 'much', 'many', 'some', 'no',
            'yes', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
            'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'if', 'because',
            'until', 'while', 'during', 'before', 'after', 'above', 'below', 'between', 'through', 'into',
            'onto', 'upon', 'across', 'against', 'within', 'without', 'throughout', 'toward', 'towards',
            'each', 'every', 'either', 'neither', 'both', 'few', 'several', 'other', 'another', 'such',
            'own', 'same', 'different', 'new', 'old', 'first', 'last', 'next', 'previous', 'good', 'better',
            'best', 'bad', 'worse', 'worst', 'big', 'small', 'large', 'little', 'long', 'short', 'high',
            'low', 'right', 'left', 'far', 'near', 'early', 'late', 'ago', 'now', 'today', 'tomorrow',
            'yesterday', 'week', 'month', 'year', 'day', 'time', 'way', 'back', 'get', 'got', 'go', 'goes',
            'went', 'come', 'came', 'take', 'took', 'taken', 'give', 'gave', 'given', 'put', 'say', 'said',
            'tell', 'told', 'ask', 'asked', 'know', 'knew', 'known', 'think', 'thought', 'see', 'saw', 'seen',
            'look', 'looked', 'find', 'found', 'feel', 'felt', 'seem', 'seemed', 'try', 'tried', 'use', 'used',
            'make', 'made', 'work', 'worked', 'call', 'called', 'want', 'wanted', 'need', 'needed', 'help',
            'helped', 'keep', 'kept', 'let', 'turn', 'turned', 'start', 'started', 'show', 'showed', 'shown',
            'follow', 'followed', 'play', 'played', 'run', 'ran', 'move', 'moved', 'live', 'lived', 'bring',
            'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'provide', 'provided', 'sit', 'sat',
            'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue',
            'continued', 'set', 'remain', 'remained', 'add', 'added', 'become', 'became', 'lead', 'led', 'understand',
            'understood', 'watch', 'watched', 'read', 'appear', 'appeared', 'build', 'built', 'grow', 'grew', 'grown',
            'open', 'opened', 'walk', 'walked', 'win', 'won', 'offer', 'offered', 'remember', 'remembered',
            'love', 'loved', 'consider', 'considered', 'buy', 'bought', 'kill', 'killed', 'speak', 'spoke',
            'spoken', 'spend', 'spent', 'cut', 'hear', 'heard', 'stop', 'stopped', 'send', 'sent', 'receive',
            'received', 'decide', 'decided', 'win', 'won', 'hope', 'hoped', 'develop', 'developed', 'carry',
            'carried', 'break', 'broke', 'broken', 'pick', 'picked', 'save', 'saved', 'improve', 'improved',
            'create', 'created', 'enter', 'entered', 'share', 'shared', 'leave', 'left', 'choose', 'chose',
            'chosen', 'fall', 'fell', 'fallen', 'reach', 'reached', 'sell', 'sold', 'require', 'required',
            'report', 'reported', 'like', 'liked', 'place', 'placed', 'something', 'someone', 'somewhere',
            'somehow', 'sometime', 'sometimes', 'somewhat', 'anyway', 'however', 'therefore', 'thus', 'hence',
            'moreover', 'furthermore', 'nevertheless', 'nonetheless', 'otherwise', 'meanwhile', 'instead',
            'besides', 'indeed', 'certainly', 'surely', 'obviously', 'clearly', 'perhaps', 'maybe', 'probably',
            'possibly', 'definitely', 'absolutely', 'completely', 'totally', 'entirely', 'quite', 'rather',
            'very', 'too', 'so', 'such', 'really', 'actually', 'truly', 'literally', 'basically', 'generally',
            'usually', 'normally', 'typically', 'especially', 'particularly', 'specifically', 'exactly',
            'approximately', 'roughly', 'about', 'around', 'nearly', 'almost', 'just', 'only', 'even', 'still',
            'already', 'yet', 'soon', 'enough', 'quite', 'fairly', 'pretty', 'rather', 'somewhat', 'kind',
            'sort', 'type', 'form', 'part', 'piece', 'bit', 'lot', 'amount', 'number', 'group', 'team',
            'member', 'person', 'people', 'man', 'woman', 'child', 'children', 'family', 'friend', 'name',
            'end', 'beginning', 'middle', 'side', 'top', 'bottom', 'front', 'back', 'inside', 'outside',
            'around', 'along', 'past', 'beyond', 'except', 'including', 'regarding', 'concerning', 'according',
            'due', 'based', 'related', 'similar', 'different', 'various', 'certain', 'particular', 'special',
            'important', 'main', 'major', 'minor', 'significant', 'serious', 'real', 'true', 'false', 'wrong',
            'right', 'correct', 'proper', 'appropriate', 'suitable', 'available', 'possible', 'impossible',
            'necessary', 'unnecessary', 'useful', 'useless', 'helpful', 'harmful', 'safe', 'dangerous',
            'difficult', 'easy', 'hard', 'simple', 'complex', 'complicated', 'clear', 'unclear', 'obvious',
            'hidden', 'open', 'closed', 'free', 'busy', 'ready', 'sure', 'unsure', 'certain', 'uncertain',
            'likely', 'unlikely', 'common', 'rare', 'normal', 'unusual', 'strange', 'weird', 'funny', 'serious',
            'happy', 'sad', 'angry', 'excited', 'surprised', 'worried', 'scared', 'tired', 'hungry', 'thirsty',
            'hot', 'cold', 'warm', 'cool', 'wet', 'dry', 'clean', 'dirty', 'fresh', 'old', 'young', 'strong',
            'weak', 'fast', 'slow', 'quick', 'loud', 'quiet', 'bright', 'dark', 'light', 'heavy', 'thick',
            'thin', 'wide', 'narrow', 'deep', 'shallow', 'full', 'empty', 'rich', 'poor', 'cheap', 'expensive',
            # Web-specific words to remove
            'com', 'www', 'http', 'https', 'html', 'htm', 'php', 'asp', 'jsp', 'cfm', 'org', 'net', 'edu',
            'gov', 'mil', 'int', 'email', 'mailto', 'link', 'url', 'website', 'webpage', 'page', 'site',
            'blog', 'post', 'article', 'story', 'news', 'report', 'update', 'information', 'details',
            'click', 'here', 'read', 'more', 'continue', 'full', 'story', 'source', 'via', 'related',
            'share', 'tweet', 'facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'pinterest',
            'social', 'media', 'comment', 'comments', 'reply', 'replies', 'like', 'likes', 'follow',
            'followers', 'subscribe', 'subscription', 'newsletter', 'rss', 'feed', 'home', 'contact',
            'about', 'privacy', 'policy', 'terms', 'conditions', 'copyright', 'reserved', 'rights',
            'print', 'search', 'tags', 'categories', 'archive', 'archives', 'recent', 'popular',
            'trending', 'breaking', 'live', 'video', 'audio', 'photo', 'image', 'picture', 'pic',
            'gallery', 'slideshow', 'watch', 'listen', 'view', 'download', 'upload', 'file', 'pdf',
            'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'avi', 'mov', 'wmv',
            'advertisement', 'ad', 'ads', 'sponsor', 'sponsored', 'promote', 'promotion', 'sale',
            'discount', 'offer', 'deal', 'free', 'trial', 'demo', 'sample', 'test', 'beta', 'version',
            'update', 'upgrade', 'download', 'install', 'setup', 'configuration', 'settings', 'options',
            'help', 'support', 'faq', 'guide', 'tutorial', 'instructions', 'manual', 'documentation'
        }
        
        # Common website elements to remove from text
        self.website_artifacts = [
            r'\bpictwittercom[a-zA-Z0-9]+',  # Twitter picture links
            r'\bhttpstco[a-zA-Z0-9]+',      # Twitter shortened links
            r'\b[a-zA-Z]+com\b',            # Domain names
            r'\b[a-zA-Z]+org\b',            # Org domains
            r'\b[a-zA-Z]+net\b',            # Net domains
            r'\bwww\.[a-zA-Z0-9.-]+',       # www links
            r'\bhttp[s]?://[^\s]+',         # Full URLs
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email addresses
            r'\b\d{1,2}[:/]\d{1,2}[:/]\d{2,4}\b',  # Dates in various formats
            r'\b\d+k\s+shares?\b',          # Social media shares
            r'\bshares?\s*$',               # Trailing shares
            r'\brelated\s*$',               # Trailing related
            r'\bmore\s+related\s*$',        # More related
            r'\bfull\s+story\b',            # Full story links
            r'\bread\s+more\b',             # Read more links
            r'\bcontinue\s+reading\b',      # Continue reading
            r'\bclick\s+here\b',            # Click here
            r'\bsource:?\s*[^\n]*$',        # Source attribution
            r'\bvia:?\s*[^\n]*$',           # Via attribution
            r'\bphoto:?\s*[^\n]*$',         # Photo attribution
            r'\bimage:?\s*[^\n]*$',         # Image attribution
            r'\bcredit:?\s*[^\n]*$',        # Credit attribution
            r'\bcopyright\s+\d{4}[^\n]*$',  # Copyright lines
            r'\ball\s+rights\s+reserved[^\n]*$',  # Rights reserved
            r'\bterms\s+of\s+use[^\n]*$',   # Terms of use
            r'\bprivacy\s+policy[^\n]*$',   # Privacy policy
            r'\badvertisement\b',           # Advertisement
            r'\bsponsored\s+content\b',     # Sponsored content
            r'\bpaid\s+promotion\b',        # Paid promotion
            r'\b(?:tweet|post|share|like|follow)\s+(?:this|us|me)\b',  # Social media CTAs
            r'\bsubscribe\s+(?:to|for)[^\n]*$',  # Subscribe links
            r'\bnewsletter\s+signup[^\n]*$', # Newsletter signup
            r'\bbreaking:?\s*',             # Breaking news prefix
            r'\bupdate:?\s*',               # Update prefix
            r'\blive:?\s*',                 # Live prefix
            r'\bexclusive:?\s*',            # Exclusive prefix
            r'\bvideo:?\s*',                # Video prefix
            r'\baudio:?\s*',                # Audio prefix
            r'\bphoto:?\s*',                # Photo prefix
            r'\bgallery:?\s*',              # Gallery prefix
            r'\bslideshow:?\s*',            # Slideshow prefix
            r'\bpodcast:?\s*',              # Podcast prefix
            r'\binterview:?\s*',            # Interview prefix
            r'\bopinion:?\s*',              # Opinion prefix
            r'\beditorial:?\s*',            # Editorial prefix
            r'\bcommentary:?\s*',           # Commentary prefix
            r'\banalysis:?\s*',             # Analysis prefix
            r'\breview:?\s*',               # Review prefix
            r'\bpreview:?\s*',              # Preview prefix
            r'\brecap:?\s*',                # Recap prefix
            r'\bsummary:?\s*',              # Summary prefix
            r'\bhighlights:?\s*',           # Highlights prefix
        ]
        
        # Non-person author patterns (websites, organizations, etc.)
        self.non_person_author_patterns = [
            r'^(?:admin|administrator|editor|staff|team|user)$',
            r'^(?:activist\s*post|activistpost)$',
            r'@.*\.com$',
            r'^www\.',
            r'\.com$',
            r'\.org$',
            r'\.net$',
            r'^(?:news|media|press|blog|site|web)(?:\s|$)',
            r'^fed\s+up$',
            r'^reasoning\s+with\s+facts$',
            r'^barracuda\s+brigade$',
            r'noreply@',
            r'blogger\.com',
            r'^the\s+',
            r'^\d+',
            r'^anonymous$',
            r'^guest$',
            r'^contributor$',
            r'^correspondent$',
        ]
    
    def normalize_unicode(self, text):
        """Normalize Unicode characters and remove non-printable characters."""
        if pd.isna(text):
            return ""
        
        # Normalize Unicode
        text = unicodedata.normalize('NFKD', str(text))
        
        # Remove non-printable characters except spaces, tabs, and newlines
        text = ''.join(char for char in text if char.isprintable() or char in '\t\n ')
        
        return text
    
    def clean_author_name(self, author):
        """Clean and standardize author names."""
        if pd.isna(author) or not author or author.strip() == "":
            return "Unknown"
        
        author = str(author).strip()
        
        # Normalize Unicode
        author = self.normalize_unicode(author)
        
        # Convert to title case for better consistency
        author = author.title()
        
        # Check if this looks like a non-person entity
        author_lower = author.lower()
        for pattern in self.non_person_author_patterns:
            if re.search(pattern, author_lower):
                # If it's clearly not a person, classify as organization
                return f"[ORG] {author}"
        
        # Handle email addresses
        if '@' in author:
            if 'noreply' in author.lower() or 'blogger' in author.lower():
                return "[ORG] Anonymous Blog"
            else:
                # Extract name part from email if possible
                name_part = author.split('@')[0]
                name_part = re.sub(r'[._-]', ' ', name_part)
                return name_part.title()
        
        # Handle clearly organizational names
        org_indicators = ['post', 'news', 'media', 'press', 'network', 'group', 'team', 
                         'staff', 'editor', 'admin', 'site', 'blog', 'com', 'org', 'net']
        
        if any(indicator in author_lower for indicator in org_indicators):
            if not any(char.isupper() for char in author[1:]):  # Not proper names
                return f"[ORG] {author}"
        
        # Clean up common formatting issues
        author = re.sub(r'\s+', ' ', author)  # Multiple spaces to single
        author = re.sub(r'^[^\w]+|[^\w]+$', '', author)  # Remove non-word chars at start/end
        
        # Handle "Dr." prefix properly
        author = re.sub(r'^Dr\.?\s+', 'Dr. ', author, flags=re.IGNORECASE)
        
        # Handle other titles
        author = re.sub(r'^(?:Mr|Mrs|Ms|Prof|Professor)\.?\s+', lambda m: m.group(0).title(), author, flags=re.IGNORECASE)
        
        return author if author else "Unknown"
    
    def remove_website_artifacts(self, text):
        """Remove website-specific artifacts and URLs from text."""
        if pd.isna(text):
            return ""
        
        text = str(text)
        
        # Apply each regex pattern to remove website artifacts
        for pattern in self.website_artifacts:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        return text
    
    def advanced_text_cleaning(self, text):
        """Perform advanced text cleaning."""
        if pd.isna(text):
            return ""
        
        text = str(text)
        
        # Normalize Unicode
        text = self.normalize_unicode(text)
        
        # Remove website artifacts first
        text = self.remove_website_artifacts(text)
        
        # Remove HTML entities
        text = re.sub(r'&[a-zA-Z]+;', '', text)
        text = re.sub(r'&#\d+;', '', text)
        
        # Remove multiple spaces, tabs, newlines
        text = re.sub(r'\s+', ' ', text)
        
        # Remove common news website patterns
        text = re.sub(r'\b(?:print|email|share|tweet|facebook|twitter)\b', '', text, flags=re.IGNORECASE)
        
        # Remove standalone numbers and years that don't add meaning
        text = re.sub(r'\b(?:19|20)\d{2}\b', '', text)  # Years
        text = re.sub(r'\b\d+(?:st|nd|rd|th)?\b', '', text)  # Ordinal numbers
        
        # Remove very short words (1-2 characters) that are likely artifacts
        words = text.split()
        words = [word for word in words if len(word) > 2 or word.lower() in ['a', 'i', 'to', 'in', 'on', 'at', 'by', 'or', 'if', 'it', 'is', 'be']]
        text = ' '.join(words)
        
        # Remove punctuation but keep sentence structure
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Final cleanup
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def remove_stopwords_advanced(self, text):
        """Remove stopwords with advanced filtering."""
        if pd.isna(text):
            return ""
        
        text = str(text).lower()
        words = text.split()
        
        # Remove stopwords
        filtered_words = [word for word in words if word not in self.extended_stopwords]
        
        # Remove very common words that don't add meaning in news context
        news_stopwords = {
            'said', 'says', 'according', 'reported', 'report', 'news', 'article', 'story',
            'told', 'statement', 'announced', 'confirmed', 'revealed', 'disclosed',
            'sources', 'officials', 'spokesman', 'spokesperson', 'representative',
            'yesterday', 'today', 'tomorrow', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday', 'january', 'february',
            'march', 'april', 'may', 'june', 'july', 'august', 'september',
            'october', 'november', 'december', 'morning', 'afternoon', 'evening',
            'night', 'ago', 'later', 'earlier', 'recently', 'currently', 'now'
        }
        
        filtered_words = [word for word in filtered_words if word not in news_stopwords]
        
        # Remove very short words and very long words (likely errors)
        filtered_words = [word for word in filtered_words if 3 <= len(word) <= 20]
        
        # Remove words that are mostly numbers
        filtered_words = [word for word in filtered_words if not re.match(r'^\d+[a-zA-Z]*\d*$', word)]
        
        return ' '.join(filtered_words)
    
    def process_dataframe(self, df):
        """Process the entire dataframe."""
        logger.info(f"Starting preprocessing of {len(df)} articles...")
        
        # Make a copy to avoid modifying original
        df_processed = df.copy()
        
        # 1. Clean author names
        logger.info("Cleaning author names...")
        df_processed['author_cleaned'] = df_processed['author'].apply(self.clean_author_name)
        
        # 2. Advanced cleaning of title_without_stopwords
        logger.info("Processing titles...")
        df_processed['title_preprocessed'] = df_processed['title_without_stopwords'].apply(self.advanced_text_cleaning)
        df_processed['title_final'] = df_processed['title_preprocessed'].apply(self.remove_stopwords_advanced)
        
        # 3. Advanced cleaning of text_without_stopwords
        logger.info("Processing article text...")
        df_processed['text_preprocessed'] = df_processed['text_without_stopwords'].apply(self.advanced_text_cleaning)
        df_processed['text_final'] = df_processed['text_preprocessed'].apply(self.remove_stopwords_advanced)
        
        # 4. Quality checks and filtering
        logger.info("Performing quality checks...")
        
        # Remove articles with very short cleaned text (likely artifacts)
        initial_count = len(df_processed)
        df_processed = df_processed[df_processed['text_final'].str.len() > 50]
        filtered_count = len(df_processed)
        logger.info(f"Removed {initial_count - filtered_count} articles with insufficient text content")
        
        # Remove articles with very short titles
        initial_count = len(df_processed)
        df_processed = df_processed[df_processed['title_final'].str.len() > 10]
        filtered_count = len(df_processed)
        logger.info(f"Removed {initial_count - filtered_count} articles with insufficient title content")
        
        # 5. Create final cleaned columns
        df_processed['author'] = df_processed['author_cleaned']
        df_processed['title_without_stopwords'] = df_processed['title_final']
        df_processed['text_without_stopwords'] = df_processed['text_final']
        
        # Remove intermediate columns
        columns_to_drop = ['author_cleaned', 'title_preprocessed', 'title_final', 
                          'text_preprocessed', 'text_final']
        df_processed = df_processed.drop(columns=columns_to_drop)
        
        logger.info(f"Preprocessing complete. Final dataset: {len(df_processed)} articles")
        
        return df_processed
    
    def generate_quality_report(self, df_original, df_processed):
        """Generate a quality report comparing before and after preprocessing."""
        logger.info("Generating quality report...")
        
        report = {
            'original_count': len(df_original),
            'processed_count': len(df_processed),
            'articles_removed': len(df_original) - len(df_processed),
            'removal_percentage': ((len(df_original) - len(df_processed)) / len(df_original)) * 100,
            'unique_authors_original': df_original['author'].nunique(),
            'unique_authors_processed': df_processed['author'].nunique(),
            'avg_title_length_original': df_original['title_without_stopwords'].str.len().mean(),
            'avg_title_length_processed': df_processed['title_without_stopwords'].str.len().mean(),
            'avg_text_length_original': df_original['text_without_stopwords'].str.len().mean(),
            'avg_text_length_processed': df_processed['text_without_stopwords'].str.len().mean(),
        }
        
        # Sample of cleaned authors
        author_sample = df_processed['author'].value_counts().head(20)
        
        print("\n" + "="*80)
        print("PREPROCESSING QUALITY REPORT")
        print("="*80)
        print(f"Original articles: {report['original_count']:,}")
        print(f"Processed articles: {report['processed_count']:,}")
        print(f"Articles removed: {report['articles_removed']:,} ({report['removal_percentage']:.2f}%)")
        print(f"Unique authors (original): {report['unique_authors_original']:,}")
        print(f"Unique authors (processed): {report['unique_authors_processed']:,}")
        print(f"Average title length (original): {report['avg_title_length_original']:.1f} chars")
        print(f"Average title length (processed): {report['avg_title_length_processed']:.1f} chars")
        print(f"Average text length (original): {report['avg_text_length_original']:.1f} chars")
        print(f"Average text length (processed): {report['avg_text_length_processed']:.1f} chars")
        print("\nTop 20 Authors (after cleaning):")
        print("-" * 40)
        for author, count in author_sample.items():
            print(f"{author:<30} {count:>6}")
        print("="*80)
        
        return report

def main():
    """Main execution function."""
    # File paths
    input_file = Path("c:/Programming-Projects/CyberQuest/app/static/js/simulated-pc/levels/level-one/data/processed/news_articles_cleaned.csv")
    output_file = Path("c:/Programming-Projects/CyberQuest/app/static/js/simulated-pc/levels/level-one/data/processed/news_articles_comprehensive_cleaned.csv")
    
    # Check if input file exists
    if not input_file.exists():
        logger.error(f"Input file not found: {input_file}")
        return
    
    try:
        # Load the data
        logger.info(f"Loading data from {input_file}")
        df_original = pd.read_csv(input_file)
        logger.info(f"Loaded {len(df_original)} articles with {len(df_original.columns)} columns")
        
        # Initialize preprocessor
        preprocessor = NewsArticlePreprocessor()
        
        # Process the data
        df_processed = preprocessor.process_dataframe(df_original)
        
        # Generate quality report
        report = preprocessor.generate_quality_report(df_original, df_processed)
        
        # Save the processed data
        logger.info(f"Saving processed data to {output_file}")
        df_processed.to_csv(output_file, index=False)
        logger.info("Processing complete!")
        
        # Show sample of processed data
        print("\nSample of processed data:")
        print("-" * 80)
        sample_cols = ['author', 'title_without_stopwords', 'text_without_stopwords']
        for i in range(min(3, len(df_processed))):
            print(f"\nArticle {i+1}:")
            for col in sample_cols:
                value = df_processed.iloc[i][col]
                if len(str(value)) > 100:
                    value = str(value)[:100] + "..."
                print(f"  {col}: {value}")
    
    except Exception as e:
        logger.error(f"Error during processing: {str(e)}")
        raise

if __name__ == "__main__":
    main()