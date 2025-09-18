#!/bin/bash
# ML Backend Deployment Script

echo "🚀 Deploying ML Backend..."

# Check if we're in the right directory
if [ ! -f "ml_backend/app.py" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd ml_backend
pip install -r requirements.txt

# Test the application
echo "🧪 Testing ML backend..."
python -c "import app; print('✅ ML backend imports successfully')"

# Start the application
echo "🚀 Starting ML backend..."
echo "Available at: http://localhost:5000"
echo "Health check: http://localhost:5000/api/health"
echo "Press Ctrl+C to stop"

python app.py
