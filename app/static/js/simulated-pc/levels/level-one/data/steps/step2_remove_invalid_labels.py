#!/usr/bin/env python3
"""
Step 2: Preprocess news_articles_step1_cleaned.csv - Remove rows with invalid labels

This script removes rows from the news articles dataset that have problematic label fields:
1. Empty/null label values (None, NaN, empty strings, whitespace)
2. Numeric values (1, 0, etc.)
3. Common invalid text values (nan, none, null, unknown, bias, mixed, other)
4. Labels that are not exactly "Fake" or "Real" (case-insensitive)

Only rows with labels that are exactly "Fake" or "Real" (case-insensitive) will be kept.

Usage:
    python step2_remove_invalid_labels.py
"""

import pandas as pd
import os
from pathlib import Path

def is_valid_label(label):
    """
    Check if the label is valid (either "Fake" or "Real").
    
    Args:
        label: Label field value
        
    Returns:
        bool: True if the label is valid
    """
    # Check for null/None values
    if pd.isna(label) or label is None:
        return False
    
    # Convert to string for consistent processing
    label_str = str(label).strip()
    
    # Check for empty strings (including whitespace-only)
    if not label_str:
        return False
    
    # Check for numeric values (like "1", "0", etc.)
    if label_str.isdigit():
        return False
    
    # Check for common invalid values
    invalid_values = [
        '',           # Empty string
        ' ',          # Whitespace
        '1',          # Number 1
        '0',          # Number 0
        'nan',        # String representation of NaN
        'none',       # String representation of None
        'null',       # Null value
        'unknown',    # Unknown label
        'bias',       # Bias label
        'mixed',      # Mixed label
        'other',      # Other label
    ]
    
    # Clean and normalize the label
    label_clean = label_str.lower().strip()
    
    # Check if it's in the invalid values list
    if label_clean in invalid_values:
        return False
    
    # Valid labels are ONLY "fake" or "real" (case-insensitive)
    valid_labels = ['fake', 'real']
    
    # Return True only if the label exactly matches one of the valid labels
    return label_clean in valid_labels

def preprocess_labels():
    """
    Main function to preprocess the news articles CSV file by removing invalid labels.
    """
    # Get the directory of this script
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'processed'
    
    input_file = data_dir / 'news_articles_step1_cleaned.csv'
    output_file = data_dir / 'news_articles_step2_cleaned.csv'
    
    print(f"Processing: {input_file}")
    print(f"Output will be saved to: {output_file}")
    
    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file {input_file} not found!")
        print("Please run step1_remove_invalid_authors.py first.")
        return
    
    try:
        # Read the CSV file
        print("Reading CSV file...")
        df = pd.read_csv(input_file)
        
        print(f"Original dataset shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Check if 'label' column exists
        if 'label' not in df.columns:
            print("Error: 'label' column not found in the dataset!")
            print("Available columns:", list(df.columns))
            return
        
        # Show label distribution before filtering
        print(f"\n=== Label distribution in original dataset ===")
        label_counts = df['label'].value_counts(dropna=False)
        print(label_counts)
        
        # Show examples of problematic labels
        print(f"\n=== Examples of labels that will be removed ===")
        invalid_labels = []
        for idx, label in df['label'].items():
            if not is_valid_label(label):
                if label not in invalid_labels:
                    invalid_labels.append(label)
                    if len(invalid_labels) <= 10:  # Show max 10 examples
                        print(f"  - '{label}' (type: {type(label).__name__})")
        
        if not invalid_labels:
            print("  No invalid labels found.")
        else:
            print(f"  Found {len(invalid_labels)} unique invalid label types")
        
        # Create mask for rows to keep (valid labels only)
        print(f"\nFiltering rows...")
        keep_mask = df['label'].apply(is_valid_label)
        
        # Apply filter
        df_cleaned = df[keep_mask].copy()
        
        print(f"\nFiltering results:")
        print(f"  Original rows: {len(df)}")
        print(f"  Rows removed: {len(df) - len(df_cleaned)}")
        print(f"  Rows remaining: {len(df_cleaned)}")
        print(f"  Removal rate: {((len(df) - len(df_cleaned)) / len(df) * 100):.2f}%")
        
        # Show label distribution after filtering
        if len(df_cleaned) > 0:
            print(f"\n=== Label distribution in cleaned dataset ===")
            cleaned_label_counts = df_cleaned['label'].value_counts()
            print(cleaned_label_counts)
            
            # Calculate balance
            if len(cleaned_label_counts) == 2:
                fake_count = cleaned_label_counts.get('Fake', 0)
                real_count = cleaned_label_counts.get('Real', 0)
                total = fake_count + real_count
                
                if total > 0:
                    fake_pct = (fake_count / total) * 100
                    real_pct = (real_count / total) * 100
                    
                    print(f"\nDataset balance:")
                    print(f"  Fake: {fake_count} articles ({fake_pct:.1f}%)")
                    print(f"  Real: {real_count} articles ({real_pct:.1f}%)")
                    
                    # Check if dataset is reasonably balanced
                    if abs(fake_pct - real_pct) > 20:
                        print(f"  ⚠️  Warning: Dataset is imbalanced (difference: {abs(fake_pct - real_pct):.1f}%)")
                    else:
                        print(f"  ✅ Dataset is reasonably balanced")
        
        # Save the cleaned dataset
        print(f"\nSaving cleaned dataset to: {output_file}")
        df_cleaned.to_csv(output_file, index=False)
        
        # Additional statistics
        if len(df_cleaned) > 0:
            print(f"\n=== Additional statistics ===")
            print(f"Unique authors: {df_cleaned['author'].nunique()}")
            
            # Check for other important columns
            text_columns = ['title', 'text', 'title_without_stopwords', 'text_without_stopwords']
            for col in text_columns:
                if col in df_cleaned.columns:
                    non_null = df_cleaned[col].notna().sum()
                    print(f"{col}: {non_null}/{len(df_cleaned)} non-null ({(non_null/len(df_cleaned)*100):.1f}%)")
        
        print(f"\nStep 2 preprocessing completed successfully!")
        print(f"Cleaned dataset saved as: {output_file.name}")
        
        # Suggest next steps
        print(f"\n=== Next Steps ===")
        print(f"✅ Step 1: Remove invalid authors - completed")
        print(f"✅ Step 2: Remove invalid labels - completed")
        print(f"📝 Step 3: Consider text quality filtering (empty text, too short articles)")
        print(f"📝 Step 4: Consider language filtering (if needed)")
        print(f"📝 Step 5: Consider deduplication (duplicate articles)")
        
    except Exception as e:
        print(f"Error processing file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    preprocess_labels()
