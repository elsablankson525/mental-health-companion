from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import json
from textblob import TextBlob
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

class SimpleMentalHealthML:
    def __init__(self):
        self.is_trained = False
        
    def analyze_sentiment(self, text):
        """Analyze sentiment of text using TextBlob"""
        if not text or not text.strip():
            return {"sentiment": "neutral", "confidence": 0.5, "scores": {"positive": 0.33, "negative": 0.33, "neutral": 0.34}}
        
        # TextBlob sentiment analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Determine overall sentiment
        if polarity >= 0.1:
            sentiment = "positive"
            confidence = polarity
        elif polarity <= -0.1:
            sentiment = "negative"
            confidence = abs(polarity)
        else:
            sentiment = "neutral"
            confidence = 1 - abs(polarity)
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "scores": {
                "positive": max(0, polarity) if polarity > 0 else 0,
                "negative": max(0, -polarity) if polarity < 0 else 0,
                "neutral": 1 - abs(polarity)
            },
            "polarity": polarity,
            "subjectivity": subjectivity
        }
    
    def get_recommendations(self, mood, emotions, sentiment_data):
        """Get personalized recommendations based on mood and emotions"""
        recommendations = []
        
        # Mood-based recommendations
        if mood <= 3:
            recommendations.extend([
                "Try deep breathing exercises for 5 minutes",
                "Listen to calming music or nature sounds",
                "Reach out to a trusted friend or family member",
                "Consider professional help if feelings persist"
            ])
        elif mood <= 6:
            recommendations.extend([
                "Take a short walk outside",
                "Practice gratitude by writing down 3 good things",
                "Try a mindfulness meditation",
                "Engage in a hobby you enjoy"
            ])
        else:
            recommendations.extend([
                "Share your positive energy with others",
                "Try a new activity or challenge",
                "Document what's making you feel good",
                "Help someone else if possible"
            ])
        
        # Emotion-specific recommendations
        if 'Anxious' in emotions:
            recommendations.extend([
                "Practice the 5-4-3-2-1 grounding technique",
                "Try progressive muscle relaxation",
                "Limit caffeine and news consumption"
            ])
        
        if 'Sad' in emotions:
            recommendations.extend([
                "Allow yourself to feel these emotions",
                "Engage in gentle physical activity",
                "Consider talking to a mental health professional"
            ])
        
        if 'Overwhelmed' in emotions:
            recommendations.extend([
                "Break tasks into smaller, manageable steps",
                "Practice time management techniques",
                "Take regular breaks throughout the day"
            ])
        
        # Sentiment-based recommendations
        if sentiment_data and sentiment_data.get('sentiment') == 'negative':
            recommendations.extend([
                "Challenge negative thoughts with evidence",
                "Practice self-compassion",
                "Consider cognitive behavioral techniques"
            ])
        
        return list(set(recommendations))[:8]  # Remove duplicates and limit to 8
    
    def analyze_patterns(self, mood_entries, journal_entries):
        """Analyze patterns in mood and journal data"""
        if not mood_entries:
            return {"success": False, "message": "No data available for analysis"}
        
        try:
            # Convert to DataFrame for analysis
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
            
            return {
                "success": True,
                "patterns": {
                    "hourly_average": {str(k): round(v, 2) for k, v in hourly_avg.items()},
                    "daily_average": {str(k): round(v, 2) for k, v in daily_avg.items()},
                    "weekend_vs_weekday": {
                        "weekend_avg": round(weekend_avg, 2) if not pd.isna(weekend_avg) else None,
                        "weekday_avg": round(weekday_avg, 2) if not pd.isna(weekday_avg) else None
                    },
                    "trend_direction": trend_direction,
                    "emotion_frequency": emotion_counts,
                    "total_entries": len(mood_entries),
                    "average_mood": round(mood_df['mood'].mean(), 2)
                }
            }
        except Exception as e:
            return {"success": False, "message": f"Pattern analysis failed: {str(e)}"}

# Initialize ML system
ml_system = SimpleMentalHealthML()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_trained": ml_system.is_trained})

@app.route('/api/sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        result = ml_system.analyze_sentiment(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        mood = data.get('mood', 5)
        emotions = data.get('emotions', [])
        sentiment_data = data.get('sentiment_data', {})
        
        recommendations = ml_system.get_recommendations(mood, emotions, sentiment_data)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/patterns', methods=['POST'])
def analyze_patterns():
    try:
        data = request.get_json()
        mood_entries = data.get('mood_entries', [])
        journal_entries = data.get('journal_entries', [])
        
        result = ml_system.analyze_patterns(mood_entries, journal_entries)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🧠 Mental Health ML Backend (Simplified)")
    print("=" * 50)
    print("📍 Server will be available at: http://localhost:5000")
    print("🔗 API endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/sentiment")
    print("   - POST /api/recommendations")
    print("   - POST /api/patterns")
    print("\n💡 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
