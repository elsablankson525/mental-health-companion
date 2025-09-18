#!/usr/bin/env python3
"""
Comprehensive Model Validation Script
Tests all trained models and provides detailed performance metrics
"""

import json
import numpy as np
from datetime import datetime, timedelta
from app import MentalHealthML
from enhanced_recommendations import EnhancedMentalHealthRecommendations

def validate_sentiment_analysis(ml_system):
    """Validate sentiment analysis with various text inputs"""
    print("🔍 Validating Sentiment Analysis")
    print("-" * 40)
    
    test_cases = [
        ("I'm feeling absolutely wonderful today!", "positive"),
        ("This is the worst day of my life.", "negative"),
        ("I'm okay, nothing special happened.", "neutral"),
        ("I'm so grateful for everything in my life.", "positive"),
        ("I'm really struggling with anxiety and depression.", "negative"),
        ("The weather is nice today.", "neutral"),
        ("I can't stop smiling, everything is perfect!", "positive"),
        ("I feel completely hopeless and alone.", "negative"),
        ("I had a regular day at work.", "neutral"),
        ("I'm excited about my upcoming vacation!", "positive")
    ]
    
    correct_predictions = 0
    total_predictions = len(test_cases)
    
    for text, expected_sentiment in test_cases:
        result = ml_system.analyze_sentiment(text)
        predicted_sentiment = result['sentiment']
        confidence = result['confidence']
        
        is_correct = predicted_sentiment == expected_sentiment
        if is_correct:
            correct_predictions += 1
        
        status = "✅" if is_correct else "❌"
        print(f"{status} '{text[:30]}...' → {predicted_sentiment} (confidence: {confidence:.2f}) [Expected: {expected_sentiment}]")
    
    accuracy = correct_predictions / total_predictions
    print(f"\n📊 Sentiment Analysis Accuracy: {accuracy:.2%} ({correct_predictions}/{total_predictions})")
    return accuracy

def validate_mood_prediction(ml_system):
    """Validate mood prediction with various feature combinations"""
    print("\n🎯 Validating Mood Prediction")
    print("-" * 40)
    
    test_cases = [
        {
            'emotions': ['Happy', 'Excited'],
            'note': 'Feeling great today!',
            'time_context': {'hour': 14, 'day_of_week': 1},
            'expected_range': (7, 10)
        },
        {
            'emotions': ['Sad', 'Lonely'],
            'note': 'Having a really tough day.',
            'time_context': {'hour': 20, 'day_of_week': 3},
            'expected_range': (1, 4)
        },
        {
            'emotions': ['Anxious', 'Overwhelmed'],
            'note': 'Stressed about work deadlines.',
            'time_context': {'hour': 9, 'day_of_week': 2},
            'expected_range': (3, 6)
        },
        {
            'emotions': ['Calm', 'Peaceful'],
            'note': 'Enjoying a quiet evening.',
            'time_context': {'hour': 19, 'day_of_week': 6},
            'expected_range': (6, 8)
        },
        {
            'emotions': ['Grateful', 'Confident'],
            'note': 'Accomplished my goals today.',
            'time_context': {'hour': 16, 'day_of_week': 4},
            'expected_range': (7, 9)
        }
    ]
    
    correct_predictions = 0
    total_predictions = len(test_cases)
    
    for i, case in enumerate(test_cases, 1):
        # Convert to feature array format
        feature_array = [
            len(case['emotions']),  # emotion_count
            1 if case['note'] else 0,  # has_note
            case['time_context']['hour'],  # hour
            case['time_context']['day_of_week'],  # day_of_week
            1 if case['time_context']['day_of_week'] in [5, 6] else 0,  # is_weekend
            # Emotion features (one-hot encoding)
            1 if 'Happy' in case['emotions'] else 0,
            1 if 'Sad' in case['emotions'] else 0,
            1 if 'Anxious' in case['emotions'] else 0,
            1 if 'Calm' in case['emotions'] else 0,
            1 if 'Excited' in case['emotions'] else 0,
            1 if 'Frustrated' in case['emotions'] else 0,
            1 if 'Grateful' in case['emotions'] else 0,
            1 if 'Lonely' in case['emotions'] else 0,
            1 if 'Confident' in case['emotions'] else 0,
            1 if 'Overwhelmed' in case['emotions'] else 0,
            1 if 'Peaceful' in case['emotions'] else 0,
            1 if 'Angry' in case['emotions'] else 0,
            # Note sentiment features (simplified)
            0.8, 0.1, 0.1, 0.6, 0.4  # placeholder sentiment scores
        ]
        
        result = ml_system.predict_mood(feature_array)
        predicted_mood = result['predicted_mood']
        confidence = result['confidence']
        expected_min, expected_max = case['expected_range']
        
        is_correct = expected_min <= predicted_mood <= expected_max
        if is_correct:
            correct_predictions += 1
        
        status = "✅" if is_correct else "❌"
        print(f"{status} Test {i}: Emotions {case['emotions']} → Mood {predicted_mood} (confidence: {confidence:.2f}) [Expected: {expected_min}-{expected_max}]")
    
    accuracy = correct_predictions / total_predictions
    print(f"\n📊 Mood Prediction Accuracy: {accuracy:.2%} ({correct_predictions}/{total_predictions})")
    return accuracy

def validate_recommendations(rec_system):
    """Validate recommendation system with various scenarios"""
    print("\n💡 Validating Recommendations System")
    print("-" * 40)
    
    test_scenarios = [
        {
            'name': 'Crisis Situation',
            'mood': 1,
            'emotions': ['Sad', 'Lonely'],
            'sentiment_data': {'sentiment': 'negative', 'confidence': 0.9},
            'time_context': {'hour': 23, 'day_of_week': 1}
        },
        {
            'name': 'Anxiety Episode',
            'mood': 4,
            'emotions': ['Anxious', 'Overwhelmed'],
            'sentiment_data': {'sentiment': 'negative', 'confidence': 0.7},
            'time_context': {'hour': 10, 'day_of_week': 2}
        },
        {
            'name': 'Good Mood',
            'mood': 8,
            'emotions': ['Happy', 'Excited'],
            'sentiment_data': {'sentiment': 'positive', 'confidence': 0.8},
            'time_context': {'hour': 15, 'day_of_week': 5}
        },
        {
            'name': 'Evening Stress',
            'mood': 5,
            'emotions': ['Frustrated', 'Overwhelmed'],
            'sentiment_data': {'sentiment': 'negative', 'confidence': 0.6},
            'time_context': {'hour': 21, 'day_of_week': 3}
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n📋 {scenario['name']}:")
        print(f"   Mood: {scenario['mood']}, Emotions: {scenario['emotions']}")
        
        recommendations = rec_system.get_recommendations(
            scenario['mood'],
            scenario['emotions'],
            scenario['sentiment_data'],
            scenario['time_context']
        )
        
        print(f"   Generated {len(recommendations)} recommendations:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec}")
    
    return True

def validate_pattern_analysis(ml_system):
    """Validate pattern analysis with sample data"""
    print("\n📈 Validating Pattern Analysis")
    print("-" * 40)
    
    # Generate sample mood data for pattern analysis
    sample_mood_entries = []
    base_date = datetime.now() - timedelta(days=30)
    
    # Create a realistic mood pattern over 30 days
    for i in range(30):
        entry_date = base_date + timedelta(days=i)
        
        # Create a weekly pattern with some variation
        day_of_week = entry_date.weekday()
        base_mood = 5 + 2 * np.sin(i / 7 * 2 * np.pi) + random.uniform(-1, 1)
        mood = max(1, min(10, int(base_mood)))
        
        # Add some emotions based on mood
        if mood >= 7:
            emotions = ['Happy', 'Excited']
        elif mood <= 4:
            emotions = ['Sad', 'Lonely']
        else:
            emotions = ['Calm', 'Peaceful']
        
        entry = {
            'mood': mood,
            'emotions': emotions,
            'date': entry_date.isoformat(),
            'note': f"Day {i+1} of tracking"
        }
        sample_mood_entries.append(entry)
    
    # Test pattern analysis
    result = ml_system.analyze_patterns(sample_mood_entries, [])
    
    if result['success']:
        patterns = result['patterns']
        print(f"✅ Pattern analysis successful!")
        print(f"   - Average mood: {patterns['average_mood']}")
        print(f"   - Total entries: {patterns['total_entries']}")
        print(f"   - Trend direction: {patterns['trend_direction']}")
        print(f"   - Most common emotions: {list(patterns['emotion_frequency'].keys())[:3]}")
        return True
    else:
        print(f"❌ Pattern analysis failed: {result['message']}")
        return False

def generate_model_report(ml_system, rec_system):
    """Generate a comprehensive model performance report"""
    print("\n📊 COMPREHENSIVE MODEL VALIDATION REPORT")
    print("=" * 60)
    
    # Model status
    print(f"🤖 Model Status:")
    print(f"   - ML System Trained: {ml_system.is_trained}")
    print(f"   - Mood Predictor: {'✅ Available' if ml_system.mood_predictor else '❌ Not Available'}")
    print(f"   - Sentiment Analyzer: {'✅ Available' if ml_system.sentiment_analyzer else '❌ Not Available'}")
    print(f"   - Vectorizer: {'✅ Available' if ml_system.vectorizer else '❌ Not Available'}")
    print(f"   - Scaler: {'✅ Available' if ml_system.scaler else '❌ Not Available'}")
    
    # Performance metrics
    print(f"\n📈 Performance Metrics:")
    sentiment_accuracy = validate_sentiment_analysis(ml_system)
    mood_accuracy = validate_mood_prediction(ml_system)
    validate_recommendations(rec_system)
    pattern_success = validate_pattern_analysis(ml_system)
    
    # Overall assessment
    print(f"\n🎯 Overall Assessment:")
    if sentiment_accuracy >= 0.8 and mood_accuracy >= 0.6 and pattern_success:
        print("   ✅ All systems are performing well!")
        status = "EXCELLENT"
    elif sentiment_accuracy >= 0.7 and mood_accuracy >= 0.5 and pattern_success:
        print("   ⚠️  Systems are performing adequately with room for improvement.")
        status = "GOOD"
    else:
        print("   ❌ Some systems need attention.")
        status = "NEEDS_IMPROVEMENT"
    
    print(f"\n🏆 Overall Status: {status}")
    
    # Recommendations for improvement
    print(f"\n💡 Recommendations for Improvement:")
    if sentiment_accuracy < 0.8:
        print("   - Consider fine-tuning sentiment analysis parameters")
    if mood_accuracy < 0.6:
        print("   - Collect more diverse training data for mood prediction")
        print("   - Consider feature engineering improvements")
    if not pattern_success:
        print("   - Check pattern analysis data format and processing")
    
    print("   - Continue collecting user data to improve model accuracy")
    print("   - Consider A/B testing different recommendation strategies")
    
    return {
        'status': status,
        'sentiment_accuracy': sentiment_accuracy,
        'mood_accuracy': mood_accuracy,
        'pattern_analysis': pattern_success,
        'models_trained': ml_system.is_trained
    }

if __name__ == "__main__":
    import random
    
    print("🧠 Mental Health Companion - Model Validation")
    print("=" * 60)
    
    # Initialize systems
    ml_system = MentalHealthML()
    rec_system = EnhancedMentalHealthRecommendations()
    
    # Run comprehensive validation
    report = generate_model_report(ml_system, rec_system)
    
    print(f"\n✅ Validation completed!")
    print(f"📋 Summary: {report['status']} performance across all systems")
