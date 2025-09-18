#!/bin/bash

echo "🚀 Starting Mental Health Companion ML Backend..."

# Download NLTK data
echo "📦 Downloading NLTK data..."
python -c "import nltk; nltk.download('vader_lexicon')"

# Create models directory if it doesn't exist
mkdir -p models

# Start the application
echo "🚀 Starting Gunicorn server..."
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile -
