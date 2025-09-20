# Email Dataset Quality Assessment Script

This repository contains a unified Python script to assess the data quality of phishing email datasets, specifically designed for the CEAS_08.csv dataset with 7 columns.

## Files Overview

### 1. `email_data_quality_assessment.py` - Unified Analysis Tool
**Features**: 
- **Automatic processing method selection** based on file size
- **Memory-efficient chunked processing** for large files (>100MB)
- **Comprehensive in-memory analysis** for smaller files (<100MB)
- Complete statistical analysis and reporting
- Email format validation
- URL analysis and suspicious pattern detection
- Text content analysis
- Label distribution analysis (phishing vs legitimate)

### 2. `run_assessment_example.py` - Usage Examples
**Purpose**: Demonstrates how to use the assessment script

## Dataset Structure

The script expects a CSV file with exactly 7 columns:
- `sender` - Email sender address
- `receiver` - Email receiver address  
- `date` - Email date
- `subject` - Email subject line
- `body` - Email body content
- `label` - Classification label (1 for phishing, 0 for legitimate)
- `urls` - URLs found in the email

## Quick Start

### Basic Usage (Automatic method selection):
```python
python email_data_quality_assessment.py
```

The script automatically:
- Detects file size (58.4 MB for CEAS_08.csv)
- Chooses appropriate processing method
- Runs comprehensive analysis for files <100MB
- Uses chunked processing for files >100MB

### Advanced Usage:
```python
# For large files - chunked processing with custom parameters
assessment = EmailDataQualityAssessment("CEAS_08.csv")
assessment.run_assessment(chunk_size=5000, max_chunks=20)

# For smaller files - comprehensive analysis with sample
assessment = EmailDataQualityAssessment("CEAS_08.csv") 
assessment.run_assessment(nrows=50000)  # Analyze first 50K records
```

### Example Usage:
```python
python run_assessment_example.py
```

## What the Script Analyzes

### Data Quality Metrics:
1. **Missing Values**: Identifies columns with missing data and calculates percentages
2. **Duplicates**: Detects duplicate records and duplicate subjects
3. **Label Distribution**: Analyzes phishing vs legitimate email balance
4. **Email Validation**: Validates email address formats in sender/receiver fields
5. **URL Analysis**: Examines URL patterns and suspicious domains
6. **Text Analysis**: Analyzes subject and body text statistics
7. **Data Types**: Checks column data types and consistency

### Key Quality Issues Detected:
- ⚠️ High missing value percentages (>50%)
- ⚠️ Class imbalance in phishing vs legitimate emails
- ⚠️ Invalid email address formats
- ⚠️ Suspicious URL patterns
- ⚠️ Data consistency problems

## Output

Both scripts generate:
- **Console output**: Real-time analysis results with colored indicators
- **Summary report**: Key findings and quality issues
- **Detailed report file**: Complete analysis saved to text file

### Example Output:
```
🔍 EMAIL DATASET QUALITY ASSESSMENT TOOL
==================================================
📊 Dataset contains 10,000 email records
✅ All expected columns are present
⚠️ sender field has 7.3% valid email formats
⚠️ receiver field has 79.2% valid email formats
✅ Reasonably balanced dataset. Minority class: 47.8%
```

## Installation Requirements

```bash
pip install pandas numpy matplotlib seaborn validators
```

## Memory Recommendations

- **Small files (<100MB)**: Use `data_quality_assessment.py` for detailed analysis
- **Large files (>100MB)**: Use `quick_data_quality_check.py` for memory efficiency
- **Very large files (>1GB)**: Use `quick_data_quality_check.py` with chunk_size=5000

## Customization

### Adjusting chunk size for large files:
```python
# In quick_data_quality_check.py
quick_data_quality_check("CEAS_08.csv", chunk_size=5000, max_chunks=0)
```

### Analyzing specific number of records:
```python
# In data_quality_assessment.py
assessment.load_data(nrows=50000)  # Analyze first 50K records
```

### Processing only a few chunks for testing:
```python
# Process only first 10 chunks
quick_data_quality_check("CEAS_08.csv", chunk_size=10000, max_chunks=10)
```

## Troubleshooting

### Common Issues:

1. **Memory Error**: Use `quick_data_quality_check.py` instead
2. **Encoding Issues**: Files are processed with UTF-8 encoding and error handling
3. **Large File Size**: Adjust chunk_size parameter to smaller values
4. **Missing Columns**: Scripts will report missing expected columns

### Error Handling:
- Scripts include robust error handling for malformed data
- Bad lines are skipped automatically
- Missing values are handled gracefully
- Encoding issues are managed with fallback options

## Use Cases

### Research & Analysis:
- Academic research on phishing detection
- Security analysis of email datasets
- Data preparation for machine learning models

### Data Engineering:
- ETL pipeline quality checks
- Data validation before model training
- Dataset health monitoring

### Security Applications:
- Email security system evaluation
- Phishing detection model development
- Cybersecurity dataset analysis

---

**Note**: These scripts are optimized for the CEAS_08.csv dataset format but can be adapted for other email datasets with similar structures.