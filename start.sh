#!/bin/bash

# Render.com startup script for Phalanx Cyber Academy Flask app

echo "Starting Phalanx Cyber Academy application..."

# Set Render environment variable
export RENDER=1

# Ensure directories exist
mkdir -p instance

# Start the application with Gunicorn
exec gunicorn -w 4 -b 0.0.0.0:$PORT --timeout 120 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100 run:app
