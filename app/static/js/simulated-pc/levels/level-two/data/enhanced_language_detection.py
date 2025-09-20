#!/usr/bin/env python3
"""
Enhanced Language Detection using professional libraries and comprehensive methods.
This replaces the basic word-matching approach with robust language detection.
"""

import pandas as pd
import re
import os
from langdetect import detect, detect_langs, LangDetectException
from langdetect.lang_detect_exception import LangDetectException
import nltk
from collections import Counter

class EnhancedLanguageDetector:
    """
    Professional language detection using multiple methods:
    1. langdetect library (Google's language detection)
    2. NLTK English corpus
    3. Character frequency analysis
    4. N-gram analysis
    """
    
    def __init__(self):
        self.setup_nltk()
        self.setup_character_frequencies()
        
    def setup_nltk(self):
        """Download required NLTK data."""
        try:
            # Download required NLTK data quietly
            import ssl
            try:
                _create_unverified_https_context = ssl._create_unverified_context
            except AttributeError:
                pass
            else:
                ssl._create_default_https_context = _create_unverified_https_context
                
            nltk.download('words', quiet=True)
            nltk.download('stopwords', quiet=True)
            
            from nltk.corpus import words, stopwords
            self.english_words = set(words.words())
            self.english_stopwords = set(stopwords.words('english'))
            
        except Exception as e:
            print(f"Warning: Could not download NLTK data: {e}")
            # Fallback to basic word set
            self.english_words = {
                'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
                'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
                'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we'
            }
            self.english_stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    
    def setup_character_frequencies(self):
        """Setup character frequency analysis for English."""
        # English letter frequencies (approximate)
        self.english_char_freq = {
            'e': 12.70, 't': 9.06, 'a': 8.17, 'o': 7.51, 'i': 6.97, 'n': 6.75,
            's': 6.33, 'h': 6.09, 'r': 5.99, 'd': 4.25, 'l': 4.03, 'c': 2.78,
            'u': 2.76, 'm': 2.41, 'w': 2.36, 'f': 2.23, 'g': 2.02, 'y': 1.97,
            'p': 1.93, 'b': 1.29, 'v': 0.98, 'k': 0.77, 'j': 0.15, 'x': 0.15,
            'q': 0.10, 'z': 0.07
        }
    
    def detect_language_langdetect(self, text):
        """Use langdetect library for language detection."""
        try:
            if not text or len(str(text).strip()) < 3:
                return None, 0.0
            
            # Get language with confidence
            langs = detect_langs(str(text))
            if langs:
                lang = langs[0]
                return lang.lang, lang.prob
            return None, 0.0
            
        except LangDetectException:
            return None, 0.0
        except Exception:
            return None, 0.0
    
    def analyze_character_frequency(self, text):
        """Analyze character frequency to determine if text is likely English."""
        if not text:
            return 0.0
            
        text_clean = re.sub(r'[^a-zA-Z]', '', str(text).lower())
        if len(text_clean) < 10:
            return 0.0
        
        char_counts = Counter(text_clean)
        total_chars = sum(char_counts.values())
        
        if total_chars == 0:
            return 0.0
        
        # Calculate how close the character frequency is to English
        english_score = 0.0
        for char, expected_freq in self.english_char_freq.items():
            actual_freq = (char_counts.get(char, 0) / total_chars) * 100
            # Use inverse of difference (closer to expected = higher score)
            diff = abs(expected_freq - actual_freq)
            english_score += max(0, 10 - diff)  # Max 10 points per character
        
        # Normalize score (max possible is 26 * 10 = 260)
        return min(english_score / 260.0, 1.0)
    
    def analyze_nltk_words(self, text):
        """Use NLTK English word corpus for analysis."""
        if not text or not hasattr(self, 'english_words'):
            return 0.0
        
        words = re.findall(r'\b[a-zA-Z]+\b', str(text).lower())
        if len(words) == 0:
            return 0.0
        
        english_word_count = sum(1 for word in words if word in self.english_words)
        return english_word_count / len(words)
    
    def analyze_stopwords(self, text):
        """Analyze English stopword frequency."""
        if not text or not hasattr(self, 'english_stopwords'):
            return 0.0
        
        words = re.findall(r'\b[a-zA-Z]+\b', str(text).lower())
        if len(words) == 0:
            return 0.0
        
        stopword_count = sum(1 for word in words if word in self.english_stopwords)
        return stopword_count / len(words)
    
    def analyze_ngrams(self, text, n=2):
        """Analyze n-grams for English patterns."""
        if not text or len(str(text)) < n:
            return 0.0
        
        text_clean = re.sub(r'[^a-zA-Z ]', '', str(text).lower())
        
        # Common English bigrams
        english_bigrams = {
            'th', 'he', 'in', 'er', 'an', 're', 'ed', 'nd', 'on', 'en',
            'at', 'ou', 'it', 'is', 'or', 'ti', 'hi', 'st', 'et', 'ng'
        }
        
        if n == 2:
            bigrams = [text_clean[i:i+2] for i in range(len(text_clean)-1)]
            if len(bigrams) == 0:
                return 0.0
            english_bigram_count = sum(1 for bg in bigrams if bg in english_bigrams)
            return english_bigram_count / len(bigrams)
        
        return 0.0
    
    def is_likely_english(self, text, confidence_threshold=0.5):
        """
        Comprehensive English detection using multiple methods.
        
        Args:
            text: Text to analyze
            confidence_threshold: Minimum confidence to consider text as English
            
        Returns:
            bool: True if text is likely English
        """
        if not text or pd.isna(text) or len(str(text).strip()) < 3:
            return False
        
        scores = {}
        weights = {}
        
        # Method 1: langdetect library (highest weight)
        lang, lang_confidence = self.detect_language_langdetect(text)
        if lang == 'en':
            scores['langdetect'] = lang_confidence
            weights['langdetect'] = 0.4
        else:
            scores['langdetect'] = 0.0
            weights['langdetect'] = 0.4
        
        # Method 2: NLTK word corpus
        nltk_score = self.analyze_nltk_words(text)
        scores['nltk_words'] = nltk_score
        weights['nltk_words'] = 0.25
        
        # Method 3: Character frequency analysis
        char_freq_score = self.analyze_character_frequency(text)
        scores['char_freq'] = char_freq_score
        weights['char_freq'] = 0.15
        
        # Method 4: Stopword analysis
        stopword_score = self.analyze_stopwords(text)
        scores['stopwords'] = stopword_score
        weights['stopwords'] = 0.1
        
        # Method 5: N-gram analysis
        ngram_score = self.analyze_ngrams(text)
        scores['ngrams'] = ngram_score
        weights['ngrams'] = 0.1
        
        # Calculate weighted score
        total_score = sum(scores[method] * weights[method] for method in scores)
        
        return total_score >= confidence_threshold
    
    def get_language_analysis(self, text):
        """
        Get detailed language analysis for debugging/reporting.
        
        Returns:
            dict: Detailed analysis results
        """
        if not text or pd.isna(text):
            return {
                'is_english': False,
                'confidence': 0.0,
                'detected_language': None,
                'methods': {}
            }
        
        # Get all method scores
        lang, lang_confidence = self.detect_language_langdetect(text)
        nltk_score = self.analyze_nltk_words(text)
        char_freq_score = self.analyze_character_frequency(text)
        stopword_score = self.analyze_stopwords(text)
        ngram_score = self.analyze_ngrams(text)
        
        # Calculate weighted final score
        scores = {
            'langdetect': lang_confidence if lang == 'en' else 0.0,
            'nltk_words': nltk_score,
            'char_freq': char_freq_score,
            'stopwords': stopword_score,
            'ngrams': ngram_score
        }
        
        weights = {
            'langdetect': 0.4,
            'nltk_words': 0.25,
            'char_freq': 0.15,
            'stopwords': 0.1,
            'ngrams': 0.1
        }
        
        final_confidence = sum(scores[method] * weights[method] for method in scores)
        
        return {
            'is_english': final_confidence >= 0.5,
            'confidence': final_confidence,
            'detected_language': lang,
            'langdetect_confidence': lang_confidence,
            'methods': scores
        }


def test_enhanced_language_detection():
    """Test the enhanced language detection system."""
    
    print("Testing Enhanced Language Detection")
    print("=" * 60)
    
    # Initialize enhanced detector
    detector = EnhancedLanguageDetector()
    
    # Test cases
    test_texts = [
        "Hello, this is a comprehensive English email message with proper grammar.",
        "Please click on this link to verify your account immediately.",
        "您好，这是一条中文信息。欢迎使用我们的服务。",
        "Hola, este es un mensaje en español. ¿Cómo está usted hoy?",
        "Bonjour, ceci est un message en français. Comment allez-vous?",
        "Guten Tag, dies ist eine Nachricht auf Deutsch. Wie geht es Ihnen?",
        "This email contains some technical terms like authentication, verification, and encryption.",
        "",
        None,
        "short",
        "The quick brown fox jumps over the lazy dog multiple times in this sentence.",
        "Investment opportunity! Click here now for amazing returns!",
        "مرحبا، هذه رسالة باللغة العربية",
        "Здравствуйте, это сообщение на русском языке"
    ]
    
    print("Detailed Analysis:")
    print("-" * 60)
    
    for i, text in enumerate(test_texts, 1):
        analysis = detector.get_language_analysis(text)
        is_english = detector.is_likely_english(text)
        
        print(f"{i:2d}. Text: {repr(text)}")
        print(f"    English: {is_english} (confidence: {analysis['confidence']:.3f})")
        if analysis['detected_language']:
            print(f"    Detected: {analysis['detected_language']} ({analysis.get('langdetect_confidence', 0.0):.3f})")
        else:
            print(f"    Detected: None")
        print(f"    Methods: {', '.join(f'{k}={v:.2f}' for k, v in analysis['methods'].items())}")
        print()
    
    # Test on actual dataset if available
    if os.path.exists('CEAS_08.csv'):
        print("Testing on CEAS_08.csv dataset...")
        print("=" * 60)
        
        try:
            # Read a sample
            df = pd.read_csv('CEAS_08.csv', nrows=200)
            df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
            
            print(f"Loaded {len(df)} rows for testing")
            print(f"Columns: {list(df.columns)}")
            
            # Test on subject and body fields
            for field in ['subject', 'body']:
                if field in df.columns:
                    print(f"\nAnalyzing {field} field:")
                    
                    english_count = 0
                    non_english_count = 0
                    empty_count = 0
                    total_confidence = 0
                    
                    sample_analyses = []
                    
                    for i, text in enumerate(df[field].fillna('')):
                        if not text or str(text).strip() == '':
                            empty_count += 1
                        else:
                            analysis = detector.get_language_analysis(str(text))
                            if analysis['is_english']:
                                english_count += 1
                                total_confidence += analysis['confidence']
                            else:
                                non_english_count += 1
                            
                            # Store first 5 analyses for detailed review
                            if len(sample_analyses) < 5:
                                sample_analyses.append((text[:100], analysis))
                    
                    total_analyzed = english_count + non_english_count
                    
                    if total_analyzed > 0:
                        english_pct = (english_count / total_analyzed) * 100
                        avg_confidence = total_confidence / english_count if english_count > 0 else 0
                        
                        print(f"  English: {english_count} ({english_pct:.1f}%) - Avg confidence: {avg_confidence:.3f}")
                        print(f"  Non-English: {non_english_count} ({100-english_pct:.1f}%)")
                        print(f"  Empty: {empty_count}")
                        
                        print(f"\n  Sample Analysis:")
                        for text_sample, analysis in sample_analyses:
                            print(f"    Text: {text_sample}...")
                            print(f"    Result: {analysis['detected_language']} ({analysis['confidence']:.3f}) - {analysis['is_english']}")
                    else:
                        print(f"  No valid text found")
                        
        except Exception as e:
            print(f"Error reading dataset: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    test_enhanced_language_detection()