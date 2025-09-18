#!/usr/bin/env python3
"""
Step 1: Preprocess news_articles.csv - Remove rows with invalid authors

This script removes rows from the news articles dataset that have problematic author fields:
1. No Author
2. Anonymous
3. Question marks pattern (?????? ???? ???? ???????)
4. Names with weird/non-standard characters (like GearÃ³id Ã" ColmÃ¡in)
5. -NO AUTHOR-

Usage:
    python step1_remove_invalid_authors.py
"""

import pandas as pd
import re
import os
from pathlib import Path

def has_weird_characters(text):
    """
    Check if text contains weird/non-standard characters that indicate encoding issues.
    
    Args:
        text (str): Text to check
        
    Returns:
        bool: True if text contains weird characters
    """
    if not isinstance(text, str):
        return False
    
    # Check for common encoding issue patterns
    weird_patterns = [
        r'Ã[a-zA-Z]',  # Like Ã³, Ã", etc.
        r'[^\x00-\x7F]+',  # Non-ASCII characters (be careful with this for legitimate international names)
        r'Â[a-zA-Z]',  # Another encoding issue pattern
        r'â[a-zA-Z]',  # Yet another encoding pattern
    ]
    
    for pattern in weird_patterns:
        if re.search(pattern, text):
            return True
    
    return False

def is_question_mark_pattern(text):
    """
    Check if text is mostly question marks (indicating missing/corrupted data).
    
    Args:
        text (str): Text to check
        
    Returns:
        bool: True if text is mostly question marks
    """
    if not isinstance(text, str):
        return False
    
    # Count question marks vs total characters
    question_count = text.count('?')
    total_chars = len(text.strip())
    
    # If more than 50% are question marks, consider it invalid
    if total_chars > 0 and (question_count / total_chars) > 0.5:
        return True
    
    # Also check for specific patterns like "?????? ???? ???? ???????"
    if re.match(r'^[\?\s]+$', text.strip()):
        return True
    
    return False

def should_remove_author(author):
    """
    Determine if a row should be removed based on the author field.
    
    Args:
        author (str): Author field value
        
    Returns:
        bool: True if the row should be removed
    """
    if pd.isna(author) or author is None:
        return True
    
    if not isinstance(author, str):
        return True
    
    author_clean = author.strip().lower()
    
    # Check for explicit invalid author indicators
    invalid_indicators = [
        'no author',
        'anonymous',
        '-no author-',
        'unknown',
        'n/a',
        'na',
        '',
    ]
    
    if author_clean in invalid_indicators:
        return True
    
    # Check for question mark patterns
    if is_question_mark_pattern(author):
        return True
    
    # Check for weird characters (encoding issues)
    if has_weird_characters(author):
        return True
    
    return False

def preprocess_news_articles():
    """
    Main function to preprocess the news articles CSV file.
    """
    # Get the directory of this script
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent
    
    input_file = data_dir / 'news_articles.csv'
    output_file = data_dir / 'processed' / 'news_articles_step1_cleaned.csv'
    
    print(f"Processing: {input_file}")
    print(f"Output will be saved to: {output_file}")
    
    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file {input_file} not found!")
        return
    
    try:
        # Read the CSV file
        print("Reading CSV file...")
        df = pd.read_csv(input_file)
        
        print(f"Original dataset shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Check if 'author' column exists
        if 'author' not in df.columns:
            print("Error: 'author' column not found in the dataset!")
            return
        
        # Show some examples of problematic authors before filtering
        print("\n=== Examples of authors that will be removed ===")
        problematic_authors = []
        for idx, author in df['author'].head(50).items():  # Check first 50 for examples
            if should_remove_author(author):
                problematic_authors.append(author)
                if len(problematic_authors) <= 10:  # Show max 10 examples
                    print(f"  - '{author}'")
        
        if not problematic_authors:
            print("  No problematic authors found in first 50 rows.")
        
        # Create mask for rows to keep
        print("\nFiltering rows...")
        keep_mask = ~df['author'].apply(should_remove_author)
        
        # Apply filter
        df_cleaned = df[keep_mask].copy()
        
        print(f"\nFiltering results:")
        print(f"  Original rows: {len(df)}")
        print(f"  Rows removed: {len(df) - len(df_cleaned)}")
        print(f"  Rows remaining: {len(df_cleaned)}")
        print(f"  Removal rate: {((len(df) - len(df_cleaned)) / len(df) * 100):.2f}%")
        
        # Save the cleaned dataset
        print(f"\nSaving cleaned dataset to: {output_file}")
        df_cleaned.to_csv(output_file, index=False)
        
        # Show some statistics about remaining authors
        print(f"\n=== Statistics for cleaned dataset ===")
        print(f"Unique authors remaining: {df_cleaned['author'].nunique()}")
        
        # Show top 10 most common authors
        if len(df_cleaned) > 0:
            print("\nTop 10 most common authors:")
            author_counts = df_cleaned['author'].value_counts().head(10)
            for author, count in author_counts.items():
                print(f"  {author}: {count} articles")
        
        print(f"\nStep 1 preprocessing completed successfully!")
        print(f"Cleaned dataset saved as: {output_file.name}")
        
    except Exception as e:
        print(f"Error processing file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    preprocess_news_articles()