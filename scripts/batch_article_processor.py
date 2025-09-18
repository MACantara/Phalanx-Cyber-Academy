#!/usr/bin/env python3
"""
Batch Article Processor

This script processes the news_articles_cleaned.csv file by:
1. Removing specified columns (title, text, language, main_img_url, type)
2. Cleaning [ORG] text from author field
3. Splitting data into batches of 50 articles per batch

Usage:
    python batch_article_processor.py
"""

import pandas as pd
import os
import re
from pathlib import Path

def clean_org_text(text):
    """Remove [ORG] prefix from text"""
    if pd.isna(text):
        return text
    return re.sub(r'^\[ORG\]\s*', '', str(text))

def process_articles(input_file, output_dir, batch_size=50):
    """
    Process the cleaned articles CSV file
    
    Args:
        input_file (str): Path to the input CSV file
        output_dir (str): Directory to save batch files
        batch_size (int): Number of articles per batch
    """
    print(f"Reading data from: {input_file}")
    
    # Read the CSV file
    try:
        df = pd.read_csv(input_file)
        print(f"Loaded {len(df)} articles")
    except FileNotFoundError:
        print(f"Error: File {input_file} not found")
        return
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    # Display original columns
    print(f"Original columns: {list(df.columns)}")
    
    # Step 1: Remove specified columns
    columns_to_remove = ['title', 'text', 'language', 'main_img_url', 'type']
    existing_columns_to_remove = [col for col in columns_to_remove if col in df.columns]
    
    if existing_columns_to_remove:
        print(f"Removing columns: {existing_columns_to_remove}")
        df = df.drop(columns=existing_columns_to_remove)
    else:
        print("No specified columns found to remove")
    
    print(f"Remaining columns: {list(df.columns)}")
    
    # Step 2: Clean [ORG] text from author field
    if 'author' in df.columns:
        print("Cleaning [ORG] text from author field...")
        df['author'] = df['author'].apply(clean_org_text)
    else:
        print("Warning: 'author' column not found")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 3: Split into batches and save
    total_articles = len(df)
    num_batches = (total_articles + batch_size - 1) // batch_size  # Ceiling division
    
    print(f"\nSplitting {total_articles} articles into {num_batches} batches of {batch_size} articles each")
    
    batch_info = []
    
    for i in range(num_batches):
        start_idx = i * batch_size
        end_idx = min((i + 1) * batch_size, total_articles)
        
        batch_df = df.iloc[start_idx:end_idx].copy()
        batch_filename = f"articles_batch_{i+1:02d}.csv"
        batch_filepath = os.path.join(output_dir, batch_filename)
        
        # Save batch to CSV
        batch_df.to_csv(batch_filepath, index=False)
        
        batch_info.append({
            'batch': i + 1,
            'filename': batch_filename,
            'articles_count': len(batch_df),
            'start_idx': start_idx,
            'end_idx': end_idx - 1
        })
        
        print(f"  Batch {i+1:2d}: {len(batch_df):2d} articles -> {batch_filename}")
    
    # Create a summary file
    summary_df = pd.DataFrame(batch_info)
    summary_filepath = os.path.join(output_dir, "batch_summary.csv")
    summary_df.to_csv(summary_filepath, index=False)
    
    print(f"\nProcessing complete!")
    print(f"Batch files saved to: {output_dir}")
    print(f"Summary file: {summary_filepath}")
    
    # Display sample of processed data
    print(f"\nSample of processed data (first 3 rows):")
    print(df.head(3).to_string(index=False))

def main():
    """Main function"""
    # Define paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    input_file = project_root / "app" / "static" / "js" / "simulated-pc" / "levels" / "level-one" / "data" / "processed" / "news_articles_cleaned.csv"
    output_dir = project_root / "app" / "static" / "js" / "simulated-pc" / "levels" / "level-one" / "data" / "batches"
    
    print("Batch Article Processor")
    print("=" * 50)
    print(f"Input file: {input_file}")
    print(f"Output directory: {output_dir}")
    print()
    
    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file does not exist: {input_file}")
        return
    
    # Process the articles
    process_articles(str(input_file), str(output_dir))

if __name__ == "__main__":
    main()