#!/usr/bin/env python3
"""
Sample Data Training Script for Mental Health Companion
This script generates comprehensive sample data and trains the ML models
"""

import json
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from app import MentalHealthML

def generate_sample_mood_entries(num_entries=50):
    """Generate realistic sample mood entries based on mental health patterns"""
    
    # Define emotion categories and their typical mood associations
    emotion_categories = {
        'positive': ['Happy', 'Excited', 'Grateful', 'Confident', 'Peaceful', 'Calm'],
        'negative': ['Sad', 'Anxious', 'Frustrated', 'Lonely', 'Overwhelmed', 'Angry'],
        'neutral': ['Calm', 'Peaceful', 'Content']
    }
    
    # Mood patterns based on research (1-10 scale)
    mood_patterns = {
        'weekend_morning': (6, 8),  # Generally better on weekends
        'weekend_evening': (5, 7),
        'weekday_morning': (4, 7),  # Work stress affects mornings
        'weekday_evening': (3, 6),  # End of work day can be stressful
        'monday': (3, 5),  # Monday blues
        'friday': (5, 8),  # TGIF effect
    }
    
    entries = []
    base_date = datetime.now() - timedelta(days=num_entries)
    
    for i in range(num_entries):
        # Create realistic date progression
        entry_date = base_date + timedelta(days=i, hours=random.randint(7, 22))
        
        # Determine mood based on day of week and time
        day_of_week = entry_date.weekday()
        hour = entry_date.hour
        is_weekend = day_of_week >= 5
        
        # Apply mood patterns
        if is_weekend:
            if hour < 12:
                mood_range = mood_patterns['weekend_morning']
            else:
                mood_range = mood_patterns['weekend_evening']
        else:
            if day_of_week == 0:  # Monday
                mood_range = mood_patterns['monday']
            elif day_of_week == 4:  # Friday
                mood_range = mood_patterns['friday']
            elif hour < 12:
                mood_range = mood_patterns['weekday_morning']
            else:
                mood_range = mood_patterns['weekday_evening']
        
        # Add some randomness and trends
        base_mood = random.uniform(mood_range[0], mood_range[1])
        
        # Add weekly patterns (some weeks are better than others)
        week_factor = 0.8 + 0.4 * np.sin(i / 7 * 2 * np.pi)
        mood = max(1, min(10, int(base_mood * week_factor)))
        
        # Select emotions based on mood
        if mood >= 7:
            emotion_pool = emotion_categories['positive'] + ['Excited', 'Grateful']
        elif mood <= 4:
            emotion_pool = emotion_categories['negative'] + ['Overwhelmed', 'Lonely']
        else:
            emotion_pool = emotion_categories['neutral'] + random.choice([emotion_categories['positive'], emotion_categories['negative']])
        
        # Select 1-3 emotions
        num_emotions = random.choices([1, 2, 3], weights=[0.3, 0.5, 0.2])[0]
        emotions = random.sample(emotion_pool, min(num_emotions, len(emotion_pool)))
        
        # Generate realistic notes based on mood and emotions
        notes = generate_realistic_note(mood, emotions, entry_date)
        
        entry = {
            'mood': mood,
            'emotions': emotions,
            'date': {
                'year': entry_date.year,
                'month': entry_date.month,
                'day': entry_date.day,
                'hour': entry_date.hour,
                'day_of_week': day_of_week
            },
            'note': notes
        }
        
        entries.append(entry)
    
    return entries

def generate_realistic_note(mood, emotions, date):
    """Generate realistic notes based on mood, emotions, and context"""
    
    # Context-based note starters
    time_context = {
        'morning': ['Started the day', 'This morning', 'Woke up feeling', 'Early morning'],
        'afternoon': ['This afternoon', 'During lunch', 'Midday', 'After work'],
        'evening': ['This evening', 'After dinner', 'End of day', 'Tonight']
    }
    
    # Mood-based note content
    mood_notes = {
        1: ['terrible', 'awful', 'worst day', 'completely overwhelmed', 'can\'t cope'],
        2: ['very bad', 'really struggling', 'exhausted', 'drained', 'hopeless'],
        3: ['bad', 'difficult', 'challenging', 'tough', 'hard'],
        4: ['not great', 'rough', 'struggling', 'down', 'low'],
        5: ['okay', 'neutral', 'average', 'fine', 'meh'],
        6: ['decent', 'good', 'better', 'improving', 'positive'],
        7: ['good', 'great', 'happy', 'content', 'satisfied'],
        8: ['very good', 'excellent', 'wonderful', 'amazing', 'fantastic'],
        9: ['incredible', 'outstanding', 'perfect', 'euphoric', 'blissful'],
        10: ['absolutely amazing', 'perfect', 'incredible', 'euphoric', 'blissful']
    }
    
    # Emotion-specific additions
    emotion_additions = {
        'Happy': ['smiling', 'laughing', 'joyful', 'cheerful'],
        'Sad': ['crying', 'tearful', 'melancholy', 'downhearted'],
        'Anxious': ['worried', 'nervous', 'stressed', 'uneasy'],
        'Excited': ['thrilled', 'pumped', 'energized', 'enthusiastic'],
        'Calm': ['relaxed', 'peaceful', 'serene', 'tranquil'],
        'Angry': ['furious', 'irritated', 'frustrated', 'annoyed'],
        'Grateful': ['thankful', 'appreciative', 'blessed', 'fortunate'],
        'Lonely': ['isolated', 'alone', 'disconnected', 'empty'],
        'Confident': ['assured', 'self-assured', 'capable', 'strong'],
        'Overwhelmed': ['swamped', 'buried', 'drowning', 'stressed'],
        'Peaceful': ['serene', 'calm', 'tranquil', 'zen'],
        'Frustrated': ['annoyed', 'irritated', 'exasperated', 'fed up']
    }
    
    # Determine time of day
    hour = date.hour
    if hour < 12:
        time_phrase = random.choice(time_context['morning'])
    elif hour < 18:
        time_phrase = random.choice(time_context['afternoon'])
    else:
        time_phrase = random.choice(time_context['evening'])
    
    # Build the note
    mood_phrase = random.choice(mood_notes.get(mood, mood_notes[5]))
    
    # Add emotion-specific content
    emotion_content = []
    for emotion in emotions:
        if emotion in emotion_additions:
            emotion_content.append(random.choice(emotion_additions[emotion]))
    
    # Combine into a realistic note
    if emotion_content:
        note = f"{time_phrase} feeling {mood_phrase}. {' '.join(emotion_content)}."
    else:
        note = f"{time_phrase} feeling {mood_phrase}."
    
    # Add some variety with additional context
    additional_context = [
        "Work was challenging today.",
        "Had a good conversation with a friend.",
        "Weather was nice.",
        "Feeling more energetic than usual.",
        "Struggling with some personal issues.",
        "Looking forward to the weekend.",
        "Need to take better care of myself.",
        "Grateful for the small things.",
        "Feeling more optimistic lately.",
        "Having trouble sleeping."
    ]
    
    if random.random() < 0.3:  # 30% chance of additional context
        note += " " + random.choice(additional_context)
    
    return note

def generate_sample_journal_entries(num_entries=30):
    """Generate sample journal entries with varying sentiment"""
    
    journal_templates = [
        "Today I {action} and it made me feel {emotion}. {reflection}",
        "I've been thinking about {topic} lately. {thoughts}",
        "This week has been {description}. {details}",
        "I'm grateful for {gratitude}. {elaboration}",
        "I'm struggling with {challenge}. {feelings}",
        "I accomplished {achievement} today. {satisfaction}",
        "I'm worried about {concern}. {anxiety}",
        "I feel {emotion} about {situation}. {explanation}",
        "I need to {need}. {reasoning}",
        "I'm proud of {pride}. {celebration}"
    ]
    
    actions = ['went for a walk', 'had coffee with a friend', 'completed a project', 'read a book', 'cooked dinner', 'called my family', 'exercised', 'meditated', 'listened to music', 'watched a movie']
    emotions = ['happy', 'content', 'grateful', 'peaceful', 'anxious', 'sad', 'frustrated', 'excited', 'calm', 'overwhelmed']
    topics = ['work-life balance', 'relationships', 'health', 'future plans', 'personal growth', 'family', 'career', 'hobbies', 'travel', 'self-care']
    descriptions = ['challenging', 'rewarding', 'stressful', 'peaceful', 'busy', 'relaxing', 'overwhelming', 'productive', 'difficult', 'enjoyable']
    
    entries = []
    base_date = datetime.now() - timedelta(days=num_entries)
    
    for i in range(num_entries):
        entry_date = base_date + timedelta(days=i)
        template = random.choice(journal_templates)
        
        # Fill in the template
        entry_text = template.format(
            action=random.choice(actions),
            emotion=random.choice(emotions),
            reflection="It reminded me of what's important in life.",
            topic=random.choice(topics),
            thoughts="I'm trying to understand my feelings better.",
            description=random.choice(descriptions),
            details="I'm learning to navigate these challenges.",
            gratitude="the support of my friends and family",
            elaboration="They mean everything to me.",
            challenge="managing my stress levels",
            feelings="I'm working on finding healthy coping strategies.",
            achievement="finishing my daily tasks",
            satisfaction="It feels good to be productive.",
            concern="upcoming deadlines",
            anxiety="I need to stay organized and focused.",
            situation="recent changes in my life",
            explanation="I'm adapting and growing through this experience.",
            need="to take better care of myself",
            reasoning="I've been neglecting my well-being lately.",
            pride="how I handled a difficult situation",
            celebration="I'm growing stronger every day."
        )
        
        entries.append({
            'date': entry_date.isoformat(),
            'content': entry_text,
            'mood': random.randint(1, 10)
        })
    
    return entries

def train_models_with_sample_data():
    """Train the ML models using generated sample data"""
    
    print("🧠 Mental Health Companion - Model Training")
    print("=" * 50)
    
    # Generate sample data
    print("📊 Generating sample data...")
    mood_entries = generate_sample_mood_entries(50)
    journal_entries = generate_sample_journal_entries(30)
    
    print(f"✅ Generated {len(mood_entries)} mood entries")
    print(f"✅ Generated {len(journal_entries)} journal entries")
    
    # Initialize ML system
    print("\n🤖 Initializing ML system...")
    ml_system = MentalHealthML()
    
    # Train mood predictor
    print("\n🎯 Training mood prediction model...")
    training_result = ml_system.train_mood_predictor(mood_entries)
    
    if training_result['success']:
        print(f"✅ Mood predictor trained successfully!")
        print(f"   - Training samples: {len(mood_entries)}")
        print(f"   - Accuracy: {training_result.get('accuracy', 'N/A')}")
    else:
        print(f"❌ Training failed: {training_result['message']}")
        return False
    
    # Test sentiment analysis
    print("\n💭 Testing sentiment analysis...")
    test_texts = [
        "I'm feeling great today!",
        "This is the worst day ever.",
        "I'm okay, nothing special.",
        "I'm so grateful for everything in my life.",
        "I'm really struggling with anxiety today."
    ]
    
    for text in test_texts:
        sentiment = ml_system.analyze_sentiment(text)
        print(f"   '{text[:30]}...' → {sentiment['sentiment']} (confidence: {sentiment['confidence']:.2f})")
    
    # Test mood prediction
    print("\n🎯 Testing mood prediction...")
    test_features = {
        'emotions': ['Happy', 'Excited'],
        'note': 'Feeling great today!',
        'time_context': {'hour': 14, 'day_of_week': 1}
    }
    
    # Convert features to array format expected by model
    feature_array = [
        len(test_features['emotions']),  # emotion_count
        1 if test_features['note'] else 0,  # has_note
        test_features['time_context']['hour'],  # hour
        test_features['time_context']['day_of_week'],  # day_of_week
        1 if test_features['time_context']['day_of_week'] in [5, 6] else 0,  # is_weekend
        # Emotion features (one-hot encoding)
        1 if 'Happy' in test_features['emotions'] else 0,
        1 if 'Sad' in test_features['emotions'] else 0,
        1 if 'Anxious' in test_features['emotions'] else 0,
        1 if 'Calm' in test_features['emotions'] else 0,
        1 if 'Excited' in test_features['emotions'] else 0,
        1 if 'Frustrated' in test_features['emotions'] else 0,
        1 if 'Grateful' in test_features['emotions'] else 0,
        1 if 'Lonely' in test_features['emotions'] else 0,
        1 if 'Confident' in test_features['emotions'] else 0,
        1 if 'Overwhelmed' in test_features['emotions'] else 0,
        1 if 'Peaceful' in test_features['emotions'] else 0,
        1 if 'Angry' in test_features['emotions'] else 0,
        # Note sentiment features
        0.8, 0.1, 0.1, 0.6, 0.4  # placeholder sentiment scores
    ]
    
    prediction = ml_system.predict_mood(feature_array)
    
    print(f"   Emotions: {test_features['emotions']}")
    print(f"   Note: '{test_features['note']}'")
    print(f"   Predicted mood: {prediction['predicted_mood']} (confidence: {prediction['confidence']:.2f})")
    
    # Test pattern analysis
    print("\n📈 Testing pattern analysis...")
    pattern_result = ml_system.analyze_patterns(mood_entries, journal_entries)
    
    if pattern_result['success']:
        patterns = pattern_result['patterns']
        print(f"   - Average mood: {patterns['average_mood']}")
        print(f"   - Total entries: {patterns['total_entries']}")
        print(f"   - Trend: {patterns['trend_direction']}")
        print(f"   - Most common emotions: {list(patterns['emotion_frequency'].keys())[:3]}")
    
    # Test recommendations
    print("\n💡 Testing recommendations...")
    recommendations = ml_system.get_recommendations(
        mood=4,
        emotions=['Anxious', 'Overwhelmed'],
        sentiment_data={'sentiment': 'negative', 'confidence': 0.8}
    )
    
    print(f"   Recommendations for mood 4 with anxiety:")
    for i, rec in enumerate(recommendations[:3], 1):
        print(f"   {i}. {rec}")
    
    print("\n🎉 Model training completed successfully!")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    success = train_models_with_sample_data()
    if success:
        print("\n✅ All models are now trained and ready to use!")
    else:
        print("\n❌ Training failed. Please check the error messages above.")
