#!/usr/bin/env python3
"""
Enhanced ML System for Mental Health Companion
Integrates all improvements: diverse data, advanced features, feedback, A/B testing, and continuous learning
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os
import logging
from typing import Dict, List, Any, Optional

# Import all the enhancement modules
from enhanced_data_generator import EnhancedDataGenerator
from advanced_feature_engineering import AdvancedFeatureEngineer
from feedback_system import FeedbackSystem
from ab_testing_framework import ABTestingFramework
from continuous_learning_system import ContinuousLearningSystem
from enhanced_recommendations import EnhancedMentalHealthRecommendations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedMentalHealthML:
    """Enhanced ML system with all improvements integrated"""
    
    def __init__(self, models_dir="models", db_path="enhanced_ml.db"):
        self.models_dir = models_dir
        self.db_path = db_path
        
        # Initialize all components
        self.data_generator = EnhancedDataGenerator()
        self.feature_engineer = AdvancedFeatureEngineer()
        self.feedback_system = FeedbackSystem(f"{db_path}_feedback")
        self.ab_framework = ABTestingFramework(f"{db_path}_ab")
        self.learning_system = ContinuousLearningSystem(models_dir, f"{db_path}_learning")
        self.recommendations = EnhancedMentalHealthRecommendations()
        
        # Model state
        self.models_loaded = False
        self.current_models = {}
        
        # Initialize
        self._initialize_system()
    
    def _initialize_system(self):
        """Initialize the enhanced ML system"""
        logger.info("Initializing Enhanced ML System...")
        
        # Create models directory
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Load existing models
        self._load_models()
        
        # Start continuous learning
        self.learning_system.start_continuous_learning()
        
        logger.info("Enhanced ML System initialized successfully")
    
    def _load_models(self):
        """Load existing trained models"""
        try:
            model_path = os.path.join(self.models_dir, "mood_predictor.joblib")
            scaler_path = os.path.join(self.models_dir, "scaler.joblib")
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                import joblib
                self.current_models['mood_predictor'] = joblib.load(model_path)
                self.current_models['scaler'] = joblib.load(scaler_path)
                self.models_loaded = True
                logger.info("Existing models loaded successfully")
            else:
                logger.info("No existing models found, will train new ones")
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.models_loaded = False
    
    def generate_enhanced_training_data(self, num_mood_entries=500, num_journal_entries=200):
        """Generate enhanced training data with diverse patterns"""
        logger.info("Generating enhanced training data...")
        
        # Generate diverse mood entries
        mood_entries = self.data_generator.generate_diverse_mood_entries(
            num_mood_entries, include_conditions=True
        )
        
        # Generate journal entries
        journal_entries = self.data_generator.generate_journal_entries(num_journal_entries)
        
        logger.info(f"Generated {len(mood_entries)} mood entries and {len(journal_entries)} journal entries")
        
        return mood_entries, journal_entries
    
    def train_enhanced_models(self, mood_entries, journal_entries=None):
        """Train models with enhanced features and data"""
        logger.info("Training enhanced models...")
        
        # Extract comprehensive features
        features_df = self.feature_engineer.extract_comprehensive_features(
            mood_entries, journal_entries
        )
        
        logger.info(f"Extracted {len(features_df.columns)} features")
        
        # Prepare features for training
        X_scaled, y, feature_names = self.feature_engineer.prepare_features_for_training(features_df)
        
        if y is None:
            logger.error("No target values found for training")
            return False
        
        # Train model
        from sklearn.ensemble import RandomForestClassifier
        import joblib
        
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_scaled, y)
        
        # Calculate accuracy
        train_accuracy = model.score(X_scaled, y)
        logger.info(f"Training accuracy: {train_accuracy:.3f}")
        
        # Save models
        os.makedirs(self.models_dir, exist_ok=True)
        joblib.dump(model, os.path.join(self.models_dir, "mood_predictor.joblib"))
        joblib.dump(self.feature_engineer.scaler, os.path.join(self.models_dir, "scaler.joblib"))
        
        # Update current models
        self.current_models['mood_predictor'] = model
        self.current_models['scaler'] = self.feature_engineer.scaler
        self.models_loaded = True
        
        # Add training samples to learning system
        for i, (features, target) in enumerate(zip(features_df.to_dict('records'), y)):
            self.learning_system.add_training_sample(
                user_id=f"training_sample_{i}",
                features=features,
                target_value=target,
                data_type="training"
            )
        
        logger.info("Enhanced models trained and saved successfully")
        return True
    
    def predict_mood_enhanced(self, emotions, note="", time_context=None, user_id=None):
        """Enhanced mood prediction with all improvements"""
        if not self.models_loaded:
            return self._fallback_prediction(emotions, note)
        
        try:
            # Prepare features using enhanced feature engineering
            features = self._prepare_prediction_features(emotions, note, time_context)
            
            # Convert to array format
            feature_array = self._convert_features_to_array(features)
            if feature_array is None:
                return self._fallback_prediction(emotions, note)
            
            # Scale features
            feature_array_scaled = self.current_models['scaler'].transform([feature_array])
            
            # Predict
            prediction = self.current_models['mood_predictor'].predict(feature_array_scaled)[0]
            probabilities = self.current_models['mood_predictor'].predict_proba(feature_array_scaled)[0]
            confidence = max(probabilities)
            
            # Record prediction for learning
            if user_id:
                self.learning_system.add_training_sample(
                    user_id=user_id,
                    features=features,
                    target_value=prediction,
                    prediction=prediction,
                    confidence=confidence,
                    data_type="prediction"
                )
            
            return {
                'predicted_mood': int(prediction),
                'confidence': float(confidence),
                'probabilities': {
                    str(i+1): float(prob) for i, prob in enumerate(probabilities)
                },
                'method': 'enhanced_ml'
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced prediction: {e}")
            return self._fallback_prediction(emotions, note)
    
    def _prepare_prediction_features(self, emotions, note, time_context):
        """Prepare features for prediction"""
        # Create a mock entry for feature extraction
        mock_entry = {
            'mood': 5,  # Will be predicted
            'emotions': emotions,
            'date': time_context or {
                'year': datetime.now().year,
                'month': datetime.now().month,
                'day': datetime.now().day,
                'hour': datetime.now().hour,
                'day_of_week': datetime.now().weekday()
            },
            'note': note,
            'context': {
                'sleep_quality': 0.5,
                'exercise_today': False,
                'social_interaction': False,
                'work_stress': 0.5
            },
            'profile': {
                'age_group': '26-35',
                'has_condition': False,
                'life_stress_level': 0.5,
                'social_support': 0.5
            }
        }
        
        # Extract features
        features = self.feature_engineer._extract_mood_features(mock_entry)
        return features
    
    def _convert_features_to_array(self, features):
        """Convert features dictionary to numpy array"""
        try:
            # Define expected feature order (should match training)
            feature_order = [
                'emotion_count', 'has_note', 'hour', 'day_of_week', 'is_weekend',
                'is_morning', 'is_afternoon', 'is_evening', 'is_night', 'month', 'season',
                'hour_sin', 'hour_cos', 'day_sin', 'day_cos', 'month_sin', 'month_cos',
                'emotion_happy', 'emotion_sad', 'emotion_anxious', 'emotion_calm',
                'emotion_excited', 'emotion_frustrated', 'emotion_grateful',
                'emotion_lonely', 'emotion_confident', 'emotion_overwhelmed',
                'emotion_peaceful', 'emotion_angry', 'positive_emotion_count',
                'negative_emotion_count', 'neutral_emotion_count', 'emotion_diversity',
                'emotion_intensity', 'text_length', 'word_count', 'sentence_count',
                'avg_word_length', 'sentiment_positive', 'sentiment_negative',
                'sentiment_neutral', 'sentiment_compound', 'polarity', 'subjectivity',
                'readability_score', 'emotional_words_count', 'question_marks',
                'exclamation_marks', 'capital_letters', 'pronoun_count', 'negative_words',
                'positive_words', 'sleep_quality', 'exercise_today', 'social_interaction',
                'work_stress', 'medication_taken', 'therapy_session', 'crisis_thoughts',
                'has_condition', 'life_stress_level', 'social_support', 'age_group_encoded',
                'occupation_encoded', 'living_situation_encoded', 'mood_trend',
                'mood_volatility', 'entry_frequency', 'mood_momentum', 'mood_consistency',
                'mood_recovery', 'journal_entries_today', 'total_journal_length',
                'avg_journal_sentiment'
            ]
            
            feature_array = []
            for feature in feature_order:
                value = features.get(feature, 0)
                if isinstance(value, (int, float)):
                    feature_array.append(value)
                else:
                    feature_array.append(0)
            
            return np.array(feature_array)
            
        except Exception as e:
            logger.error(f"Error converting features to array: {e}")
            return None
    
    def _fallback_prediction(self, emotions, note):
        """Fallback prediction when models are not available"""
        emotion_scores = {
            "Happy": 8, "Excited": 8, "Grateful": 7, "Confident": 7, "Peaceful": 6,
            "Calm": 6, "Sad": 3, "Anxious": 4, "Frustrated": 3, "Lonely": 3,
            "Overwhelmed": 3, "Angry": 2
        }
        
        if emotions:
            avg_score = sum(emotion_scores.get(emotion, 5) for emotion in emotions) / len(emotions)
            return {
                'predicted_mood': round(avg_score),
                'confidence': 0.6,
                'method': 'fallback'
            }
        else:
            return {
                'predicted_mood': 5,
                'confidence': 0.3,
                'method': 'default'
            }
    
    def get_enhanced_recommendations(self, mood, emotions, sentiment_data=None, 
                                   time_context=None, user_id=None):
        """Get enhanced recommendations with feedback integration"""
        # Get base recommendations
        recommendations = self.recommendations.get_recommendations(
            mood, emotions, sentiment_data, time_context
        )
        
        # Apply user preferences from feedback
        if user_id:
            user_prefs = self.feedback_system.get_user_preferences(user_id)
            
            # Filter recommendations based on user preferences
            filtered_recommendations = []
            for rec in recommendations:
                # Check if recommendation category is preferred
                category = self._get_recommendation_category(rec)
                if category not in user_prefs['avoided_categories']:
                    filtered_recommendations.append(rec)
            
            if filtered_recommendations:
                recommendations = filtered_recommendations
        
        # Apply A/B testing if active
        recommendations = self._apply_ab_testing(recommendations, user_id)
        
        return recommendations
    
    def _get_recommendation_category(self, recommendation):
        """Get category of a recommendation"""
        # Simple keyword-based categorization
        rec_lower = recommendation.lower()
        if any(word in rec_lower for word in ['breathing', 'grounding', 'anxiety']):
            return 'anxiety_management'
        elif any(word in rec_lower for word in ['depression', 'sad', 'hopeless']):
            return 'depression_support'
        elif any(word in rec_lower for word in ['stress', 'overwhelmed', 'time']):
            return 'stress_management'
        elif any(word in rec_lower for word in ['social', 'friend', 'connect']):
            return 'social_connection'
        else:
            return 'general'
    
    def _apply_ab_testing(self, recommendations, user_id):
        """Apply A/B testing to recommendations"""
        # Check for active recommendation experiments
        active_experiments = self.ab_framework.list_active_experiments()
        
        for experiment in active_experiments:
            if experiment['status'] == 'active' and 'recommendation' in experiment['name'].lower():
                # Assign user to variant
                variant = self.ab_framework.assign_user_to_variant(
                    experiment['experiment_id'], user_id or 'anonymous'
                )
                
                # Modify recommendations based on variant
                if variant == 'enhanced':
                    # Apply enhanced recommendation logic
                    recommendations = self._enhance_recommendations(recommendations)
        
        return recommendations
    
    def _enhance_recommendations(self, recommendations):
        """Enhance recommendations based on A/B testing variant"""
        # Add more personalized or advanced recommendations
        enhanced = []
        for rec in recommendations:
            enhanced.append(rec)
            # Add related suggestions
            if 'breathing' in rec.lower():
                enhanced.append("Try the 4-7-8 breathing technique for deeper relaxation")
            elif 'walk' in rec.lower():
                enhanced.append("Consider walking in nature for additional benefits")
        
        return enhanced[:8]  # Limit to 8 recommendations
    
    def record_user_feedback(self, user_id, recommendation_id, feedback_type, 
                           rating=None, comment=None, context=None):
        """Record user feedback for continuous improvement"""
        self.feedback_system.record_feedback(
            user_id, recommendation_id, feedback_type, rating, comment, context
        )
        
        # Record A/B testing event
        active_experiments = self.ab_framework.list_active_experiments()
        for experiment in active_experiments:
            if experiment['status'] == 'active':
                self.ab_framework.record_event(
                    experiment['experiment_id'],
                    user_id,
                    'recommendation_feedback',
                    rating or (1 if feedback_type == 'helpful' else 0),
                    context
                )
    
    def get_system_insights(self):
        """Get comprehensive system insights"""
        insights = {
            'models_loaded': self.models_loaded,
            'learning_insights': self.learning_system.get_learning_insights(),
            'feedback_insights': self.feedback_system.get_feedback_insights(),
            'active_experiments': self.ab_framework.list_active_experiments(),
            'system_status': 'healthy' if self.models_loaded else 'needs_training'
        }
        
        return insights
    
    def run_full_training_pipeline(self):
        """Run the complete training pipeline with all enhancements"""
        logger.info("Starting full training pipeline...")
        
        # Step 1: Generate enhanced training data
        mood_entries, journal_entries = self.generate_enhanced_training_data(500, 200)
        
        # Step 2: Train enhanced models
        success = self.train_enhanced_models(mood_entries, journal_entries)
        
        if success:
            logger.info("Full training pipeline completed successfully")
            
            # Step 3: Set up A/B testing experiments
            self._setup_ab_experiments()
            
            return True
        else:
            logger.error("Full training pipeline failed")
            return False
    
    def _setup_ab_experiments(self):
        """Set up A/B testing experiments"""
        # Recommendation strategy experiment
        variants = [
            {'name': 'control', 'description': 'Standard recommendation system'},
            {'name': 'enhanced', 'description': 'Enhanced with ML and feedback'}
        ]
        
        self.ab_framework.create_experiment(
            name="Recommendation Strategy Test",
            description="Testing enhanced recommendation system vs standard",
            variants=variants,
            success_metric="recommendation_helpful",
            duration_days=14
        )
        
        logger.info("A/B testing experiments set up")

def test_enhanced_ml_system():
    """Test the enhanced ML system"""
    print("🧠 Testing Enhanced ML System")
    print("=" * 60)
    
    # Initialize system
    enhanced_ml = EnhancedMentalHealthML("test_enhanced_models", "test_enhanced.db")
    
    # Run full training pipeline
    print("🔄 Running full training pipeline...")
    success = enhanced_ml.run_full_training_pipeline()
    
    if success:
        print("✅ Full training pipeline completed successfully")
        
        # Test enhanced prediction
        print("\n🎯 Testing enhanced mood prediction...")
        prediction = enhanced_ml.predict_mood_enhanced(
            emotions=['Happy', 'Excited'],
            note='Feeling great today!',
            time_context={'hour': 14, 'day_of_week': 1},
            user_id='test_user_001'
        )
        print(f"   Prediction: {prediction}")
        
        # Test enhanced recommendations
        print("\n💡 Testing enhanced recommendations...")
        recommendations = enhanced_ml.get_enhanced_recommendations(
            mood=7,
            emotions=['Happy', 'Excited'],
            sentiment_data={'sentiment': 'positive', 'confidence': 0.8},
            user_id='test_user_001'
        )
        print(f"   Generated {len(recommendations)} recommendations:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec}")
        
        # Test feedback recording
        print("\n🔄 Testing feedback system...")
        enhanced_ml.record_user_feedback(
            user_id='test_user_001',
            recommendation_id='anxiety_breathing_exercise',
            feedback_type='helpful',
            rating=4,
            comment='This really helped!',
            context={'category': 'anxiety_management'}
        )
        print("   Feedback recorded successfully")
        
        # Get system insights
        print("\n📊 System Insights:")
        insights = enhanced_ml.get_system_insights()
        print(f"   Models loaded: {insights['models_loaded']}")
        print(f"   System status: {insights['system_status']}")
        print(f"   Active experiments: {len(insights['active_experiments'])}")
        
    else:
        print("❌ Full training pipeline failed")
    
    # Clean up
    enhanced_ml.learning_system.stop_continuous_learning()
    
    # Clean up test files
    import shutil
    if os.path.exists("test_enhanced_models"):
        shutil.rmtree("test_enhanced_models")
    for db_file in ["test_enhanced.db", "test_enhanced.db_feedback", 
                   "test_enhanced.db_ab", "test_enhanced.db_learning"]:
        if os.path.exists(db_file):
            os.remove(db_file)
    
    print("\n🎉 Enhanced ML system test completed!")
    
    return enhanced_ml

if __name__ == "__main__":
    enhanced_ml = test_enhanced_ml_system()
