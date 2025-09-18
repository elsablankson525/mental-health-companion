#!/usr/bin/env python3
"""
Simple Enhanced ML Backend
Simplified version for easy deployment
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
import json
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Simple sentiment analysis
def analyze_sentiment_simple(text):
    """Simple sentiment analysis using TextBlob"""
    try:
        from textblob import TextBlob
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        if polarity >= 0.1:
            return {"sentiment": "positive", "confidence": polarity}
        elif polarity <= -0.1:
            return {"sentiment": "negative", "confidence": abs(polarity)}
        else:
            return {"sentiment": "neutral", "confidence": 1 - abs(polarity)}
    except:
        return {"sentiment": "neutral", "confidence": 0.5}

# Simple mood prediction
def predict_mood_simple(emotions, note=""):
    """Simple mood prediction based on emotions"""
    emotion_scores = {
        "Happy": 8, "Excited": 8, "Grateful": 7, "Confident": 7, "Peaceful": 6,
        "Calm": 6, "Sad": 3, "Anxious": 4, "Frustrated": 3, "Lonely": 3,
        "Overwhelmed": 3, "Angry": 2
    }
    
    if emotions:
        avg_score = sum(emotion_scores.get(emotion, 5) for emotion in emotions) / len(emotions)
        return {
            "predicted_mood": round(avg_score),
            "confidence": 0.7,
            "method": "emotion_based"
        }
    else:
        return {
            "predicted_mood": 5,
            "confidence": 0.3,
            "method": "default"
        }

# Simple recommendations
def get_recommendations_simple(mood, emotions):
    """Simple recommendations based on mood and emotions"""
    recommendations = []
    
    if mood <= 3:
        recommendations.extend([
            "Consider reaching out to a trusted friend or family member",
            "Try some deep breathing exercises or meditation",
            "Engage in gentle physical activity like walking",
            "Consider professional mental health support"
        ])
    elif mood <= 6:
        recommendations.extend([
            "Try journaling about your feelings",
            "Listen to calming music or nature sounds",
            "Practice gratitude by listing three good things",
            "Take a break and do something you enjoy"
        ])
    else:
        recommendations.extend([
            "Share your positive energy with others",
            "Continue your current positive practices",
            "Consider helping someone else today",
            "Document what's working well for you"
        ])
    
    # Add emotion-specific recommendations
    if "Anxious" in emotions:
        recommendations.extend([
            "Try the 5-4-3-2-1 grounding technique",
            "Practice progressive muscle relaxation"
        ])
    
    if "Sad" in emotions:
        recommendations.extend([
            "Allow yourself to feel your emotions",
            "Consider talking to someone you trust"
        ])
    
    return recommendations[:6]

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ml_system': {
            'models_loaded': True,
            'system_status': 'healthy',
            'learning_active': False
        },
        'features': {
            'enhanced_data_generation': False,
            'advanced_feature_engineering': False,
            'user_feedback_system': False,
            'ab_testing_framework': False,
            'continuous_learning': False,
            'enhanced_recommendations': False,
            'simple_mode': True
        }
    })

# Sentiment analysis endpoint
@app.route('/api/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        result = analyze_sentiment_simple(text)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Mood prediction endpoint
@app.route('/api/predict-mood', methods=['POST'])
def predict_mood():
    """Predict mood based on emotions and context"""
    try:
        data = request.get_json()
        emotions = data.get('emotions', [])
        note = data.get('note', '')
        
        prediction = predict_mood_simple(emotions, note)
        return jsonify(prediction)
        
    except Exception as e:
        logger.error(f"Mood prediction error: {e}")
        return jsonify({'error': str(e)}), 500

# Recommendations endpoint
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get recommendations based on mood and emotions"""
    try:
        data = request.get_json()
        mood = data.get('mood', 5)
        emotions = data.get('emotions', [])
        
        recommendations = get_recommendations_simple(mood, emotions)
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'enhanced': False
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
        
        # Simple pattern analysis
        moods = [entry.get('mood', 5) for entry in mood_entries]
        avg_mood = sum(moods) / len(moods) if moods else 5
        
        # Count emotions
        all_emotions = []
        for entry in mood_entries:
            emotions = entry.get('emotions', [])
            all_emotions.extend(emotions)
        
        emotion_counts = {}
        for emotion in all_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        return jsonify({
            'success': True,
            'patterns': {
                'average_mood': round(avg_mood, 2),
                'total_entries': len(mood_entries),
                'emotion_frequency': emotion_counts,
                'mood_range': {
                    'min': min(moods) if moods else 0,
                    'max': max(moods) if moods else 0
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Pattern analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Feedback endpoint (simple)
@app.route('/api/feedback', methods=['POST'])
def record_feedback():
    """Record user feedback"""
    try:
        data = request.get_json()
        logger.info(f"Feedback received: {data}")
        
        return jsonify({
            'status': 'success',
            'message': 'Feedback recorded (simple mode)'
        })
        
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        return jsonify({'error': str(e)}), 500

# Insights endpoint
@app.route('/api/insights', methods=['GET'])
def get_insights():
    """Get system insights"""
    return jsonify({
        'system_status': 'healthy',
        'models_loaded': True,
        'mode': 'simple',
        'features_available': [
            'sentiment_analysis',
            'mood_prediction',
            'recommendations',
            'pattern_analysis',
            'feedback_collection'
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print("🧠 Mental Health Companion - Simple Enhanced ML Backend")
    print("=" * 60)
    print(f"📍 Server starting on: http://localhost:{port}")
    print("🔗 Available endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/sentiment")
    print("   - POST /api/predict-mood")
    print("   - POST /api/recommendations")
    print("   - POST /api/patterns")
    print("   - POST /api/feedback")
    print("   - GET  /api/insights")
    print("\n💡 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=False)
