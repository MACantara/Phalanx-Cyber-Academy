#!/usr/bin/env python3
"""
Simple Article Refinement Processor

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

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SimpleArticleRefiner:
    def __init__(self, batches_dir: str):
        """
        Initialize the Article Refinement Processor
        
        Args:
            batches_dir: Directory containing batch CSV files
        """
        self.batches_dir = Path(batches_dir)
        self.refined_batches_dir = self.batches_dir / "refined"
        self.refined_batches_dir.mkdir(exist_ok=True)
        
        # Quality thresholds
        self.min_text_length = 100  # Minimum characters in text_without_stopwords
        self.min_title_length = 15  # Minimum characters in title_without_stopwords
        self.max_text_length = 8000  # Maximum characters to prevent extremely long articles
        
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
            
        # Check for excessive concatenation
        if self._has_excessive_concatenation(text):
            issues.append("Text has excessive word concatenation")
            
        # Determine if article should be kept
        critical_issues = [issue for issue in issues if any(critical in issue.lower() 
                          for critical in ['too short', 'nonsensical', 'corrupted', 'concatenation'])]
        
        keep_article = len(critical_issues) == 0
        
        return keep_article, issues
    
    def _is_nonsensical_text(self, text: str) -> bool:
        """
        Check if text appears nonsensical or corrupted
        """
        # Check for extremely long words (likely concatenated)
        words = text.split()
        if len(words) == 0:
            return True
            
        very_long_words = [w for w in words if len(w) > 30]
        if len(very_long_words) > len(words) * 0.15:  # More than 15% very long words
            return True
            
        # Check for lack of spaces (concatenated text)
        if len(text) > 200 and text.count(' ') < len(text) / 20:  # Less than 5% spaces
            return True
            
        # Check for repetitive patterns
        if re.search(r'(.{3,})\1{4,}', text):  # Same pattern repeated 4+ times
            return True
            
        # Check for excessive special characters
        special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s\.\,\!\?\;\:\-\']', text)) / len(text)
        if special_char_ratio > 0.2:
            return True
            
        # Check for very low vowel ratio (might indicate corruption)
        vowels = len(re.findall(r'[aeiouAEIOU]', text))
        if vowels < len(text) * 0.1:  # Less than 10% vowels
            return True
            
        return False
    
    def _has_excessive_concatenation(self, text: str) -> bool:
        """
        Check if text has excessive word concatenation
        """
        # Count words that are likely concatenated (very long without clear structure)
        words = text.split()
        if len(words) < 5:
            return False
            
        suspicious_words = 0
        for word in words:
            if len(word) > 20:
                # Check if word has internal punctuation or capitals that suggest concatenation
                if not re.search(r'[A-Z][a-z]|[a-z][A-Z]|\w\.\w|\w,\w', word):
                    suspicious_words += 1
                    
        return suspicious_words > len(words) * 0.1  # More than 10% suspicious words
    
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
        
        # Try to fix some obvious concatenated words
        # Look for patterns where words are clearly stuck together
        def separate_known_words(match):
            word = match.group(0)
            # Common word patterns to split
            patterns = [
                (r'(the|and|that|with|have|this|will|your|from|they|been|were)([a-z]+)', r'\1 \2'),
                (r'([a-z]+)(the|and|that|with|have|this|will|your|from|they|been|were)', r'\1 \2'),
                (r'([a-z]+)(ing|ed|er|ly|tion|al|ic|est|ness)([a-z]+)', r'\1\2 \3'),
                (r'([a-z]+)(president|government|america|trump|clinton|obama|congress)', r'\1 \2'),
                (r'(president|government|america|trump|clinton|obama|congress)([a-z]+)', r'\1 \2'),
            ]
            
            for pattern, replacement in patterns:
                if re.search(pattern, word, re.IGNORECASE):
                    return re.sub(pattern, replacement, word, flags=re.IGNORECASE)
            
            return word
        
        # Apply to very long words
        text = re.sub(r'\b[a-zA-Z]{25,}\b', separate_known_words, text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        return text
    
    def _fix_punctuation(self, text: str) -> str:
        """Fix punctuation issues"""
        # Remove spaces before punctuation
        text = re.sub(r'\s+([.!?,:;])', r'\1', text)
        
        # Add spaces after punctuation if missing
        text = re.sub(r'([.!?])([a-zA-Z])', r'\1 \2', text)
        text = re.sub(r'([,:;])([a-zA-Z])', r'\1 \2', text)
        
        # Ensure sentences end with proper punctuation
        sentences = re.split(r'(?<=[.!?])\s+', text)
        fixed_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and not re.search(r'[.!?]$', sentence):
                # Add period if sentence doesn't end with punctuation and is substantial
                if len(sentence) > 15 and not sentence.endswith((':', ';', ',')):
                    sentence += '.'
            fixed_sentences.append(sentence)
        
        text = ' '.join(fixed_sentences)
        
        # Fix multiple punctuation marks
        text = re.sub(r'\.{2,}', '.', text)  # Multiple periods to single
        text = re.sub(r'\!{2,}', '!', text)  # Multiple exclamations to single
        text = re.sub(r'\?{2,}', '?', text)  # Multiple questions to single
        
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
                
                # Fix common proper nouns (essential ones for news articles)
                proper_nouns = {
                    r'\bamerica\b': 'America',
                    r'\bamerican\b': 'American', 
                    r'\bamericans\b': 'Americans',
                    r'\bunited states\b': 'United States',
                    r'\busa\b': 'USA',
                    r'\btrump\b': 'Trump',
                    r'\bclinton\b': 'Clinton',
                    r'\bobama\b': 'Obama',
                    r'\bhillary\b': 'Hillary',
                    r'\bdonald\b': 'Donald',
                    r'\bfbi\b': 'FBI',
                    r'\bcia\b': 'CIA',
                    r'\bcongress\b': 'Congress',
                    r'\bsenate\b': 'Senate',
                    r'\brepublican\b': 'Republican',
                    r'\bdemocrat\b': 'Democrat',
                    r'\bdemocratic\b': 'Democratic',
                    r'\bwhite house\b': 'White House',
                    r'\bwashington\b': 'Washington',
                    r'\bisis\b': 'ISIS',
                    r'\bislam\b': 'Islam',
                    r'\bmuslim\b': 'Muslim',
                    r'\bchristian\b': 'Christian',
                    r'\brussia\b': 'Russia',
                    r'\brussian\b': 'Russian',
                    r'\bputin\b': 'Putin',
                    r'\bchina\b': 'China',
                    r'\bchinese\b': 'Chinese',
                    r'\biran\b': 'Iran',
                    r'\biranian\b': 'Iranian',
                    r'\bisrael\b': 'Israel',
                    r'\bisraeli\b': 'Israeli',
                }
                
                for pattern, replacement in proper_nouns.items():
                    sentence = re.sub(pattern, replacement, sentence, flags=re.IGNORECASE)
                
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
        
        # Remove obvious HTML entities
        text = re.sub(r'&[a-zA-Z]+;', ' ', text)
        
        # Remove excessive punctuation sequences
        text = re.sub(r'[.!?]{3,}', '...', text)
        
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
                    
                    # Final check - make sure refined text is still reasonable
                    if len(refined_text.strip()) >= 50 and len(refined_title.strip()) >= 10:
                        # Update the row with refined text
                        df.at[idx, 'title_without_stopwords'] = refined_title
                        df.at[idx, 'text_without_stopwords'] = refined_text
                        
                        keep_indices.append(idx)
                        self.stats['articles_refined'] += 1
                    else:
                        removal_reasons.append(f"Row {idx}: Refined text too short")
                        self.stats['articles_removed'] += 1
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
        batch_num = 1
        
        for result in results:
            if result['final_count'] > 0:  # Only include batches with articles
                summary_data.append({
                    'batch': batch_num,
                    'filename': result['batch_file'],
                    'articles_count': result['final_count'],
                    'start_idx': current_idx,
                    'end_idx': current_idx + result['final_count'] - 1
                })
                current_idx += result['final_count']
                batch_num += 1
        
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
            if self.stats['total_articles_processed'] > 0:
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
                    if result.get('removal_reasons'):
                        f.write(f"  Sample removal reasons:\n")
                        for reason in result['removal_reasons'][:3]:  # Show first 3 reasons
                            f.write(f"    - {reason}\n")
                        if len(result['removal_reasons']) > 3:
                            f.write(f"    - ... and {len(result['removal_reasons']) - 3} more\n")
        
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
    processor = SimpleArticleRefiner(str(batches_dir))
    
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
    if processor.stats['total_articles_processed'] > 0:
        print(f"Retention rate: {(processor.stats['articles_refined']/processor.stats['total_articles_processed']*100):.1f}%")
    print(f"\nRefined files saved to: {processor.refined_batches_dir}")
    print(f"Updated summary saved to: {summary_file}")
    print("=" * 60)

if __name__ == "__main__":
    main()