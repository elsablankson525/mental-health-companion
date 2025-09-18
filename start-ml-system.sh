#!/bin/bash

echo "🧠 Starting Mental Health Companion ML System"
echo "================================================"

echo ""
echo "📦 Starting ML Backend..."
cd ml_backend
python start.py &
ML_PID=$!

echo ""
echo "⏳ Waiting for ML backend to start..."
sleep 5

echo ""
echo "🚀 Starting Frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System started!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🤖 ML Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both services..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $ML_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "👋 Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
