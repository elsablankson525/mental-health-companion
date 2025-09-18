#!/usr/bin/env python3
"""
Production-ready ML Backend for Mental Health Companion
Simplified version for cloud deployment
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
import json
import pandas as pd
import numpy as np
from textblob import TextBlob
import joblib
import sqlite3
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global variables for models
mood_predictor = None
scaler = None
vectorizer = None

def load_models():
    """Load pre-trained models"""
    global mood_predictor, scaler, vectorizer
    
    try:
        models_dir = Path("models")
        
        # Load models if they exist
        if (models_dir / "mood_predictor.joblib").exists():
            mood_predictor = joblib.load(models_dir / "mood_predictor.joblib")
            logger.info("Mood predictor model loaded")
        
        if (models_dir / "scaler.joblib").exists():
            scaler = joblib.load(models_dir / "scaler.joblib")
            logger.info("Scaler model loaded")
            
        if (models_dir / "vectorizer.joblib").exists():
            vectorizer = joblib.load(models_dir / "vectorizer.joblib")
            logger.info("Vectorizer model loaded")
            
        return True
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

# Load models on startup
load_models()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'models_loaded': {
                'mood_predictor': mood_predictor is not None,
                'scaler': scaler is not None,
                'vectorizer': vectorizer is not None
            }
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Sentiment analysis endpoint
@app.route('/api/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Use TextBlob for sentiment analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        if polarity >= 0.1:
            sentiment = "positive"
            confidence = polarity
        elif polarity <= -0.1:
            sentiment = "negative"
            confidence = abs(polarity)
        else:
            sentiment = "neutral"
            confidence = 1 - abs(polarity)
        
        return jsonify({
            'sentiment': sentiment,
            'confidence': confidence,
            'polarity': polarity,
            'subjectivity': subjectivity,
            'method': 'textblob'
        })
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Mood prediction endpoint
@app.route('/api/predict-mood', methods=['POST'])
def predict_mood():
    """Predict mood based on emotions and note"""
    try:
        data = request.get_json()
        emotions = data.get('emotions', [])
        note = data.get('note', '')
        user_id = data.get('user_id')
        
        if not emotions and not note:
            return jsonify({'error': 'Emotions or note is required'}), 400
        
        # Basic mood prediction logic
        mood_score = 5  # Default neutral mood
        
        # Emotion-based scoring
        emotion_scores = {
            'happy': 2, 'joy': 2, 'excited': 2, 'content': 1, 'peaceful': 1,
            'sad': -2, 'angry': -2, 'frustrated': -1, 'anxious': -1, 'worried': -1,
            'calm': 1, 'grateful': 1, 'hopeful': 1, 'confident': 1,
            'tired': -1, 'stressed': -1, 'overwhelmed': -2, 'lonely': -2
        }
        
        for emotion in emotions:
            if emotion.lower() in emotion_scores:
                mood_score += emotion_scores[emotion.lower()]
        
        # Text sentiment influence
        if note:
            blob = TextBlob(note)
            sentiment_polarity = blob.sentiment.polarity
            mood_score += sentiment_polarity * 2
        
        # Normalize mood score to 1-10 range
        mood_score = max(1, min(10, int(mood_score)))
        
        # Generate recommendations based on mood
        recommendations = []
        if mood_score <= 3:
            recommendations = [
                "Consider reaching out to a trusted friend or family member",
                "Try some deep breathing exercises",
                "Listen to calming music or nature sounds",
                "Consider professional support if these feelings persist"
            ]
        elif mood_score <= 6:
            recommendations = [
                "Take a short walk outside",
                "Practice mindfulness or meditation",
                "Engage in a hobby you enjoy",
                "Write down your thoughts in a journal"
            ]
        else:
            recommendations = [
                "Share your positive energy with others",
                "Continue the activities that are making you feel good",
                "Set some new goals to maintain this momentum",
                "Consider helping someone else who might be struggling"
            ]
        
        return jsonify({
            'predicted_mood': mood_score,
            'confidence': 0.7,  # Basic confidence score
            'recommendations': recommendations,
            'emotions_analyzed': emotions,
            'note_analyzed': bool(note)
        })
        
    except Exception as e:
        logger.error(f"Mood prediction error: {e}")
        return jsonify({'error': str(e)}), 500

# Recommendations endpoint
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get mental health recommendations"""
    try:
        data = request.get_json()
        mood = data.get('mood', 5)
        emotions = data.get('emotions', [])
        user_id = data.get('user_id')
        
        # Generate recommendations based on mood
        recommendations = []
        
        if mood <= 3:
            recommendations = [
                {
                    "type": "immediate_support",
                    "title": "Immediate Support",
                    "description": "Consider reaching out to a crisis helpline or trusted person",
                    "priority": "high"
                },
                {
                    "type": "breathing_exercise",
                    "title": "Breathing Exercise",
                    "description": "Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8",
                    "priority": "high"
                },
                {
                    "type": "professional_help",
                    "title": "Professional Support",
                    "description": "Consider scheduling an appointment with a mental health professional",
                    "priority": "medium"
                }
            ]
        elif mood <= 6:
            recommendations = [
                {
                    "type": "mindfulness",
                    "title": "Mindfulness Practice",
                    "description": "Take 5 minutes to focus on your breathing and present moment",
                    "priority": "medium"
                },
                {
                    "type": "physical_activity",
                    "title": "Light Exercise",
                    "description": "Go for a short walk or do some gentle stretching",
                    "priority": "medium"
                },
                {
                    "type": "journaling",
                    "title": "Journal Your Thoughts",
                    "description": "Write down what's on your mind to process your feelings",
                    "priority": "low"
                }
            ]
        else:
            recommendations = [
                {
                    "type": "maintain_momentum",
                    "title": "Maintain Positive Momentum",
                    "description": "Continue doing what's making you feel good",
                    "priority": "low"
                },
                {
                    "type": "help_others",
                    "title": "Help Others",
                    "description": "Share your positive energy by helping someone else",
                    "priority": "low"
                },
                {
                    "type": "set_goals",
                    "title": "Set New Goals",
                    "description": "Channel your positive energy into setting new personal goals",
                    "priority": "low"
                }
            ]
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'mood_based': True
        })
        
    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        return jsonify({'error': str(e)}), 500

# Pattern analysis endpoint
@app.route('/api/patterns', methods=['POST'])
def analyze_patterns():
    """Analyze patterns in mood data"""
    try:
        data = request.get_json()
        mood_entries = data.get('mood_entries', [])
        
        if not mood_entries:
            return jsonify({
                'success': False,
                'message': 'No mood entries provided'
            }), 400
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(mood_entries)
        df['date'] = pd.to_datetime(df['date'])
        
        # Basic pattern analysis
        patterns = {
            'average_mood': round(df['mood'].mean(), 2),
            'mood_trend': 'stable',
            'total_entries': len(mood_entries),
            'date_range': {
                'start': df['date'].min().isoformat(),
                'end': df['date'].max().isoformat()
            }
        }
        
        # Calculate trend
        if len(df) > 1:
            df_sorted = df.sort_values('date')
            trend = np.polyfit(range(len(df_sorted)), df_sorted['mood'], 1)[0]
            if trend > 0.1:
                patterns['mood_trend'] = 'improving'
            elif trend < -0.1:
                patterns['mood_trend'] = 'declining'
        
        return jsonify({
            'success': True,
            'patterns': patterns
        })
        
    except Exception as e:
        logger.error(f"Pattern analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('NODE_ENV', 'development') == 'development'
    
    logger.info(f"Starting ML Backend on port {port}")
    logger.info("Available endpoints:")
    logger.info("  GET  /api/health - Health check")
    logger.info("  POST /api/sentiment - Sentiment analysis")
    logger.info("  POST /api/predict-mood - Mood prediction")
    logger.info("  POST /api/recommendations - Get recommendations")
    logger.info("  POST /api/patterns - Analyze patterns")
    
    app.run(host='0.0.0.0', port=port, debug=debug)