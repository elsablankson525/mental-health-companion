from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from textblob import TextBlob
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import warnings
from database_service import DatabaseService
from dotenv import load_dotenv

warnings.filterwarnings('ignore')

# Load environment variables
load_dotenv()

# Download required NLTK data
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

app = Flask(__name__)
CORS(app)

# Initialize database service
db_service = DatabaseService()

class MentalHealthML:
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.mood_predictor = None
        self.sentiment_classifier = None
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Load or initialize models
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models if they exist"""
        try:
            if os.path.exists('models/mood_predictor.joblib'):
                self.mood_predictor = joblib.load('models/mood_predictor.joblib')
            if os.path.exists('models/sentiment_classifier.joblib'):
                self.sentiment_classifier = joblib.load('models/sentiment_classifier.joblib')
            if os.path.exists('models/vectorizer.joblib'):
                self.vectorizer = joblib.load('models/vectorizer.joblib')
            if os.path.exists('models/scaler.joblib'):
                self.scaler = joblib.load('models/scaler.joblib')
            self.is_trained = True
        except Exception as e:
            print(f"Error loading models: {e}")
            self.is_trained = False
    
    def save_models(self):
        """Save trained models"""
        os.makedirs('models', exist_ok=True)
        if self.mood_predictor:
            joblib.dump(self.mood_predictor, 'models/mood_predictor.joblib')
        if self.sentiment_classifier:
            joblib.dump(self.sentiment_classifier, 'models/sentiment_classifier.joblib')
        if self.vectorizer:
            joblib.dump(self.vectorizer, 'models/vectorizer.joblib')
        if self.scaler:
            joblib.dump(self.scaler, 'models/scaler.joblib')
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of text using multiple methods"""
        if not text or not text.strip():
            return {"sentiment": "neutral", "confidence": 0.5, "scores": {"positive": 0.33, "negative": 0.33, "neutral": 0.34}}
        
        # VADER sentiment analysis
        vader_scores = self.sentiment_analyzer.polarity_scores(text)
        
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
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "scores": {
                "positive": vader_scores['pos'],
                "negative": vader_scores['neg'],
                "neutral": vader_scores['neu']
            },
            "polarity": polarity,
            "subjectivity": subjectivity
        }
    
    def predict_mood(self, emotions, note="", time_context=None):
        """Predict mood based on emotions and context"""
        if not self.is_trained:
            # Fallback prediction based on emotions
            emotion_scores = {
                "Happy": 8, "Excited": 8, "Grateful": 7, "Confident": 7, "Peaceful": 6,
                "Calm": 6, "Sad": 3, "Anxious": 4, "Frustrated": 3, "Lonely": 3,
                "Overwhelmed": 3, "Angry": 2
            }
            
            if emotions:
                avg_score = sum(emotion_scores.get(emotion, 5) for emotion in emotions) / len(emotions)
                return {
                    "predicted_mood": round(avg_score),
                    "confidence": 0.6,
                    "method": "emotion_based"
                }
            else:
                return {
                    "predicted_mood": 5,
                    "confidence": 0.3,
                    "method": "default"
                }
        
        # Use trained model for prediction
        try:
            # Prepare features
            features = self.prepare_mood_features(emotions, note, time_context)
            features_scaled = self.scaler.transform([features])
            prediction = self.mood_predictor.predict(features_scaled)[0]
            confidence = 0.8
            
            return {
                "predicted_mood": int(prediction),
                "confidence": confidence,
                "method": "ml_model"
            }
        except Exception as e:
            print(f"Error in mood prediction: {e}")
            return {
                "predicted_mood": 5,
                "confidence": 0.3,
                "method": "fallback"
            }
    
    def prepare_mood_features(self, emotions, note, time_context):
        """Prepare features for mood prediction"""
        # Emotion features (one-hot encoding)
        emotion_features = [0] * 12
        emotion_list = ["Happy", "Sad", "Anxious", "Calm", "Excited", "Frustrated", 
                       "Grateful", "Lonely", "Confident", "Overwhelmed", "Peaceful", "Angry"]
        
        for emotion in emotions:
            if emotion in emotion_list:
                emotion_features[emotion_list.index(emotion)] = 1
        
        # Note sentiment features
        note_sentiment = self.analyze_sentiment(note)
        sentiment_features = [
            note_sentiment['scores']['positive'],
            note_sentiment['scores']['negative'],
            note_sentiment['scores']['neutral'],
            note_sentiment['polarity'],
            note_sentiment['subjectivity']
        ]
        
        # Time context features
        if time_context:
            hour = time_context.get('hour', 12)
            day_of_week = time_context.get('day_of_week', 1)
            time_features = [hour / 24, day_of_week / 7]
        else:
            time_features = [0.5, 0.5]  # Default values
        
        # Combine all features
        all_features = emotion_features + sentiment_features + time_features
        return all_features
    
    def get_recommendations(self, mood, emotions, sentiment_analysis):
        """Generate personalized recommendations based on current state"""
        recommendations = []
        
        # Mood-based recommendations
        if mood <= 3:
            recommendations.extend([
                "Consider reaching out to a trusted friend or family member",
                "Try some deep breathing exercises or meditation",
                "Engage in a gentle physical activity like walking",
                "Consider professional mental health support"
            ])
        elif mood <= 5:
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
        
        # Emotion-specific recommendations
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
        
        if "Overwhelmed" in emotions:
            recommendations.extend([
                "Break tasks into smaller, manageable steps",
                "Take one thing at a time"
            ])
        
        # Remove duplicates and return top recommendations
        unique_recommendations = list(dict.fromkeys(recommendations))
        return unique_recommendations[:5]

# Initialize ML service
ml_service = MentalHealthML()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ml_trained': ml_service.is_trained,
        'database_connected': db_service.connection is not None
    })

@app.route('/api/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        result = ml_service.analyze_sentiment(text)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood-prediction', methods=['POST'])
def predict_mood():
    """Predict mood based on emotions and context"""
    try:
        data = request.get_json()
        emotions = data.get('emotions', [])
        note = data.get('note', '')
        time_context = data.get('time_context')
        
        result = ml_service.predict_mood(emotions, note, time_context)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized recommendations"""
    try:
        data = request.get_json()
        mood = data.get('mood', 5)
        emotions = data.get('emotions', [])
        sentiment_analysis = data.get('sentiment_analysis', {})
        
        recommendations = ml_service.get_recommendations(mood, emotions, sentiment_analysis)
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-insights/<user_id>', methods=['GET'])
def get_user_insights(user_id):
    """Get insights for a specific user from database"""
    try:
        # Get user data from database
        user_data = db_service.get_user_data_for_ml(user_id)
        
        if not user_data['mood_entries']:
            return jsonify({'error': 'No data available for user'}), 404
        
        # Process mood data
        mood_data = []
        for entry in user_data['mood_entries']:
            mood_data.append({
                'mood': entry['mood'],
                'emotions': entry['emotions'],
                'date': entry['date'].isoformat() if entry['date'] else None,
                'note': entry['note']
            })
        
        # Calculate insights
        moods = [entry['mood'] for entry in mood_data]
        avg_mood = sum(moods) / len(moods) if moods else 5
        
        # Emotion frequency
        emotion_freq = {}
        for entry in mood_data:
            for emotion in entry['emotions']:
                emotion_freq[emotion] = emotion_freq.get(emotion, 0) + 1
        
        # Recent trend (last 7 entries)
        recent_moods = moods[:7] if len(moods) >= 7 else moods
        trend = "stable"
        if len(recent_moods) >= 2:
            if recent_moods[0] > recent_moods[-1] + 1:
                trend = "improving"
            elif recent_moods[0] < recent_moods[-1] - 1:
                trend = "declining"
        
        insights = {
            'average_mood': round(avg_mood, 2),
            'total_entries': len(mood_data),
            'trend': trend,
            'most_common_emotions': sorted(emotion_freq.items(), key=lambda x: x[1], reverse=True)[:5],
            'recent_moods': recent_moods,
            'data_available': True
        }
        
        return jsonify(insights)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train-models', methods=['POST'])
def train_models():
    """Train ML models with user data"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Get user data from database
        user_data = db_service.get_user_data_for_ml(user_id)
        
        if len(user_data['mood_entries']) < 10:
            return jsonify({'error': 'Insufficient data for training'}), 400
        
        # Prepare training data
        X = []
        y = []
        
        for entry in user_data['mood_entries']:
            features = ml_service.prepare_mood_features(
                entry['emotions'],
                entry['note'] or '',
                {'hour': entry['date'].hour if entry['date'] else 12, 'day_of_week': entry['date'].weekday() if entry['date'] else 1}
            )
            X.append(features)
            y.append(entry['mood'])
        
        # Train mood predictor
        X = np.array(X)
        y = np.array(y)
        
        ml_service.scaler.fit(X)
        X_scaled = ml_service.scaler.transform(X)
        
        ml_service.mood_predictor = RandomForestClassifier(n_estimators=100, random_state=42)
        ml_service.mood_predictor.fit(X_scaled, y)
        
        # Save models
        ml_service.save_models()
        ml_service.is_trained = True
        
        return jsonify({
            'message': 'Models trained successfully',
            'training_samples': len(X),
            'model_accuracy': 'Available after validation'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
