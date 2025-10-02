#!/bin/bash
# Quick start script for running Playwright tests

set -e  # Exit on error

echo "CyberQuest Playwright Test Suite - Quick Start"
echo "=============================================="
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version || { echo "Python 3 not found!"; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Install Playwright browsers
echo "Installing Playwright browsers..."
playwright install chromium

# Setup test environment
if [ ! -f ".env" ]; then
    echo "Setting up test environment..."
    cp .env.template .env
    echo "FLASK_ENV=testing" >> .env
    echo "HCAPTCHA_ENABLED=False" >> .env
fi

# Create screenshots directory
mkdir -p tests/screenshots

echo ""
echo "Setup complete!"
echo ""
echo "To run tests:"
echo "  1. Start Flask server: python run.py"
echo "  2. In another terminal: source venv/bin/activate && pytest"
echo ""
echo "Or run tests with server in background:"
echo "  python run.py & sleep 5 && pytest && fg"
echo ""
echo "Run specific test categories:"
echo "  pytest -m auth           # Authentication tests"
echo "  pytest -m accessibility  # Accessibility tests"
echo "  pytest -m theme          # Theme tests"
echo ""
