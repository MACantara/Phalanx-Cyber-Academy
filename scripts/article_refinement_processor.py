#!/usr/bin/env python3
"""
Article Refinement Processor

This script processes all batch CSV files to:
1. Remove low-quality articles based on content and length criteria
2. Fix punctuation, grammar, and formatting issues
3. Clean up text while preserving main content
4. Update batch summary with new article counts

Author: Generated for Phalanx Cyber Academy Level 1 Challenge
Date: September 2025
"""

import pandas as pd
import re
import os
from pathlib import Path
import logging
from typing import List, Tuple, Dict
import nltk
from textstat import flesch_reading_ease, flesch_kincaid_grade
import spacy
from spellchecker import SpellChecker

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ArticleRefinementProcessor:
    def __init__(self, batches_dir: str):
        """
        Initialize the Article Refinement Processor
        
        Args:
            batches_dir: Directory containing batch CSV files
        """
        self.batches_dir = Path(batches_dir)
        self.refined_batches_dir = self.batches_dir / "refined"
        self.refined_batches_dir.mkdir(exist_ok=True)
        
        # Initialize NLP tools
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy English model not found. Some text processing will be limited.")
            self.nlp = None
            
        self.spell = SpellChecker()
        
        # Quality thresholds
        self.min_text_length = 50  # Minimum characters in text_without_stopwords
        self.min_title_length = 10  # Minimum characters in title_without_stopwords
        self.max_text_length = 5000  # Maximum characters to prevent extremely long articles
        self.min_readability_score = 10  # Flesch reading ease minimum
        self.max_misspelled_ratio = 0.4  # Maximum ratio of misspelled words
        
        # Statistics tracking
        self.stats = {
            'total_articles_processed': 0,
            'articles_removed': 0,
            'articles_refined': 0,
            'total_batches_processed': 0
        }
        
    def assess_article_quality(self, title: str, text: str) -> Tuple[bool, List[str]]:
        """
        Assess whether an article meets quality standards
        
        Args:
            title: Article title without stopwords
            text: Article text without stopwords
            
        Returns:
            Tuple of (keep_article, list_of_issues)
        """
        issues = []
        
        # Check basic length requirements
        if len(text.strip()) < self.min_text_length:
            issues.append(f"Text too short ({len(text)} chars)")
            
        if len(title.strip()) < self.min_title_length:
            issues.append(f"Title too short ({len(title)} chars)")
            
        if len(text.strip()) > self.max_text_length:
            issues.append(f"Text too long ({len(text)} chars)")
            
        # Check for nonsensical content
        if self._is_nonsensical_text(text):
            issues.append("Text appears nonsensical or corrupted")
            
        # Check readability (if text is long enough)
        if len(text.split()) > 10:
            try:
                readability = flesch_reading_ease(text)
                if readability < self.min_readability_score:
                    issues.append(f"Poor readability score ({readability})")
            except:
                pass  # Skip readability check if it fails
                
        # Check for excessive misspelling
        if self._has_excessive_misspelling(text):
            issues.append("Excessive misspelling detected")
            
        # Determine if article should be kept
        critical_issues = [issue for issue in issues if any(critical in issue.lower() 
                          for critical in ['too short', 'nonsensical', 'corrupted'])]
        
        keep_article = len(critical_issues) == 0
        
        return keep_article, issues
    
    def _is_nonsensical_text(self, text: str) -> bool:
        """
        Check if text appears nonsensical or corrupted
        """
        # Check for extremely long words (likely concatenated)
        words = text.split()
        very_long_words = [w for w in words if len(w) > 25]
        if len(very_long_words) > len(words) * 0.1:  # More than 10% very long words
            return True
            
        # Check for lack of spaces (concatenated text)
        if len(text) > 200 and ' ' not in text[:100]:
            return True
            
        # Check for repetitive patterns
        if re.search(r'(.{3,})\1{3,}', text):  # Same pattern repeated 3+ times
            return True
            
        # Check for excessive special characters
        special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s\.\,\!\?\;\:]', text)) / len(text)
        if special_char_ratio > 0.15:
            return True
            
        return False
    
    def _has_excessive_misspelling(self, text: str) -> bool:
        """
        Check if text has excessive misspelling
        """
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        if len(words) < 10:  # Skip check for very short texts
            return False
            
        # Sample words to avoid checking every word in very long texts
        sample_size = min(50, len(words))
        sample_words = words[:sample_size]
        
        misspelled = self.spell.unknown(sample_words)
        misspelled_ratio = len(misspelled) / len(sample_words)
        
        return misspelled_ratio > self.max_misspelled_ratio
    
    def refine_text(self, text: str) -> str:
        """
        Clean and refine text content
        
        Args:
            text: Raw text to refine
            
        Returns:
            Refined text
        """
        if not text or pd.isna(text):
            return ""
            
        # Convert to string and strip
        text = str(text).strip()
        
        # Fix basic spacing issues
        text = self._fix_spacing(text)
        
        # Fix punctuation
        text = self._fix_punctuation(text)
        
        # Fix capitalization
        text = self._fix_capitalization(text)
        
        # Remove excessive repetition
        text = self._remove_excessive_repetition(text)
        
        # Clean up formatting
        text = self._clean_formatting(text)
        
        return text.strip()
    
    def _fix_spacing(self, text: str) -> str:
        """Fix spacing issues in text"""
        # Add spaces around punctuation when missing
        text = re.sub(r'([a-zA-Z])([.!?])', r'\1 \2', text)
        text = re.sub(r'([.!?])([a-zA-Z])', r'\1 \2', text)
        text = re.sub(r'([a-zA-Z])([,;:])', r'\1\2', text)  # No space before these
        text = re.sub(r'([,;:])([a-zA-Z])', r'\1 \2', text)  # Space after these
        
        # Fix words that are clearly concatenated
        # Look for patterns like "wordword" and try to split them
        def split_concatenated(match):
            word = match.group(0)
            if len(word) > 15:  # Only split very long words
                # Try to find split points at common word endings/beginnings
                for i in range(3, len(word) - 3):
                    if (word[:i].lower() in ['the', 'and', 'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'been', 'were'] or
                        word[i:].lower().startswith(('ing', 'ed', 'er', 'ly', 'tion', 'al', 'ic'))):
                        return word[:i] + ' ' + word[i:]
            return word
        
        text = re.sub(r'\b[a-zA-Z]{20,}\b', split_concatenated, text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        return text
    
    def _fix_punctuation(self, text: str) -> str:
        """Fix punctuation issues"""
        # Ensure sentences end with proper punctuation
        sentences = re.split(r'(?<=[.!?])\s+', text)
        fixed_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and not re.search(r'[.!?]$', sentence):
                # Add period if sentence doesn't end with punctuation
                if len(sentence) > 10:  # Only for substantial sentences
                    sentence += '.'
            fixed_sentences.append(sentence)
        
        text = ' '.join(fixed_sentences)
        
        # Fix common punctuation issues
        text = re.sub(r'\s+([.!?])', r'\1', text)  # Remove space before punctuation
        text = re.sub(r'([.!?])\s*([a-z])', r'\1 \2', text)  # Space after punctuation
        text = re.sub(r'\.+', '.', text)  # Multiple periods to single
        text = re.sub(r'\!+', '!', text)  # Multiple exclamations to single
        text = re.sub(r'\?+', '?', text)  # Multiple questions to single
        
        return text
    
    def _fix_capitalization(self, text: str) -> str:
        """Fix capitalization issues"""
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        fixed_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                # Capitalize first letter of sentence
                sentence = sentence[0].upper() + sentence[1:] if len(sentence) > 1 else sentence.upper()
                
                # Fix common proper nouns (basic list)
                proper_nouns = {
            'america': 'America', 'american': 'American', 'americans': 'Americans',
            'united states': 'United States', 'usa': 'USA', 'us': 'US',
            'trump': 'Trump', 'clinton': 'Clinton', 'obama': 'Obama',
            'hillary': 'Hillary', 'donald': 'Donald', 'joe': 'Joe',
            'fbi': 'FBI', 'cia': 'CIA', 'doj': 'DOJ', 'dhs': 'DHS',
            'congress': 'Congress', 'senate': 'Senate', 'house': 'House',
            'republican': 'Republican', 'democrat': 'Democrat', 'democratic': 'Democratic',
            'white house': 'White House', 'washington': 'Washington',
            'new york': 'New York', 'california': 'California', 'texas': 'Texas',
            'florida': 'Florida', 'iowa': 'Iowa', 'ohio': 'Ohio',
            'isis': 'ISIS', 'al-qaeda': 'Al-Qaeda', 'islam': 'Islam', 'muslim': 'Muslim',
            'christian': 'Christian', 'christianity': 'Christianity',
            'russia': 'Russia', 'russian': 'Russian', 'putin': 'Putin',
            'china': 'China', 'chinese': 'Chinese', 'iran': 'Iran', 'iranian': 'Iranian',
            'israel': 'Israel', 'israeli': 'Israeli', 'palestine': 'Palestine', 'palestinian': 'Palestinian',
            'nato': 'NATO', 'un': 'UN', 'eu': 'EU'
        }
                
                for wrong, correct in proper_nouns.items():
                    # Use word boundaries to avoid partial matches
                    pattern = r'\b' + re.escape(wrong) + r'\b'
                    sentence = re.sub(pattern, correct, sentence, flags=re.IGNORECASE)
                
            fixed_sentences.append(sentence)
        
        return ' '.join(fixed_sentences)
    
    def _remove_excessive_repetition(self, text: str) -> str:
        """Remove excessive repetition of words or phrases"""
        # Remove repeated words (more than 2 consecutive)
        text = re.sub(r'\b(\w+)(\s+\1){2,}\b', r'\1', text, flags=re.IGNORECASE)
        
        # Remove repeated short phrases
        text = re.sub(r'\b(\w+\s+\w+)(\s+\1){2,}\b', r'\1', text, flags=re.IGNORECASE)
        
        return text
    
    def _clean_formatting(self, text: str) -> str:
        """Clean up formatting issues"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove orphaned punctuation
        text = re.sub(r'\s+[.!?]+\s+', ' ', text)
        
        # Clean up quotes
        text = re.sub(r'"\s*"', '', text)  # Empty quotes
        text = re.sub(r"'\s*'", '', text)  # Empty single quotes
        
        # Remove URLs and email patterns that might be corrupted
        text = re.sub(r'http\S+|www\.\S+|\S+@\S+\.\S+', '', text)
        
        return text.strip()
    
    def process_batch_file(self, batch_file: Path) -> Dict:
        """
        Process a single batch file
        
        Args:
            batch_file: Path to the batch CSV file
            
        Returns:
            Dictionary with processing results
        """
        logger.info(f"Processing batch file: {batch_file.name}")
        
        try:
            # Read the batch file
            df = pd.read_csv(batch_file)
            original_count = len(df)
            
            # Track articles to keep
            keep_indices = []
            removal_reasons = []
            
            for idx, row in df.iterrows():
                self.stats['total_articles_processed'] += 1
                
                title = str(row.get('title_without_stopwords', ''))
                text = str(row.get('text_without_stopwords', ''))
                
                # Assess quality
                keep_article, issues = self.assess_article_quality(title, text)
                
                if keep_article:
                    # Refine the text
                    refined_title = self.refine_text(title)
                    refined_text = self.refine_text(text)
                    
                    # Update the row with refined text
                    df.at[idx, 'title_without_stopwords'] = refined_title
                    df.at[idx, 'text_without_stopwords'] = refined_text
                    
                    keep_indices.append(idx)
                    self.stats['articles_refined'] += 1
                else:
                    removal_reasons.append(f"Row {idx}: {'; '.join(issues)}")
                    self.stats['articles_removed'] += 1
            
            # Filter dataframe to keep only good articles
            df_refined = df.loc[keep_indices].reset_index(drop=True)
            
            # Save refined batch
            refined_file = self.refined_batches_dir / batch_file.name
            df_refined.to_csv(refined_file, index=False)
            
            final_count = len(df_refined)
            
            logger.info(f"Batch {batch_file.name}: {original_count} -> {final_count} articles "
                       f"({original_count - final_count} removed)")
            
            return {
                'batch_file': batch_file.name,
                'original_count': original_count,
                'final_count': final_count,
                'removed_count': original_count - final_count,
                'removal_reasons': removal_reasons
            }
            
        except Exception as e:
            logger.error(f"Error processing {batch_file.name}: {str(e)}")
            return {
                'batch_file': batch_file.name,
                'error': str(e),
                'original_count': 0,
                'final_count': 0,
                'removed_count': 0
            }
    
    def process_all_batches(self) -> List[Dict]:
        """
        Process all batch files in the directory
        
        Returns:
            List of processing results for each batch
        """
        batch_files = sorted(self.batches_dir.glob("articles_batch_*.csv"))
        results = []
        
        logger.info(f"Found {len(batch_files)} batch files to process")
        
        for batch_file in batch_files:
            result = self.process_batch_file(batch_file)
            results.append(result)
            self.stats['total_batches_processed'] += 1
        
        return results
    
    def generate_refined_summary(self, results: List[Dict]) -> pd.DataFrame:
        """
        Generate summary CSV for refined batches
        
        Args:
            results: List of processing results
            
        Returns:
            DataFrame with batch summary
        """
        summary_data = []
        current_idx = 0
        
        for i, result in enumerate(results, 1):
            if result['final_count'] > 0:  # Only include batches with articles
                summary_data.append({
                    'batch': i,
                    'filename': result['batch_file'],
                    'articles_count': result['final_count'],
                    'start_idx': current_idx,
                    'end_idx': current_idx + result['final_count'] - 1
                })
                current_idx += result['final_count']
        
        return pd.DataFrame(summary_data)
    
    def save_processing_report(self, results: List[Dict], output_dir: Path):
        """
        Save detailed processing report
        
        Args:
            results: List of processing results
            output_dir: Directory to save report
        """
        report_file = output_dir / "refinement_report.txt"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("Article Refinement Processing Report\n")
            f.write("=" * 50 + "\n\n")
            
            # Overall statistics
            f.write("OVERALL STATISTICS:\n")
            f.write(f"Total batches processed: {self.stats['total_batches_processed']}\n")
            f.write(f"Total articles processed: {self.stats['total_articles_processed']}\n")
            f.write(f"Articles refined and kept: {self.stats['articles_refined']}\n")
            f.write(f"Articles removed: {self.stats['articles_removed']}\n")
            f.write(f"Retention rate: {(self.stats['articles_refined']/self.stats['total_articles_processed']*100):.1f}%\n\n")
            
            # Detailed batch results
            f.write("BATCH-BY-BATCH RESULTS:\n")
            f.write("-" * 30 + "\n")
            
            for result in results:
                f.write(f"\nBatch: {result['batch_file']}\n")
                if 'error' in result:
                    f.write(f"  ERROR: {result['error']}\n")
                else:
                    f.write(f"  Original articles: {result['original_count']}\n")
                    f.write(f"  Final articles: {result['final_count']}\n")
                    f.write(f"  Removed: {result['removed_count']}\n")
                    if result['removal_reasons']:
                        f.write(f"  Removal reasons:\n")
                        for reason in result['removal_reasons'][:5]:  # Show first 5 reasons
                            f.write(f"    - {reason}\n")
                        if len(result['removal_reasons']) > 5:
                            f.write(f"    - ... and {len(result['removal_reasons']) - 5} more\n")
        
        logger.info(f"Processing report saved to: {report_file}")

def main():
    """Main execution function"""
    # Define paths
    current_dir = Path(__file__).parent
    project_root = current_dir.parent
    batches_dir = project_root / "app" / "static" / "js" / "simulated-pc" / "levels" / "level-one" / "data" / "batches"
    
    if not batches_dir.exists():
        logger.error(f"Batches directory not found: {batches_dir}")
        return
    
    # Initialize processor
    processor = ArticleRefinementProcessor(str(batches_dir))
    
    logger.info("Starting article refinement process...")
    
    # Process all batches
    results = processor.process_all_batches()
    
    # Generate refined summary
    summary_df = processor.generate_refined_summary(results)
    summary_file = processor.refined_batches_dir / "batch_summary.csv"
    summary_df.to_csv(summary_file, index=False)
    
    # Save processing report
    processor.save_processing_report(results, processor.refined_batches_dir)
    
    # Print final statistics
    print("\n" + "=" * 60)
    print("ARTICLE REFINEMENT COMPLETE!")
    print("=" * 60)
    print(f"Total articles processed: {processor.stats['total_articles_processed']}")
    print(f"Articles refined and kept: {processor.stats['articles_refined']}")
    print(f"Articles removed: {processor.stats['articles_removed']}")
    print(f"Retention rate: {(processor.stats['articles_refined']/processor.stats['total_articles_processed']*100):.1f}%")
    print(f"\nRefined files saved to: {processor.refined_batches_dir}")
    print(f"Updated summary saved to: {summary_file}")
    print("=" * 60)

if __name__ == "__main__":
    main()