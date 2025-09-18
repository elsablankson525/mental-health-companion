#!/usr/bin/env python3
"""
Advanced Feature Engineering for Mental Health Companion
Enhances feature extraction with contextual and temporal features
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

class AdvancedFeatureEngineer:
    """Advanced feature engineering for mental health data"""
    
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
        # Download required NLTK data
        try:
            nltk.data.find('vader_lexicon')
        except LookupError:
            nltk.download('vader_lexicon')
    
    def extract_comprehensive_features(self, mood_entries, journal_entries=None):
        """Extract comprehensive features from mood and journal entries"""
        features = []
        
        for entry in mood_entries:
            feature_vector = self._extract_mood_features(entry)
            
            # Add journal context if available
            if journal_entries:
                journal_context = self._get_journal_context(entry, journal_entries)
                feature_vector.update(journal_context)
            
            features.append(feature_vector)
        
        return pd.DataFrame(features)
    
    def _extract_mood_features(self, entry):
        """Extract comprehensive features from a single mood entry"""
        features = {}
        
        # Basic mood features
        features['mood'] = entry.get('mood', 5)
        features['emotion_count'] = len(entry.get('emotions', []))
        features['has_note'] = 1 if entry.get('note') else 0
        
        # Temporal features
        date_info = entry.get('date', {})
        features.update(self._extract_temporal_features(date_info))
        
        # Emotion features (one-hot encoding)
        features.update(self._extract_emotion_features(entry.get('emotions', [])))
        
        # Text sentiment features
        if entry.get('note'):
            features.update(self._extract_text_features(entry['note']))
        else:
            features.update(self._get_default_text_features())
        
        # Contextual features
        if 'context' in entry:
            features.update(self._extract_contextual_features(entry['context']))
        
        # Profile features
        if 'profile' in entry:
            features.update(self._extract_profile_features(entry['profile']))
        
        # Advanced temporal patterns
        features.update(self._extract_advanced_temporal_features(entry))
        
        # Mood history features (if available)
        features.update(self._extract_mood_history_features(entry))
        
        return features
    
    def _extract_temporal_features(self, date_info):
        """Extract temporal features from date information"""
        features = {}
        
        if not date_info:
            return {
                'hour': 12, 'day_of_week': 1, 'is_weekend': 0,
                'is_morning': 0, 'is_afternoon': 0, 'is_evening': 0,
                'is_night': 0, 'month': 6, 'season': 2
            }
        
        hour = date_info.get('hour', 12)
        day_of_week = date_info.get('day_of_week', 1)
        month = date_info.get('month', 6)
        
        features['hour'] = hour
        features['day_of_week'] = day_of_week
        features['is_weekend'] = 1 if day_of_week >= 5 else 0
        
        # Time of day categories
        features['is_morning'] = 1 if 6 <= hour < 12 else 0
        features['is_afternoon'] = 1 if 12 <= hour < 18 else 0
        features['is_evening'] = 1 if 18 <= hour < 22 else 0
        features['is_night'] = 1 if hour >= 22 or hour < 6 else 0
        
        # Seasonal features
        features['month'] = month
        features['season'] = self._get_season(month)
        
        # Cyclical encoding for temporal features
        features['hour_sin'] = np.sin(2 * np.pi * hour / 24)
        features['hour_cos'] = np.cos(2 * np.pi * hour / 24)
        features['day_sin'] = np.sin(2 * np.pi * day_of_week / 7)
        features['day_cos'] = np.cos(2 * np.pi * day_of_week / 7)
        features['month_sin'] = np.sin(2 * np.pi * month / 12)
        features['month_cos'] = np.cos(2 * np.pi * month / 12)
        
        return features
    
    def _get_season(self, month):
        """Get season as numeric value"""
        if month in [12, 1, 2]:
            return 0  # Winter
        elif month in [3, 4, 5]:
            return 1  # Spring
        elif month in [6, 7, 8]:
            return 2  # Summer
        else:
            return 3  # Fall
    
    def _extract_emotion_features(self, emotions):
        """Extract emotion-based features"""
        features = {}
        
        # Standard emotion categories
        emotion_categories = {
            'positive': ['Happy', 'Excited', 'Grateful', 'Confident', 'Peaceful'],
            'negative': ['Sad', 'Anxious', 'Frustrated', 'Lonely', 'Overwhelmed', 'Angry'],
            'neutral': ['Calm', 'Peaceful']
        }
        
        # One-hot encoding for individual emotions
        all_emotions = ['Happy', 'Sad', 'Anxious', 'Calm', 'Excited', 'Frustrated', 
                       'Grateful', 'Lonely', 'Confident', 'Overwhelmed', 'Peaceful', 'Angry']
        
        for emotion in all_emotions:
            features[f'emotion_{emotion.lower()}'] = 1 if emotion in emotions else 0
        
        # Emotion category counts
        for category, emotion_list in emotion_categories.items():
            count = sum(1 for emotion in emotions if emotion in emotion_list)
            features[f'{category}_emotion_count'] = count
        
        # Emotion diversity (entropy)
        if emotions:
            emotion_counts = {emotion: emotions.count(emotion) for emotion in set(emotions)}
            total = len(emotions)
            entropy = -sum((count/total) * np.log2(count/total) for count in emotion_counts.values())
            features['emotion_diversity'] = entropy
        else:
            features['emotion_diversity'] = 0
        
        # Emotion intensity (based on emotion combinations)
        intensity_score = 0
        for emotion in emotions:
            if emotion in ['Happy', 'Excited', 'Angry']:
                intensity_score += 2
            elif emotion in ['Sad', 'Anxious', 'Overwhelmed']:
                intensity_score += 1.5
            else:
                intensity_score += 1
        
        features['emotion_intensity'] = intensity_score / len(emotions) if emotions else 0
        
        return features
    
    def _extract_text_features(self, text):
        """Extract comprehensive text features"""
        features = {}
        
        if not text or not text.strip():
            return self._get_default_text_features()
        
        # Basic text features
        features['text_length'] = len(text)
        features['word_count'] = len(text.split())
        features['sentence_count'] = len(re.split(r'[.!?]+', text))
        features['avg_word_length'] = np.mean([len(word) for word in text.split()]) if text.split() else 0
        
        # Sentiment analysis
        sentiment = self._analyze_sentiment_comprehensive(text)
        features.update(sentiment)
        
        # Text complexity features
        features['readability_score'] = self._calculate_readability(text)
        features['emotional_words_count'] = self._count_emotional_words(text)
        features['question_marks'] = text.count('?')
        features['exclamation_marks'] = text.count('!')
        features['capital_letters'] = sum(1 for c in text if c.isupper())
        
        # Linguistic features
        features['pronoun_count'] = len(re.findall(r'\b(I|me|my|mine|myself)\b', text, re.IGNORECASE))
        features['negative_words'] = self._count_negative_words(text)
        features['positive_words'] = self._count_positive_words(text)
        
        return features
    
    def _get_default_text_features(self):
        """Get default values for text features when no text is available"""
        return {
            'text_length': 0, 'word_count': 0, 'sentence_count': 0, 'avg_word_length': 0,
            'sentiment_positive': 0, 'sentiment_negative': 0, 'sentiment_neutral': 1,
            'sentiment_compound': 0, 'polarity': 0, 'subjectivity': 0,
            'readability_score': 0, 'emotional_words_count': 0, 'question_marks': 0,
            'exclamation_marks': 0, 'capital_letters': 0, 'pronoun_count': 0,
            'negative_words': 0, 'positive_words': 0
        }
    
    def _analyze_sentiment_comprehensive(self, text):
        """Comprehensive sentiment analysis"""
        # VADER sentiment
        vader_scores = self.sentiment_analyzer.polarity_scores(text)
        
        # TextBlob sentiment
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        return {
            'sentiment_positive': vader_scores['pos'],
            'sentiment_negative': vader_scores['neg'],
            'sentiment_neutral': vader_scores['neu'],
            'sentiment_compound': vader_scores['compound'],
            'polarity': polarity,
            'subjectivity': subjectivity
        }
    
    def _calculate_readability(self, text):
        """Calculate simple readability score"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        if not words or not sentences:
            return 0
        
        avg_words_per_sentence = len(words) / len(sentences)
        avg_syllables_per_word = np.mean([self._count_syllables(word) for word in words])
        
        # Simple readability formula
        readability = 206.835 - (1.015 * avg_words_per_sentence) - (84.6 * avg_syllables_per_word)
        return max(0, min(100, readability))
    
    def _count_syllables(self, word):
        """Count syllables in a word (approximate)"""
        word = word.lower()
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel
        
        if word.endswith('e'):
            syllable_count -= 1
        
        return max(1, syllable_count)
    
    def _count_emotional_words(self, text):
        """Count emotional words in text"""
        emotional_words = [
            'happy', 'sad', 'angry', 'excited', 'anxious', 'calm', 'frustrated',
            'grateful', 'lonely', 'confident', 'overwhelmed', 'peaceful', 'worried',
            'joy', 'fear', 'love', 'hate', 'hope', 'despair', 'content', 'miserable'
        ]
        
        text_lower = text.lower()
        return sum(1 for word in emotional_words if word in text_lower)
    
    def _count_negative_words(self, text):
        """Count negative words in text"""
        negative_words = [
            'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike',
            'angry', 'frustrated', 'sad', 'depressed', 'anxious', 'worried',
            'stressed', 'overwhelmed', 'lonely', 'hopeless', 'miserable'
        ]
        
        text_lower = text.lower()
        return sum(1 for word in negative_words if word in text_lower)
    
    def _count_positive_words(self, text):
        """Count positive words in text"""
        positive_words = [
            'good', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'like',
            'happy', 'excited', 'grateful', 'confident', 'peaceful', 'calm',
            'joyful', 'content', 'blessed', 'lucky', 'hopeful', 'optimistic'
        ]
        
        text_lower = text.lower()
        return sum(1 for word in positive_words if word in text_lower)
    
    def _extract_contextual_features(self, context):
        """Extract features from contextual information"""
        features = {}
        
        if not context:
            return {
                'sleep_quality': 0.5, 'exercise_today': 0, 'social_interaction': 0,
                'work_stress': 0.5, 'medication_taken': 0, 'therapy_session': 0,
                'crisis_thoughts': 0
            }
        
        features['sleep_quality'] = context.get('sleep_quality', 0.5)
        features['exercise_today'] = 1 if context.get('exercise_today', False) else 0
        features['social_interaction'] = 1 if context.get('social_interaction', False) else 0
        features['work_stress'] = context.get('work_stress', 0.5)
        features['medication_taken'] = 1 if context.get('medication_taken', False) else 0
        features['therapy_session'] = 1 if context.get('therapy_session', False) else 0
        features['crisis_thoughts'] = 1 if context.get('crisis_thoughts', False) else 0
        
        return features
    
    def _extract_profile_features(self, profile):
        """Extract features from user profile"""
        features = {}
        
        if not profile:
            return {
                'has_condition': 0, 'life_stress_level': 0.5, 'social_support': 0.5,
                'age_group_encoded': 0, 'occupation_encoded': 0, 'living_situation_encoded': 0
            }
        
        features['has_condition'] = 1 if profile.get('has_condition', False) else 0
        features['life_stress_level'] = profile.get('life_stress_level', 0.5)
        features['social_support'] = profile.get('social_support', 0.5)
        
        # Encode categorical features
        age_group = profile.get('age_group', '26-35')
        occupation = profile.get('occupation', 'professional')
        living_situation = profile.get('living_situation', 'alone')
        
        features['age_group_encoded'] = self._encode_categorical(age_group, 'age_group')
        features['occupation_encoded'] = self._encode_categorical(occupation, 'occupation')
        features['living_situation_encoded'] = self._encode_categorical(living_situation, 'living_situation')
        
        return features
    
    def _encode_categorical(self, value, category):
        """Encode categorical values"""
        if category not in self.label_encoders:
            self.label_encoders[category] = LabelEncoder()
            # Initialize with common values
            common_values = {
                'age_group': ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
                'occupation': ['student', 'professional', 'retired', 'unemployed', 'freelancer'],
                'living_situation': ['alone', 'with_family', 'with_roommates', 'with_partner']
            }
            self.label_encoders[category].fit(common_values.get(category, [value]))
        
        try:
            return self.label_encoders[category].transform([value])[0]
        except ValueError:
            return 0  # Default value for unknown categories
    
    def _extract_advanced_temporal_features(self, entry):
        """Extract advanced temporal pattern features"""
        features = {}
        
        # These would require historical data to calculate properly
        # For now, we'll add placeholder features that could be calculated with more data
        features['mood_trend'] = 0  # Would be calculated from recent mood history
        features['mood_volatility'] = 0  # Would be calculated from mood variance
        features['entry_frequency'] = 1  # Would be calculated from entry frequency
        
        return features
    
    def _extract_mood_history_features(self, entry):
        """Extract features from mood history (requires historical data)"""
        features = {}
        
        # These features would be calculated from historical mood data
        features['mood_momentum'] = 0  # Recent trend in mood
        features['mood_consistency'] = 0  # How consistent recent moods have been
        features['mood_recovery'] = 0  # How quickly mood recovers from lows
        
        return features
    
    def _get_journal_context(self, mood_entry, journal_entries):
        """Get journal context for a mood entry"""
        features = {}
        
        # Find journal entries from the same day
        mood_date = mood_entry.get('date', {})
        if not mood_date:
            return features
        
        same_day_journals = []
        for journal in journal_entries:
            journal_date = datetime.fromisoformat(journal['date'].replace('Z', '+00:00'))
            mood_datetime = datetime(mood_date.get('year', 2024), 
                                   mood_date.get('month', 1), 
                                   mood_date.get('day', 1))
            
            if journal_date.date() == mood_datetime.date():
                same_day_journals.append(journal)
        
        if same_day_journals:
            # Aggregate journal features
            total_journal_length = sum(len(j['content']) for j in same_day_journals)
            # Convert sentiment to numeric values
            sentiment_values = []
            for j in same_day_journals:
                sentiment = j.get('sentiment', 'neutral')
                if sentiment == 'positive':
                    sentiment_values.append(1)
                elif sentiment == 'negative':
                    sentiment_values.append(-1)
                else:
                    sentiment_values.append(0)
            avg_journal_sentiment = np.mean(sentiment_values) if sentiment_values else 0
            
            features['journal_entries_today'] = len(same_day_journals)
            features['total_journal_length'] = total_journal_length
            features['avg_journal_sentiment'] = avg_journal_sentiment
        else:
            features['journal_entries_today'] = 0
            features['total_journal_length'] = 0
            features['avg_journal_sentiment'] = 0
        
        return features
    
    def prepare_features_for_training(self, features_df):
        """Prepare features for model training"""
        # Separate target variable
        if 'mood' in features_df.columns:
            X = features_df.drop('mood', axis=1)
            y = features_df['mood']
        else:
            X = features_df
            y = None
        
        # Handle missing values
        X = X.fillna(0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, y, X.columns.tolist()

def test_advanced_feature_engineering():
    """Test the advanced feature engineering"""
    print("🔧 Testing Advanced Feature Engineering")
    print("=" * 50)
    
    # Create sample data
    sample_entries = [
        {
            'mood': 8,
            'emotions': ['Happy', 'Excited'],
            'date': {'year': 2024, 'month': 9, 'day': 8, 'hour': 14, 'day_of_week': 1},
            'note': 'Feeling great today! Had a wonderful morning walk.',
            'context': {
                'sleep_quality': 0.8,
                'exercise_today': True,
                'social_interaction': True,
                'work_stress': 0.3
            },
            'profile': {
                'age_group': '26-35',
                'has_condition': False,
                'life_stress_level': 0.3,
                'social_support': 0.8
            }
        },
        {
            'mood': 3,
            'emotions': ['Sad', 'Lonely'],
            'date': {'year': 2024, 'month': 9, 'day': 7, 'hour': 20, 'day_of_week': 0},
            'note': 'Having a really tough day. Feeling overwhelmed and alone.',
            'context': {
                'sleep_quality': 0.2,
                'exercise_today': False,
                'social_interaction': False,
                'work_stress': 0.9
            },
            'profile': {
                'age_group': '18-25',
                'has_condition': True,
                'life_stress_level': 0.8,
                'social_support': 0.3
            }
        }
    ]
    
    # Initialize feature engineer
    engineer = AdvancedFeatureEngineer()
    
    # Extract features
    features_df = engineer.extract_comprehensive_features(sample_entries)
    
    print(f"✅ Extracted {len(features_df.columns)} features")
    print(f"📊 Feature columns: {list(features_df.columns)}")
    print(f"📈 Sample feature values:")
    for col in features_df.columns[:10]:  # Show first 10 features
        print(f"   {col}: {features_df[col].iloc[0]:.3f}")
    
    # Prepare for training
    X_scaled, y, feature_names = engineer.prepare_features_for_training(features_df)
    
    print(f"\n🎯 Prepared features for training:")
    print(f"   - Feature matrix shape: {X_scaled.shape}")
    print(f"   - Target variable: {'Available' if y is not None else 'Not available'}")
    print(f"   - Feature names: {len(feature_names)} features")
    
    return engineer, features_df

if __name__ == "__main__":
    engineer, features_df = test_advanced_feature_engineering()
    print("\n🎉 Advanced feature engineering test completed!")
