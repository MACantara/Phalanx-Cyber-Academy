#!/usr/bin/env python3
"""
Unified Email Dataset Quality Assessment Script for CEAS_08.csv

This script combines both comprehensive and memory-efficient data quality analysis
for phishing email datasets. It automatically detects file size and chooses the 
appropriate processing method.

Features:
- Automatic detection of dataset size for optimal processing
- Memory-efficient chunked processing for large files
- Comprehensive analysis for smaller datasets
- Email format validation and URL analysis
- Phishing vs legitimate email distribution analysis

Author: Data Quality Assessment Tool
Date: September 2025
"""

import pandas as pd
import numpy as np
import re
import os
from collections import Counter
from urllib.parse import urlparse
import warnings
warnings.filterwarnings('ignore')

# Try to import enhanced language detection libraries
try:
    from langdetect import detect, detect_langs, LangDetectException
    from langdetect.lang_detect_exception import LangDetectException
    import nltk
    from collections import Counter
    ENHANCED_DETECTION_AVAILABLE = True
except ImportError:
    ENHANCED_DETECTION_AVAILABLE = False

class LanguageDetector:
    """
    Enhanced language detector using multiple methods for accurate English identification.
    Falls back to simple detection if advanced libraries are not available.
    """
    
    def __init__(self):
        self.enhanced_mode = ENHANCED_DETECTION_AVAILABLE
        
        if self.enhanced_mode:
            self.setup_enhanced_detection()
        else:
            self.setup_basic_detection()
    
    def setup_enhanced_detection(self):
        """Setup enhanced detection with langdetect and NLTK."""
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
            
        except Exception:
            # Fallback to basic detection if NLTK setup fails
            self.enhanced_mode = False
            self.setup_basic_detection()
            return
        
        # Character frequency for English
        self.english_char_freq = {
            'e': 12.70, 't': 9.06, 'a': 8.17, 'o': 7.51, 'i': 6.97, 'n': 6.75,
            's': 6.33, 'h': 6.09, 'r': 5.99, 'd': 4.25, 'l': 4.03, 'c': 2.78,
            'u': 2.76, 'm': 2.41, 'w': 2.36, 'f': 2.23, 'g': 2.02, 'y': 1.97,
            'p': 1.93, 'b': 1.29, 'v': 0.98, 'k': 0.77, 'j': 0.15, 'x': 0.15,
            'q': 0.10, 'z': 0.07
        }
        
        # Common English bigrams
        self.english_bigrams = {
            'th', 'he', 'in', 'er', 'an', 're', 'ed', 'nd', 'on', 'en',
            'at', 'ou', 'it', 'is', 'or', 'ti', 'hi', 'st', 'et', 'ng'
        }
    
    def setup_basic_detection(self):
        """Setup basic detection using word lists and patterns."""
        self.common_english_words = {
            'the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 
            'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your',
            'all', 'any', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get',
            'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two',
            'who', 'boy', 'did', 'man', 'end', 'why', 'let', 'same', 'tell', 'each',
            'which', 'their', 'said', 'each', 'make', 'most', 'over', 'said', 'some',
            'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
            'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'will',
            'email', 'please', 'thank', 'click', 'here', 'more', 'information', 'contact',
            'message', 'send', 'receive', 'reply', 'forward', 'subject', 'dear', 'hello',
            'regards', 'sincerely', 'best', 'thanks', 'welcome', 'account', 'service'
        }
        
        self.english_patterns = [
            r'\b(the|and|for|are|but|not|you|all|can|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|who|boy|did|man|end|why|let)\b',
            r'\b(email|message|click|here|please|thank|hello|dear|regards|best|account|service|information|contact|send|receive|reply|forward)\b',
            r"('s|'re|'ve|'ll|'d|n't)",  # English contractions
            r'\b(ing|ed|er|est|ly|tion|sion|ness|ment|able|ible)\b',  # Common English suffixes
        ]
    
    def detect_language_langdetect(self, text):
        """Use langdetect library for language detection."""
        if not self.enhanced_mode:
            return None, 0.0
            
        try:
            if not text or len(str(text).strip()) < 3:
                return None, 0.0
            
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
        if not self.enhanced_mode or not text:
            return 0.0
            
        text_clean = re.sub(r'[^a-zA-Z]', '', str(text).lower())
        if len(text_clean) < 10:
            return 0.0
        
        char_counts = Counter(text_clean)
        total_chars = sum(char_counts.values())
        
        if total_chars == 0:
            return 0.0
        
        english_score = 0.0
        for char, expected_freq in self.english_char_freq.items():
            actual_freq = (char_counts.get(char, 0) / total_chars) * 100
            diff = abs(expected_freq - actual_freq)
            english_score += max(0, 10 - diff)
        
        return min(english_score / 260.0, 1.0)
    
    def analyze_nltk_words(self, text):
        """Use NLTK English word corpus for analysis."""
        if not self.enhanced_mode or not text or not hasattr(self, 'english_words'):
            return 0.0
        
        words = re.findall(r'\b[a-zA-Z]+\b', str(text).lower())
        if len(words) == 0:
            return 0.0
        
        english_word_count = sum(1 for word in words if word in self.english_words)
        return english_word_count / len(words)
    
    def is_likely_english(self, text, confidence_threshold=0.5):
        """
        Determine if text is likely English using available detection methods.
        
        Args:
            text (str): Text to analyze
            confidence_threshold (float): Minimum confidence to consider text as English
            
        Returns:
            bool: True if text is likely English
        """
        if not text or pd.isna(text) or len(str(text).strip()) < 3:
            return False
        
        if self.enhanced_mode:
            return self._enhanced_detection(text, confidence_threshold)
        else:
            return self._basic_detection(text)
    
    def _enhanced_detection(self, text, confidence_threshold):
        """Enhanced detection using multiple methods."""
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
        weights['nltk_words'] = 0.3
        
        # Method 3: Character frequency analysis
        char_freq_score = self.analyze_character_frequency(text)
        scores['char_freq'] = char_freq_score
        weights['char_freq'] = 0.2
        
        # Method 4: Basic word patterns (fallback)
        basic_score = self._basic_word_analysis(text)
        scores['basic'] = basic_score
        weights['basic'] = 0.1
        
        # Calculate weighted score
        total_score = sum(scores[method] * weights[method] for method in scores)
        return total_score >= confidence_threshold
    
    def _basic_detection(self, text, threshold=0.3):
        """Basic detection using word lists and patterns."""
        text = str(text).lower()
        words = re.findall(r'\b\w+\b', text)
        
        if len(words) == 0:
            return False
        
        # Check for common English words
        english_word_count = sum(1 for word in words if word in self.common_english_words)
        word_ratio = english_word_count / len(words)
        
        # Check for English patterns
        pattern_matches = 0
        for pattern in self.english_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                pattern_matches += 1
        
        return word_ratio >= threshold or (pattern_matches >= 2 and word_ratio >= 0.1)
    
    def _basic_word_analysis(self, text):
        """Basic word analysis for enhanced mode fallback."""
        words = re.findall(r'\b[a-zA-Z]+\b', str(text).lower())
        if len(words) == 0:
            return 0.0
        
        if hasattr(self, 'english_words'):
            english_word_count = sum(1 for word in words if word in self.english_words)
        else:
            english_word_count = sum(1 for word in words if word in self.common_english_words)
        
        return english_word_count / len(words)

class EmailDataQualityAssessment:
    """
    Unified data quality assessment tool for email datasets.
    Automatically chooses between chunked and full processing based on file size.
    """
    
    def __init__(self, csv_file_path):
        """
        Initialize the assessment with the CSV file path.
        
        Args:
            csv_file_path (str): Path to the CSV file containing email data
        """
        self.csv_file_path = csv_file_path
        self.df = None
        self.quality_report = {}
        self.file_size_mb = 0
        self.use_chunked_processing = False
        self.language_detector = LanguageDetector()
        
        # Check file size to determine processing method
        if os.path.exists(csv_file_path):
            self.file_size_mb = os.path.getsize(csv_file_path) / (1024 * 1024)
            # Use chunked processing for files larger than 100MB
            self.use_chunked_processing = self.file_size_mb > 100
    
    def chunked_quality_assessment(self, chunk_size=10000, max_chunks=0):
        """
        Perform memory-efficient data quality assessment using chunked processing.
        
        Args:
            chunk_size (int): Size of each chunk to process
            max_chunks (int): Maximum number of chunks to analyze (0 = all)
        """
        print("CHUNKED EMAIL DATASET QUALITY ASSESSMENT")
        print(f"File size: {self.file_size_mb:.1f} MB")
        print("="*60)
        
        # Initialize counters
        total_rows = 0
        chunk_count = 0
        
        # Statistics accumulators
        missing_stats = {}
        label_counts = Counter()
        email_validation = {'sender': {'valid': 0, 'invalid': 0}, 'receiver': {'valid': 0, 'invalid': 0}}
        text_stats = {'subject_lengths': [], 'body_lengths': []}
        language_stats = {'subject': {'english': 0, 'non_english': 0}, 'body': {'english': 0, 'non_english': 0}}
        duplicate_subjects = set()
        url_patterns = {'has_urls': 0, 'no_urls': 0}
        duplicate_count = 0
        
        # Email regex pattern
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        
        print(f"Processing dataset in chunks of {chunk_size:,} rows...")
        
        try:
            # Process file in chunks
            for chunk_num, chunk in enumerate(pd.read_csv(self.csv_file_path, chunksize=chunk_size, encoding='utf-8', on_bad_lines='skip')):
                if max_chunks > 0 and chunk_num >= max_chunks:
                    break
                    
                chunk_count += 1
                rows_in_chunk = len(chunk)
                total_rows += rows_in_chunk
                
                print(f"  Processing chunk {chunk_num + 1}: {rows_in_chunk:,} rows")
                
                # Initialize missing stats for first chunk
                if chunk_num == 0:
                    # Filter out unnamed columns from the start
                    unnamed_cols = [col for col in chunk.columns if col.startswith('Unnamed:')]
                    if unnamed_cols:
                        print(f"  Filtering out {len(unnamed_cols)} unnamed column(s): {unnamed_cols}")
                        chunk = chunk.drop(columns=unnamed_cols)
                    
                    for col in chunk.columns:
                        missing_stats[col] = 0
                    print(f"  Columns found ({len(chunk.columns)}): {list(chunk.columns)}")
                else:
                    # Ensure consistent column filtering for subsequent chunks
                    unnamed_cols = [col for col in chunk.columns if col.startswith('Unnamed:')]
                    if unnamed_cols:
                        chunk = chunk.drop(columns=unnamed_cols)
                
                # Missing values analysis
                for col in chunk.columns:
                    missing_stats[col] += chunk[col].isnull().sum()
                
                # Duplicate analysis
                duplicate_count += chunk.duplicated().sum()
                
                # Label distribution (handle potential data issues)
                if 'label' in chunk.columns:
                    # Clean label column - convert to numeric, handle text in label column
                    labels = pd.to_numeric(chunk['label'], errors='coerce')
                    valid_labels = labels.dropna()
                    if len(valid_labels) > 0:
                        label_counts.update(valid_labels.astype(int).tolist())
                
                # Email validation
                for email_col in ['sender', 'receiver']:
                    if email_col in chunk.columns:
                        for email in chunk[email_col].fillna(''):
                            if email and email_pattern.match(str(email)):
                                email_validation[email_col]['valid'] += 1
                            else:
                                email_validation[email_col]['invalid'] += 1
                
                # Text analysis (sample to avoid memory issues)
                if 'subject' in chunk.columns:
                    lengths = chunk['subject'].fillna('').astype(str).str.len()
                    # Sample subset to avoid memory issues
                    sample_size = min(1000, len(lengths))
                    text_stats['subject_lengths'].extend(lengths.sample(n=sample_size, random_state=42).tolist())
                    # Track duplicate subjects
                    subjects = chunk['subject'].fillna('').astype(str)
                    duplicate_subjects.update(subjects.tolist())
                    
                    # Language detection for subjects (analyze all records for accuracy)
                    for subject_text in chunk['subject'].fillna(''):
                        if subject_text and str(subject_text).strip():
                            if self.language_detector.is_likely_english(subject_text):
                                language_stats['subject']['english'] += 1
                            else:
                                language_stats['subject']['non_english'] += 1
                
                if 'body' in chunk.columns:
                    lengths = chunk['body'].fillna('').astype(str).str.len()
                    # Sample subset to avoid memory issues
                    sample_size = min(1000, len(lengths))
                    text_stats['body_lengths'].extend(lengths.sample(n=sample_size, random_state=42).tolist())
                    
                    # Language detection for bodies (analyze all records for accuracy)
                    for body_text in chunk['body'].fillna(''):
                        if body_text and str(body_text).strip():
                            if self.language_detector.is_likely_english(body_text):
                                language_stats['body']['english'] += 1
                            else:
                                language_stats['body']['non_english'] += 1
                
                # URL analysis
                if 'urls' in chunk.columns:
                    for urls_field in chunk['urls'].fillna(''):
                        if urls_field and str(urls_field).strip() and str(urls_field) != 'nan':
                            url_patterns['has_urls'] += 1
                        else:
                            url_patterns['no_urls'] += 1
            
            # Store results in quality report
            self.quality_report = self._generate_chunked_report(
                total_rows, missing_stats, label_counts, email_validation,
                text_stats, duplicate_subjects, url_patterns, duplicate_count, language_stats
            )
            
            return self.quality_report
            
        except Exception as e:
            print(f"❌ Error during chunked assessment: {str(e)}")
            raise
    
    def comprehensive_quality_assessment(self, nrows=None, sample_size=None):
        """
        Perform comprehensive data quality assessment by loading data into memory.
        
        Args:
            nrows (int): Number of rows to read (for testing with large files)
            sample_size (int): Random sample size to work with
        """
        print("COMPREHENSIVE EMAIL DATASET QUALITY ASSESSMENT")
        print(f"File size: {self.file_size_mb:.1f} MB")
        print("="*60)
        
        try:
            # Load data
            self._load_data(nrows, sample_size)
            
            # Run all assessments
            self._basic_info_analysis()
            self._missing_values_analysis()
            self._duplicate_analysis()
            self._label_distribution_analysis()
            self._email_format_validation()
            self._url_analysis()
            self._text_content_analysis()
            self._language_analysis()
            
            return self.quality_report
            
        except Exception as e:
            print(f"❌ Error during comprehensive assessment: {str(e)}")
            raise
    
    def _load_data(self, nrows=None, sample_size=None):
        """Load CSV data with memory-efficient options."""
        print("Loading dataset...")
        
        try:
            # First, get basic info about the file
            with open(self.csv_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                first_line = f.readline().strip()
                print(f"📋 Headers detected: {first_line}")
            
            # Load data with appropriate parameters
            if nrows:
                self.df = pd.read_csv(self.csv_file_path, nrows=nrows, encoding='utf-8', on_bad_lines='skip')
                print(f"✅ Loaded first {nrows} rows for analysis")
            else:
                self.df = pd.read_csv(self.csv_file_path, encoding='utf-8', on_bad_lines='skip')
                print(f"✅ Loaded complete dataset")
            
            # Remove unnamed columns that are typically empty/irrelevant
            unnamed_cols = [col for col in self.df.columns if col.startswith('Unnamed:')]
            if unnamed_cols:
                print(f"🧹 Removing {len(unnamed_cols)} unnamed column(s): {unnamed_cols}")
                self.df = self.df.drop(columns=unnamed_cols)
            
            # If dataset is very large, take a random sample
            if sample_size and len(self.df) > sample_size:
                self.df = self.df.sample(n=sample_size, random_state=42)
                print(f"📊 Working with random sample of {sample_size} records")
                
            print(f"📊 Dataset shape: {self.df.shape}")
            print(f"📊 Columns ({len(self.df.columns)}): {list(self.df.columns)}")
            
        except Exception as e:
            print(f"❌ Error loading data: {str(e)}")
            raise
    
    def _basic_info_analysis(self):
        """Perform basic dataset information analysis."""
        print("\n" + "="*60)
        print("BASIC DATASET INFORMATION")
        print("="*60)
        
        info = {
            'total_records': len(self.df),
            'total_columns': len(self.df.columns),
            'memory_usage_mb': self.df.memory_usage(deep=True).sum() / 1024**2,
            'columns': list(self.df.columns)
        }
        
        print(f"Total Records: {info['total_records']:,}")
        print(f"Total Columns: {info['total_columns']}")
        print(f"Memory Usage: {info['memory_usage_mb']:.2f} MB")
        print(f"Expected Columns: sender, receiver, date, subject, body, label, urls")
        print(f"Actual Columns: {info['columns']}")
        
        # Check if all expected columns are present
        expected_cols = ['sender', 'receiver', 'date', 'subject', 'body', 'label', 'urls']
        missing_cols = [col for col in expected_cols if col not in self.df.columns]
        extra_cols = [col for col in self.df.columns if col not in expected_cols and not col.startswith('Unnamed:')]
        
        if missing_cols:
            print(f"⚠️  Missing expected columns: {missing_cols}")
        if extra_cols:
            print(f"ℹ️  Extra columns found: {extra_cols}")
        if not missing_cols and len(self.df.columns) == 7:
            print("✅ All 7 expected columns are present")
        elif not missing_cols and len(expected_cols) == len([col for col in self.df.columns if col in expected_cols]):
            print("✅ All 7 expected columns are present")
            
        self.quality_report['basic_info'] = info
        return info
    
    def _missing_values_analysis(self):
        """Analyze missing values in the dataset."""
        print("\n" + "="*60)
        print("🔍 MISSING VALUES ANALYSIS")
        print("="*60)
        
        missing_stats = []
        total_records = len(self.df)
        
        for column in self.df.columns:
            missing_count = self.df[column].isnull().sum()
            missing_percentage = (missing_count / total_records) * 100
            
            missing_stats.append({
                'column': column,
                'missing_count': missing_count,
                'missing_percentage': missing_percentage,
                'data_type': str(self.df[column].dtype)
            })
            
            print(f"{column:12} | Missing: {missing_count:6,} ({missing_percentage:5.1f}%) | Type: {self.df[column].dtype}")
        
        # Summary
        columns_with_missing = sum(1 for stat in missing_stats if stat['missing_count'] > 0)
        print(f"\n📈 Summary: {columns_with_missing}/{len(self.df.columns)} columns have missing values")
        
        self.quality_report['missing_values'] = missing_stats
        return missing_stats
    
    def _duplicate_analysis(self):
        """Analyze duplicate records in the dataset."""
        print("\n" + "="*60)
        print("🔄 DUPLICATE RECORDS ANALYSIS")
        print("="*60)
        
        # Complete duplicates
        total_duplicates = self.df.duplicated().sum()
        duplicate_percentage = (total_duplicates / len(self.df)) * 100
        
        print(f"Complete Duplicates: {total_duplicates:,} ({duplicate_percentage:.1f}%)")
        
        # Duplicates by key fields
        duplicate_stats = {}
        
        # Check for duplicate emails based on sender + subject + body
        if all(col in self.df.columns for col in ['sender', 'subject', 'body']):
            email_duplicates = self.df.duplicated(subset=['sender', 'subject', 'body']).sum()
            duplicate_stats['sender_subject_body'] = email_duplicates
            print(f"Duplicate emails (sender+subject+body): {email_duplicates:,}")
        
        # Check for duplicate subjects
        if 'subject' in self.df.columns:
            subject_duplicates = self.df.duplicated(subset=['subject']).sum()
            duplicate_stats['subject'] = subject_duplicates
            print(f"Duplicate subjects: {subject_duplicates:,}")
        
        duplicate_stats['total_duplicates'] = total_duplicates
        self.quality_report['duplicates'] = duplicate_stats
        return duplicate_stats
    
    def _label_distribution_analysis(self):
        """Analyze the distribution of phishing vs legitimate emails."""
        print("\n" + "="*60)
        print("🏷️  LABEL DISTRIBUTION ANALYSIS")
        print("="*60)
        
        if 'label' not in self.df.columns:
            print("❌ 'label' column not found")
            return None
        
        # Handle potential non-numeric labels
        numeric_labels = pd.to_numeric(self.df['label'], errors='coerce')
        valid_label_count = numeric_labels.notna().sum()
        
        if valid_label_count == 0:
            print("❌ No valid numeric labels found in label column")
            return None
        
        label_counts = numeric_labels.value_counts()
        label_percentages = numeric_labels.value_counts(normalize=True) * 100
        
        print("Label Distribution:")
        for label, count in label_counts.items():
            percentage = label_percentages[label]
            label_type = "Phishing" if label == 1 else "Legitimate" if label == 0 else "Unknown"
            print(f"  {int(label)} ({label_type:10}): {count:6,} ({percentage:5.1f}%)")
        
        if valid_label_count < len(self.df):
            invalid_labels = len(self.df) - valid_label_count
            print(f"  ⚠️  Invalid/Non-numeric labels: {invalid_labels:,}")
        
        # Check for class imbalance
        if len(label_counts) == 2 and 0 in label_counts.index and 1 in label_counts.index:
            minority_percentage = min(label_percentages[0], label_percentages[1])
            if minority_percentage < 10:
                print(f"⚠️  Severe class imbalance detected! Minority class: {minority_percentage:.1f}%")
            elif minority_percentage < 20:
                print(f"⚠️  Moderate class imbalance detected! Minority class: {minority_percentage:.1f}%")
            else:
                print(f"✅ Balanced dataset. Minority class: {minority_percentage:.1f}%")
        
        label_stats = {
            'distribution': label_counts.to_dict(),
            'percentages': label_percentages.to_dict(),
            'valid_labels': valid_label_count,
            'invalid_labels': len(self.df) - valid_label_count
        }
        
        self.quality_report['label_distribution'] = label_stats
        return label_stats
    
    def _email_format_validation(self):
        """Validate email addresses in sender and receiver columns."""
        print("\n" + "="*60)
        print("EMAIL FORMAT VALIDATION")
        print("="*60)
        
        email_validation_stats = {}
        
        # Simple email regex pattern
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        
        for col in ['sender', 'receiver']:
            if col in self.df.columns:
                valid_emails = 0
                invalid_emails = 0
                empty_emails = 0
                
                for email in self.df[col].fillna(''):
                    if pd.isna(email) or email == '':
                        empty_emails += 1
                    elif email_pattern.match(str(email)):
                        valid_emails += 1
                    else:
                        invalid_emails += 1
                
                total = len(self.df)
                valid_percentage = (valid_emails / total) * 100
                invalid_percentage = (invalid_emails / total) * 100
                empty_percentage = (empty_emails / total) * 100
                
                print(f"\n{col.upper()} Column:")
                print(f"  Valid emails:   {valid_emails:6,} ({valid_percentage:5.1f}%)")
                print(f"  Invalid emails: {invalid_emails:6,} ({invalid_percentage:5.1f}%)")
                print(f"  Empty/Missing:  {empty_emails:6,} ({empty_percentage:5.1f}%)")
                
                email_validation_stats[col] = {
                    'valid': valid_emails,
                    'invalid': invalid_emails,
                    'empty': empty_emails,
                    'valid_percentage': valid_percentage
                }
        
        self.quality_report['email_validation'] = email_validation_stats
        return email_validation_stats
    
    def _url_analysis(self):
        """Analyze URLs in the dataset."""
        print("\n" + "="*60)
        print("🔗 URL ANALYSIS")
        print("="*60)
        
        if 'urls' not in self.df.columns:
            print("❌ 'urls' column not found")
            return None
        
        url_stats = {
            'total_records': len(self.df),
            'records_with_urls': 0,
            'records_without_urls': 0,
            'total_urls': 0,
            'unique_domains': set(),
            'suspicious_domains': []
        }
        
        # Common suspicious URL patterns
        suspicious_patterns = [
            r'bit\.ly', r'tinyurl\.com', r'goo\.gl', r't\.co',  # URL shorteners
            r'[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}',  # IP addresses
            r'[a-z0-9\-]{10,}\.tk|\.ml|\.ga|\.cf',  # Suspicious TLDs
        ]
        
        for urls_field in self.df['urls'].fillna(''):
            if pd.isna(urls_field) or urls_field == '' or str(urls_field).strip() == '' or str(urls_field) == 'nan':
                url_stats['records_without_urls'] += 1
                continue
            
            url_stats['records_with_urls'] += 1
            
            # Extract URLs (simple approach - look for http patterns)
            urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', str(urls_field))
            url_stats['total_urls'] += len(urls)
            
            for url in urls:
                try:
                    domain = urlparse(url).netloc
                    if domain:
                        url_stats['unique_domains'].add(domain)
                        
                        # Check for suspicious patterns
                        for pattern in suspicious_patterns:
                            if re.search(pattern, url):
                                url_stats['suspicious_domains'].append(domain)
                                break
                except:
                    pass
        
        print(f"Records with URLs: {url_stats['records_with_urls']:,} ({(url_stats['records_with_urls']/url_stats['total_records']*100):.1f}%)")
        print(f"Records without URLs: {url_stats['records_without_urls']:,} ({(url_stats['records_without_urls']/url_stats['total_records']*100):.1f}%)")
        print(f"Total URLs found: {url_stats['total_urls']:,}")
        print(f"Unique domains: {len(url_stats['unique_domains']):,}")
        print(f"Potentially suspicious domains: {len(set(url_stats['suspicious_domains'])):,}")
        
        # Convert set to list for JSON serialization
        url_stats['unique_domains'] = list(url_stats['unique_domains'])
        
        self.quality_report['url_analysis'] = url_stats
        return url_stats
    
    def _text_content_analysis(self):
        """Analyze text content in subject and body fields."""
        print("\n" + "="*60)
        print("📝 TEXT CONTENT ANALYSIS")
        print("="*60)
        
        text_stats = {}
        
        for field in ['subject', 'body']:
            if field not in self.df.columns:
                continue
                
            # Basic text statistics
            lengths = self.df[field].fillna('').astype(str).str.len()
            word_counts = self.df[field].fillna('').astype(str).str.split().str.len()
            
            stats = {
                'avg_length': lengths.mean(),
                'median_length': lengths.median(),
                'max_length': lengths.max(),
                'min_length': lengths.min(),
                'avg_word_count': word_counts.mean(),
                'median_word_count': word_counts.median(),
                'empty_count': (lengths == 0).sum(),
                'empty_percentage': (lengths == 0).mean() * 100
            }
            
            print(f"\n{field.upper()} Field Statistics:")
            print(f"  Average length: {stats['avg_length']:.1f} characters")
            print(f"  Median length:  {stats['median_length']:.1f} characters")
            print(f"  Max length:     {stats['max_length']:,} characters")
            print(f"  Average words:  {stats['avg_word_count']:.1f}")
            print(f"  Empty records:  {stats['empty_count']:,} ({stats['empty_percentage']:.1f}%)")
            
            text_stats[field] = stats
        
        self.quality_report['text_analysis'] = text_stats
        return text_stats
    
    def _language_analysis(self):
        """Analyze language detection for subject and body fields."""
        print("\n" + "="*60)
        print("LANGUAGE ANALYSIS")
        print("="*60)
        
        language_stats = {}
        
        for field in ['subject', 'body']:
            if field not in self.df.columns:
                continue
            
            # Analyze all data without sampling for complete accuracy
            field_data = self.df[field].fillna('')
            
            english_count = 0
            non_english_count = 0
            empty_count = 0
            
            print(f"\n{field.upper()} Language Detection (analyzing all {len(field_data):,} records):")
            
            for text in field_data:
                if not text or pd.isna(text) or str(text).strip() == '':
                    empty_count += 1
                elif self.language_detector.is_likely_english(str(text)):
                    english_count += 1
                else:
                    non_english_count += 1
            
            total_analyzed = english_count + non_english_count
            
            if total_analyzed > 0:
                english_pct = (english_count / total_analyzed) * 100
                non_english_pct = (non_english_count / total_analyzed) * 100
                
                print(f"  English text:     {english_count:6,} ({english_pct:5.1f}%)")
                print(f"  Non-English text: {non_english_count:6,} ({non_english_pct:5.1f}%)")
                print(f"  Empty/Missing:    {empty_count:6,}")
                
                # Provide assessment
                if english_pct >= 90:
                    print(f"  ✅ Predominantly English content")
                elif english_pct >= 70:
                    print(f"  ⚠️  Mostly English with some non-English content")
                elif english_pct >= 50:
                    print(f"  ⚠️  Mixed language content")
                else:
                    print(f"  ⚠️  Predominantly non-English content")
                
                language_stats[field] = {
                    'english_count': english_count,
                    'non_english_count': non_english_count,
                    'empty_count': empty_count,
                    'english_percentage': english_pct,
                    'total_analyzed': total_analyzed,
                    'records_analyzed': len(field_data)
                }
            else:
                print(f"  ❌ No valid text found for analysis")
                language_stats[field] = {
                    'english_count': 0,
                    'non_english_count': 0,
                    'empty_count': empty_count,
                    'english_percentage': 0,
                    'total_analyzed': 0,
                    'records_analyzed': len(field_data)
                }
        
        self.quality_report['language_analysis'] = language_stats
        return language_stats
    
    def _generate_chunked_report(self, total_rows, missing_stats, label_counts, 
                                email_validation, text_stats, duplicate_subjects, 
                                url_patterns, duplicate_count, language_stats):
        """Generate report from chunked processing results."""
        print(f"\n✅ Processed {total_rows:,} total rows")
        
        print("\n" + "="*60)
        print("DATA QUALITY SUMMARY")
        print("="*60)
        
        # Basic info
        print(f"Total Records Analyzed: {total_rows:,}")
        print(f"Total Columns: {len(missing_stats)}")
        
        # Missing values
        print(f"\n🔍 Missing Values:")
        for col, missing_count in missing_stats.items():
            missing_pct = (missing_count / total_rows) * 100 if total_rows > 0 else 0
            print(f"  {col:12} | Missing: {missing_count:6,} ({missing_pct:5.1f}%)")
        
        # Duplicates
        duplicate_percentage = (duplicate_count / total_rows) * 100 if total_rows > 0 else 0
        print(f"\n🔄 Complete Duplicates: {duplicate_count:,} ({duplicate_percentage:.1f}%)")
        
        # Label distribution
        print(f"\n🏷️  Label Distribution:")
        if label_counts:
            total_valid_labels = sum(label_counts.values())
            for label, count in sorted(label_counts.items()):
                pct = (count / total_valid_labels) * 100 if total_valid_labels > 0 else 0
                label_type = "Phishing" if label == 1 else "Legitimate" if label == 0 else "Unknown"
                print(f"  {label} ({label_type:10}): {count:6,} ({pct:5.1f}%)")
            
            # Check class balance
            if len(label_counts) == 2 and 0 in label_counts and 1 in label_counts:
                percentages = [(label_counts[0] / total_valid_labels) * 100, (label_counts[1] / total_valid_labels) * 100]
                min_pct = min(percentages)
                if min_pct < 10:
                    print(f"  ⚠️  Severe class imbalance! Minority class: {min_pct:.1f}%")
                elif min_pct < 20:
                    print(f"  ⚠️  Moderate class imbalance. Minority class: {min_pct:.1f}%")
                else:
                    print(f"  ✅ Reasonably balanced dataset. Minority class: {min_pct:.1f}%")
        else:
            print("  ❌ No valid labels found or label column has issues")
        
        # Email validation
        print(f"\n📧 Email Validation:")
        for email_col, stats in email_validation.items():
            total_emails = stats['valid'] + stats['invalid']
            if total_emails > 0:
                valid_pct = (stats['valid'] / total_emails) * 100
                print(f"  {email_col:12} | Valid: {stats['valid']:6,} ({valid_pct:5.1f}%) | Invalid: {stats['invalid']:6,}")
        
        # Text analysis
        print(f"\n📝 Text Analysis:")
        if text_stats['subject_lengths']:
            avg_subject = np.mean(text_stats['subject_lengths'])
            max_subject = max(text_stats['subject_lengths'])
            print(f"  Subject       | Avg: {avg_subject:5.1f} chars | Max: {max_subject:,} chars")
        
        if text_stats['body_lengths']:
            avg_body = np.mean(text_stats['body_lengths'])
            max_body = max(text_stats['body_lengths'])
            print(f"  Body          | Avg: {avg_body:5.1f} chars | Max: {max_body:,} chars")
        
        # Duplicate subjects
        unique_subjects = len(set(duplicate_subjects))
        total_subjects = len(duplicate_subjects)
        if total_subjects > 0:
            duplicate_subject_count = total_subjects - unique_subjects
            dup_pct = (duplicate_subject_count / total_subjects) * 100
            print(f"  Duplicate subjects: {duplicate_subject_count:,} ({dup_pct:.1f}%)")
        
        # URL analysis
        print(f"\n🔗 URL Analysis:")
        total_url_records = url_patterns['has_urls'] + url_patterns['no_urls']
        if total_url_records > 0:
            url_pct = (url_patterns['has_urls'] / total_url_records) * 100
            print(f"  Records with URLs: {url_patterns['has_urls']:,} ({url_pct:.1f}%)")
            print(f"  Records without URLs: {url_patterns['no_urls']:,} ({100-url_pct:.1f}%)")
        
        # Language analysis
        print(f"\n🌍 Language Analysis:")
        for field, stats in language_stats.items():
            total_analyzed = stats['english'] + stats['non_english']
            if total_analyzed > 0:
                english_pct = (stats['english'] / total_analyzed) * 100
                print(f"  {field.capitalize():8} | English: {stats['english']:6,} ({english_pct:5.1f}%) | Non-English: {stats['non_english']:6,}")
                if english_pct >= 90:
                    print(f"              ✅ Predominantly English")
                elif english_pct >= 70:
                    print(f"              ⚠️  Mostly English")
                elif english_pct >= 50:
                    print(f"              ⚠️  Mixed languages")
                else:
                    print(f"              ⚠️  Predominantly non-English")
        
        self._print_quality_issues_summary(total_rows, missing_stats, email_validation, label_counts)
        
        # Create quality report structure
        return {
            'basic_info': {
                'total_records': total_rows,
                'total_columns': len(missing_stats),
                'file_size_mb': self.file_size_mb,
                'processing_method': 'chunked'
            },
            'missing_values': [{'column': col, 'missing_count': count, 'missing_percentage': (count/total_rows)*100} 
                              for col, count in missing_stats.items()],
            'duplicates': {'total_duplicates': duplicate_count, 'duplicate_percentage': (duplicate_count/total_rows)*100},
            'label_distribution': {'distribution': dict(label_counts), 'total_valid_labels': sum(label_counts.values())},
            'email_validation': email_validation,
            'url_analysis': url_patterns
        }
    
    def _print_quality_issues_summary(self, total_rows, missing_stats, email_validation, label_counts):
        """Print summary of key quality issues."""
        print(f"\n⚠️  Key Quality Issues:")
        issues_found = []
        
        # Check for high missing values
        high_missing = [col for col, count in missing_stats.items() 
                       if (count / total_rows) * 100 > 50]
        if high_missing:
            issues_found.append(f"Columns with >50% missing values: {', '.join(high_missing)}")
        
        # Check email validation rates
        for col, stats in email_validation.items():
            total = stats['valid'] + stats['invalid']
            if total > 0 and (stats['valid'] / total) < 0.8:
                issues_found.append(f"Low valid email rate in {col}: {(stats['valid']/total)*100:.1f}%")
        
        # Check label issues
        if not label_counts:
            issues_found.append("No valid labels found - label column may have data quality issues")
        
        if issues_found:
            for issue in issues_found:
                print(f"  • {issue}")
        else:
            print(f"  ✅ No major data quality issues detected!")
        
        print(f"\n🎉 Quality assessment completed!")
    
    def generate_summary_report(self):
        """Generate a comprehensive summary report."""
        print("\n" + "="*60)
        print("📋 DATA QUALITY SUMMARY REPORT")
        print("="*60)
        
        print("\n🎯 KEY FINDINGS:")
        
        # Dataset size
        total_records = self.quality_report.get('basic_info', {}).get('total_records', 0)
        processing_method = self.quality_report.get('basic_info', {}).get('processing_method', 'comprehensive')
        print(f"• Dataset contains {total_records:,} email records (processed using {processing_method} method)")
        
        # Missing values
        missing_stats = self.quality_report.get('missing_values', [])
        high_missing_columns = [stat for stat in missing_stats if stat.get('missing_percentage', 0) > 50]
        if high_missing_columns:
            print(f"• ⚠️  {len(high_missing_columns)} columns have >50% missing values")
        
        # Duplicates
        duplicate_stats = self.quality_report.get('duplicates', {})
        total_duplicates = duplicate_stats.get('total_duplicates', 0)
        if total_duplicates > 0:
            dup_percentage = duplicate_stats.get('duplicate_percentage', 0)
            print(f"• ⚠️  {total_duplicates:,} duplicate records found ({dup_percentage:.1f}%)")
        
        # Label distribution
        label_dist = self.quality_report.get('label_distribution', {})
        if label_dist and label_dist.get('distribution'):
            distribution = label_dist['distribution']
            if 0 in distribution and 1 in distribution:
                total_valid = distribution[0] + distribution[1]
                min_percentage = min(distribution[0], distribution[1]) / total_valid * 100
                if min_percentage < 20:
                    print(f"• ⚠️  Class imbalance detected (minority: {min_percentage:.1f}%)")
        
        # Email validation
        email_val = self.quality_report.get('email_validation', {})
        for field, stats in email_val.items():
            valid_pct = stats.get('valid_percentage', 0)
            if valid_pct < 90:
                print(f"• ⚠️  {field} field has {valid_pct:.1f}% valid email formats")
        
        # URL analysis
        url_analysis = self.quality_report.get('url_analysis', {})
        if url_analysis:
            records_with_urls = url_analysis.get('has_urls', 0)
            total_records_url = url_analysis.get('has_urls', 0) + url_analysis.get('no_urls', 0)
            if total_records_url > 0:
                url_percentage = (records_with_urls / total_records_url) * 100
                print(f"• {records_with_urls:,} records contain URLs ({url_percentage:.1f}%)")
        
        print(f"\n✅ Data quality assessment completed!")
        return self.quality_report
    
    def save_report_to_file(self, output_file='email_data_quality_report.txt'):
        """Save the quality report to a text file."""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("EMAIL DATASET QUALITY ASSESSMENT REPORT\n")
            f.write("="*50 + "\n\n")
            f.write(f"Generated on: {pd.Timestamp.now()}\n")
            f.write(f"Dataset: {self.csv_file_path}\n")
            f.write(f"File size: {self.file_size_mb:.1f} MB\n")
            f.write(f"Processing method: {'Chunked' if self.use_chunked_processing else 'Comprehensive'}\n\n")
            
            # Write each section
            for section, data in self.quality_report.items():
                f.write(f"{section.upper().replace('_', ' ')}\n")
                f.write("-" * 30 + "\n")
                f.write(str(data) + "\n\n")
        
        print(f"📄 Detailed report saved to: {output_file}")
    
    def run_assessment(self, chunk_size=10000, max_chunks=0, nrows=None):
        """
        Run the appropriate assessment method based on file size.
        
        Args:
            chunk_size (int): Size of chunks for chunked processing
            max_chunks (int): Maximum chunks to process (0 = all)
            nrows (int): Number of rows to load for comprehensive analysis
        """
        print(f"🔍 EMAIL DATASET QUALITY ASSESSMENT")
        print(f"📁 File: {self.csv_file_path}")
        print(f"📏 Size: {self.file_size_mb:.1f} MB")
        print("="*60)
        
        try:
            if self.use_chunked_processing:
                print("🚀 Using chunked processing for large file...")
                self.chunked_quality_assessment(chunk_size, max_chunks)
            else:
                print("🔬 Using comprehensive analysis for manageable file size...")
                self.comprehensive_quality_assessment(nrows)
            
            # Generate summary
            self.generate_summary_report()
            
            # Save report
            self.save_report_to_file()
            
            return self.quality_report
            
        except Exception as e:
            print(f"❌ Error during assessment: {str(e)}")
            raise

def main():
    """Main function to run the unified data quality assessment."""
    csv_file_path = "app\static\js\simulated-pc\levels\level-two\data\CEAS_08.csv"
    
    # Create assessment instance
    assessment = EmailDataQualityAssessment(csv_file_path)
    
    # Run assessment - automatically chooses method based on file size
    assessment.run_assessment(
        chunk_size=10000,    # Size of chunks for large files
        max_chunks=0,        # 0 = process all chunks, set to 10 for quick preview
        nrows=None           # None = load all data for small files, set to 50000 for sample
    )

if __name__ == "__main__":
    main()