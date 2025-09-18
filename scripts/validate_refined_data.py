#!/usr/bin/env python3
"""
Data Quality Validation Script

This script validates the quality improvements made to the refined batch files.
"""

import pandas as pd
from pathlib import Path
import re

def validate_refined_data():
    """Validate the quality of refined data"""
    batches_dir = Path("app/static/js/simulated-pc/levels/level-one/data/batches")
    
    print("DATA QUALITY VALIDATION REPORT")
    print("=" * 50)
    
    # Read batch summary
    summary_df = pd.read_csv(batches_dir / "batch_summary.csv")
    total_articles = summary_df['articles_count'].sum()
    
    print(f"Total refined articles: {total_articles}")
    print(f"Total batches: {len(summary_df)}")
    print()
    
    # Validation metrics
    total_processed = 0
    short_titles = 0
    short_texts = 0
    missing_punctuation = 0
    improved_capitalization = 0
    articles_with_proper_nouns = 0
    
    # Sample some batches for detailed validation
    sample_batches = ["articles_batch_01.csv", "articles_batch_06.csv", "articles_batch_12.csv", "articles_batch_18.csv"]
    
    for batch_file in sample_batches:
        if (batches_dir / batch_file).exists():
            print(f"Validating {batch_file}...")
            df = pd.read_csv(batches_dir / batch_file)
            
            for _, row in df.iterrows():
                total_processed += 1
                title = str(row['title_without_stopwords'])
                text = str(row['text_without_stopwords'])
                
                # Check title length
                if len(title) < 15:
                    short_titles += 1
                
                # Check text length  
                if len(text) < 100:
                    short_texts += 1
                
                # Check for proper sentence endings
                if not re.search(r'[.!?]$', text.strip()):
                    missing_punctuation += 1
                
                # Check for proper capitalization
                if title.startswith(title[0].upper()) and any(word[0].isupper() for word in title.split()[1:]):
                    improved_capitalization += 1
                
                # Check for proper nouns
                proper_nouns = ['America', 'American', 'Trump', 'Clinton', 'Obama', 'FBI', 'Congress', 'Republican', 'Democrat']
                if any(noun in text for noun in proper_nouns):
                    articles_with_proper_nouns += 1
    
    print()
    print("QUALITY METRICS:")
    print(f"Articles validated: {total_processed}")
    print(f"Short titles (< 15 chars): {short_titles} ({short_titles/total_processed*100:.1f}%)")
    print(f"Short texts (< 100 chars): {short_texts} ({short_texts/total_processed*100:.1f}%)")
    print(f"Missing end punctuation: {missing_punctuation} ({missing_punctuation/total_processed*100:.1f}%)")
    print(f"Improved capitalization: {improved_capitalization} ({improved_capitalization/total_processed*100:.1f}%)")
    print(f"Articles with proper nouns: {articles_with_proper_nouns} ({articles_with_proper_nouns/total_processed*100:.1f}%)")
    
    # Check label distribution
    print()
    print("LABEL DISTRIBUTION:")
    all_labels = []
    for batch_file in ["articles_batch_01.csv", "articles_batch_06.csv", "articles_batch_12.csv"]:
        if (batches_dir / batch_file).exists():
            df = pd.read_csv(batches_dir / batch_file)
            all_labels.extend(df['label'].tolist())
    
    real_count = all_labels.count('Real')
    fake_count = all_labels.count('Fake')
    total_labels = len(all_labels)
    
    print(f"Real articles: {real_count} ({real_count/total_labels*100:.1f}%)")
    print(f"Fake articles: {fake_count} ({fake_count/total_labels*100:.1f}%)")
    
    # Sample article examples
    print()
    print("SAMPLE REFINED ARTICLES:")
    print("-" * 30)
    
    sample_df = pd.read_csv(batches_dir / "articles_batch_01.csv")
    for i, (_, row) in enumerate(sample_df.head(2).iterrows()):
        print(f"\nArticle {i+1} ({row['label']}):")
        print(f"Title: {row['title_without_stopwords'][:100]}...")
        print(f"Text: {row['text_without_stopwords'][:200]}...")
        print(f"Length: {len(row['text_without_stopwords'])} chars")
    
    print()
    print("VALIDATION COMPLETE!")
    print("=" * 50)

if __name__ == "__main__":
    validate_refined_data()