#!/bin/bash
echo "🧠 Mental Health Companion - Enhanced ML Backend Deployment"
echo "============================================================"

echo "📦 Installing enhanced requirements..."
pip install -r requirements_enhanced.txt

echo "🔧 Setting up environment..."
mkdir -p models
mkdir -p logs

echo "🚀 Starting Enhanced ML Backend..."
python start_enhanced.py
