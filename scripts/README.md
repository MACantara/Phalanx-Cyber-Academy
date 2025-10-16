# Data Preprocessing Scripts

This directory contains scripts for preprocessing the news articles dataset used in Phalanx Cyber Academy Level 1.

## Scripts

### clean_pycache.py

Recursively finds and removes all `__pycache__` directories from the project to clean up compiled Python bytecode files.

**Usage:**
```bash
# Run from project root
python scripts/clean_pycache.py

# Or run directly from scripts directory
python clean_pycache.py
```

**What it does:**
- Recursively scans the entire project for `__pycache__` directories
- Shows a list of all directories that will be deleted
- Asks for confirmation before proceeding
- Safely removes all `__pycache__` directories and their contents
- Provides detailed progress and summary statistics

**Features:**
- **Safe deletion** with confirmation prompt
- **Cross-platform compatibility** (Windows, macOS, Linux)
- **Error handling** for permission issues or locked files
- **Progress feedback** showing what was deleted
- **Verification** to ensure complete cleanup
- **Statistics** on directories and files removed

**Output:**
- Lists all `__pycache__` directories found
- Shows confirmation prompt
- Displays deletion progress
- Provides cleanup summary with counts

### preprocess_english_articles.py

Filters the news articles dataset to only include English language articles with valid data and accessible images.

**Usage:**
```bash
# Run preprocessing (includes analysis + filtering)
python scripts/preprocess_english_articles.py

# Only analyze language distribution
python scripts/preprocess_english_articles.py --analyze
```

**What it does:**
- Reads the original `news_articles.csv` file
- Filters articles where `language == 'english'`
- Validates required fields (title, text, author, label)
- **Batch verifies image accessibility** for improved performance
- Saves filtered dataset to `data/processed/english_news_articles.csv`
- Provides statistics on the filtering process

**Features:**
- **Concurrent image checking** using ThreadPoolExecutor
- **Batch processing** to reduce server load
- **Rate limiting** between batches to be respectful to servers
- **Progress tracking** with detailed statistics
- **Error handling** for network timeouts and failures

**Output:**
- Creates `data/processed/english_news_articles.csv` with only English articles with accessible images
- Shows statistics including:
  - Total articles processed
  - Number of English articles found
  - Real vs fake news distribution
  - Image accessibility verification results
  - Performance metrics for batch processing

### batch_analyze_dataset.py

Generates AI-powered taggable elements analysis for the filtered English articles dataset using Gemini 2.5 Flash.

**Usage:**
```bash
# Set Gemini API key
export GEMINI_API_KEY='your-api-key-here'

# Run batch analysis
python scripts/batch_analyze_dataset.py
```

**What it does:**
- Reads `data/processed/english_news_articles.csv`
- Uses Gemini 2.5 Flash to analyze each article
- Identifies clickable elements for cybersecurity training
- Generates educational insights and red flags
- **Processes articles in batches** with rate limiting
- Saves analysis to `data/processed/english_news_articles_analysis.json`

**Features:**
- **Batch processing** (5 articles per batch) with rate limiting
- **Fallback analysis** when AI fails
- **Educational focus** on cybersecurity awareness
- **Structured JSON output** with clickable elements
- **Error handling** and progress tracking

**Output:**
- Creates `data/processed/english_news_articles.csv` with only English articles with accessible images
- Creates `data/processed/english_news_articles_analysis.json` with AI-generated taggable elements
- Shows statistics including:
  - Total articles processed
  - Number of English articles found
  - Real vs fake news distribution
  - Image accessibility verification results
  - AI analysis completion status

## Requirements

- Python 3.6+
- Standard library modules (csv, os, sys, pathlib, threading, concurrent.futures)
- `requests` library (for image accessibility verification)
- `google-genai` library (for AI analysis)
- Gemini API key (for AI analysis)

## Performance

The batch processing approach significantly improves performance:
- **Concurrent image checking** of up to 10-20 URLs simultaneously
- **AI batch processing** with 5 articles per batch
- **Rate limiting** with 2-3 second pauses between batches
- **Progress reporting** for long-running operations
- **Fallback mechanisms** for failed operations

## API Integration

The AI analysis functionality is also available via Flask API endpoints:
- `POST /api/ai-analysis/batch-analyze-dataset` - Trigger batch analysis
- `GET /api/ai-analysis/dataset-analysis-status` - Check analysis status

## Directory Structure

```
Phalanx Cyber Academy/
├── scripts/
│   ├── preprocess_english_articles.py
│   ├── batch_analyze_dataset.py
│   └── README.md
├── data/
│   └── processed/
│       ├── english_news_articles.csv (filtered articles)
│       └── english_news_articles_analysis.json (AI analysis)
└── app/
    └── static/js/simulated-pc/levels/level-one/data/
        └── news_articles.csv (original)
```
