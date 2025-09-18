#!/usr/bin/env python3
"""
Enhanced ML Backend for Mental Health Companion
Production-ready Flask application with all enhancements
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
import json

# Import all enhancement modules
from enhanced_ml_system import EnhancedMentalHealthML
from enhanced_recommendations import EnhancedMentalHealthRecommendations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize enhanced ML system
try:
    enhanced_ml = EnhancedMentalHealthML(
        models_dir="models",
        db_path="enhanced_ml.db"
    )
    logger.info("Enhanced ML system initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize enhanced ML system: {e}")
    enhanced_ml = None

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Enhanced health check with system status"""
    try:
        if enhanced_ml is None:
            return jsonify({
                'status': 'error',
                'message': 'ML system not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Get system insights
        insights = enhanced_ml.get_system_insights()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'ml_system': {
                'models_loaded': insights['models_loaded'],
                'system_status': insights['system_status'],
                'learning_active': True
            },
            'features': {
                'enhanced_data_generation': True,
                'advanced_feature_engineering': True,
                'user_feedback_system': True,
                'ab_testing_framework': True,
                'continuous_learning': True,
                'enhanced_recommendations': True
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
    """Analyze sentiment of text with enhanced features"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if enhanced_ml is None:
            return jsonify({'error': 'ML system not available'}), 500
        
        # Use enhanced sentiment analysis
        from textblob import TextBlob
        from nltk.sentiment import SentimentIntensityAnalyzer
        
        # Initialize sentiment analyzer
        try:
            sia = SentimentIntensityAnalyzer()
        except:
            # Fallback to TextBlob only
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
                'method': 'textblob_fallback'
            })
        
        # VADER sentiment analysis
        vader_scores = sia.polarity_scores(text)
        
        # TextBlob sentiment analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Determine overall sentiment
        if vader_scores['compound'] >= 0.05:
            sentiment = "positive"
            confidence = vader_scores['compound']
        elif vader_scores['compound'] <= -0.05:
            sentiment = "negative"
            confidence = abs(vader_scores['compound'])
        else:
            sentiment = "neutral"
            confidence = 1 - abs(vader_scores['compound'])
        
        return jsonify({
            'sentiment': sentiment,
            'confidence': confidence,
            'scores': {
                'positive': vader_scores['pos'],
                'negative': vader_scores['neg'],
                'neutral': vader_scores['neu']
            },
            'polarity': polarity,
            'subjectivity': subjectivity,
            'method': 'enhanced_vader_textblob'
        })
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Enhanced mood prediction endpoint
@app.route('/api/predict-mood', methods=['POST'])
def predict_mood():
    """Enhanced mood prediction with all features"""
    try:
        data = request.get_json()
        emotions = data.get('emotions', [])
        note = data.get('note', '')
        time_context = data.get('time_context')
        user_id = data.get('user_id')
        
        if enhanced_ml is None or not enhanced_ml.models_loaded:
            return jsonify({
                'error': 'Enhanced ML system not available',
                'fallback_available': True
            }), 503
        
        # Get enhanced prediction
        prediction = enhanced_ml.predict_mood_enhanced(
            emotions=emotions,
            note=note,
            time_context=time_context,
            user_id=user_id
        )
        
        return jsonify(prediction)
        
    except Exception as e:
        logger.error(f"Mood prediction error: {e}")
        return jsonify({'error': str(e)}), 500

# Enhanced recommendations endpoint
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get enhanced recommendations with feedback integration"""
    try:
        data = request.get_json()
        mood = data.get('mood', 5)
        emotions = data.get('emotions', [])
        sentiment_data = data.get('sentiment_data', {})
        time_context = data.get('time_context')
        user_id = data.get('user_id')
        
        if enhanced_ml is None:
            # Fallback to basic recommendations
            basic_recs = EnhancedMentalHealthRecommendations()
            recommendations = basic_recs.get_recommendations(
                mood, emotions, sentiment_data, time_context
            )
        else:
            # Get enhanced recommendations
            recommendations = enhanced_ml.get_enhanced_recommendations(
                mood=mood,
                emotions=emotions,
                sentiment_data=sentiment_data,
                time_context=time_context,
                user_id=user_id
            )
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'enhanced': enhanced_ml is not None
        })
        
    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        return jsonify({'error': str(e)}), 500

# User feedback endpoint
@app.route('/api/feedback', methods=['POST'])
def record_feedback():
    """Record user feedback for continuous improvement"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        recommendation_id = data.get('recommendation_id')
        feedback_type = data.get('feedback_type')
        rating = data.get('rating')
        comment = data.get('comment')
        context = data.get('context')
        
        if not all([user_id, recommendation_id, feedback_type]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if enhanced_ml is None:
            return jsonify({'error': 'Feedback system not available'}), 503
        
        # Record feedback
        enhanced_ml.record_user_feedback(
            user_id=user_id,
            recommendation_id=recommendation_id,
            feedback_type=feedback_type,
            rating=rating,
            comment=comment,
            context=context
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Feedback recorded successfully'
        })
        
    except Exception as e:
        logger.error(f"Feedback recording error: {e}")
        return jsonify({'error': str(e)}), 500

# Pattern analysis endpoint
@app.route('/api/patterns', methods=['POST'])
def analyze_patterns():
    """Analyze patterns in mood and journal data"""
    try:
        data = request.get_json()
        mood_entries = data.get('mood_entries', [])
        journal_entries = data.get('journal_entries', [])
        
        if not mood_entries:
            return jsonify({
                'success': False,
                'message': 'No mood entries provided'
            }), 400
        
        # Basic pattern analysis
        import pandas as pd
        import numpy as np
        
        mood_df = pd.DataFrame(mood_entries)
        mood_df['date'] = pd.to_datetime(mood_df['date'])
        
        # Time-based patterns
        mood_df['hour'] = mood_df['date'].dt.hour
        mood_df['day_of_week'] = mood_df['date'].dt.dayofweek
        mood_df['is_weekend'] = mood_df['day_of_week'].isin([5, 6]).astype(int)
        
        # Calculate patterns
        hourly_avg = mood_df.groupby('hour')['mood'].mean().to_dict()
        daily_avg = mood_df.groupby('day_of_week')['mood'].mean().to_dict()
        weekend_avg = mood_df[mood_df['is_weekend'] == 1]['mood'].mean()
        weekday_avg = mood_df[mood_df['is_weekend'] == 0]['mood'].mean()
        
        # Trend analysis
        mood_df_sorted = mood_df.sort_values('date')
        if len(mood_df_sorted) > 1:
            trend = np.polyfit(range(len(mood_df_sorted)), mood_df_sorted['mood'], 1)[0]
            trend_direction = "improving" if trend > 0 else "declining" if trend < 0 else "stable"
        else:
            trend_direction = "insufficient_data"
        
        # Emotion frequency
        all_emotions = []
        for emotions in mood_df['emotions']:
            all_emotions.extend(emotions)
        emotion_counts = pd.Series(all_emotions).value_counts().to_dict()
        
        return jsonify({
            'success': True,
            'patterns': {
                'hourly_average': {str(k): round(v, 2) for k, v in hourly_avg.items()},
                'daily_average': {str(k): round(v, 2) for k, v in daily_avg.items()},
                'weekend_vs_weekday': {
                    'weekend_avg': round(weekend_avg, 2) if not pd.isna(weekend_avg) else None,
                    'weekday_avg': round(weekday_avg, 2) if not pd.isna(weekday_avg) else None
                },
                'trend_direction': trend_direction,
                'emotion_frequency': emotion_counts,
                'total_entries': len(mood_entries),
                'average_mood': round(mood_df['mood'].mean(), 2)
            }
        })
        
    except Exception as e:
        logger.error(f"Pattern analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# System insights endpoint
@app.route('/api/insights', methods=['GET'])
def get_system_insights():
    """Get comprehensive system insights"""
    try:
        if enhanced_ml is None:
            return jsonify({
                'error': 'Enhanced ML system not available',
                'basic_status': 'ML system not initialized'
            }), 503
        
        insights = enhanced_ml.get_system_insights()
        return jsonify(insights)
        
    except Exception as e:
        logger.error(f"System insights error: {e}")
        return jsonify({'error': str(e)}), 500

# Training endpoint (for initial setup)
@app.route('/api/train', methods=['POST'])
def train_models():
    """Train models with provided data"""
    try:
        data = request.get_json()
        mood_entries = data.get('mood_entries', [])
        journal_entries = data.get('journal_entries', [])
        
        if not mood_entries:
            return jsonify({
                'error': 'No mood entries provided for training'
            }), 400
        
        if enhanced_ml is None:
            return jsonify({'error': 'Enhanced ML system not available'}), 503
        
        # Train models
        success = enhanced_ml.train_enhanced_models(mood_entries, journal_entries)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Models trained successfully',
                'samples_used': len(mood_entries)
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Model training failed'
            }), 500
        
    except Exception as e:
        logger.error(f"Model training error: {e}")
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
    
    logger.info(f"Starting Enhanced ML Backend on port {port}")
    logger.info("Available endpoints:")
    logger.info("  GET  /api/health - Health check")
    logger.info("  POST /api/sentiment - Sentiment analysis")
    logger.info("  POST /api/predict-mood - Mood prediction")
    logger.info("  POST /api/recommendations - Get recommendations")
    logger.info("  POST /api/feedback - Record user feedback")
    logger.info("  POST /api/patterns - Analyze patterns")
    logger.info("  GET  /api/insights - System insights")
    logger.info("  POST /api/train - Train models")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
