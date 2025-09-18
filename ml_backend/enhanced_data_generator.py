#!/usr/bin/env python3
"""
Enhanced Data Generator for Mental Health Companion
Generates diverse, realistic training data based on mental health research
"""

import json
import random
import numpy as np
from datetime import datetime, timedelta
import pandas as pd

class EnhancedDataGenerator:
    """Generates diverse mental health data based on research patterns"""
    
    def __init__(self):
        # Mental health patterns based on research
        self.demographics = {
            'age_groups': ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
            'genders': ['male', 'female', 'non-binary', 'prefer_not_to_say'],
            'occupations': ['student', 'professional', 'retired', 'unemployed', 'freelancer'],
            'living_situations': ['alone', 'with_family', 'with_roommates', 'with_partner']
        }
        
        # Seasonal and temporal patterns
        self.seasonal_patterns = {
            'winter': {'mood_modifier': -0.5, 'anxiety_increase': 0.3},
            'spring': {'mood_modifier': 0.3, 'anxiety_increase': 0.1},
            'summer': {'mood_modifier': 0.5, 'anxiety_increase': -0.1},
            'fall': {'mood_modifier': -0.2, 'anxiety_increase': 0.2}
        }
        
        # Life events that affect mood
        self.life_events = {
            'positive': ['job_promotion', 'new_relationship', 'graduation', 'birthday', 'vacation'],
            'negative': ['job_loss', 'breakup', 'illness', 'family_conflict', 'financial_stress'],
            'neutral': ['moving', 'new_job', 'routine_change', 'weather_change']
        }
        
        # Mental health conditions and their patterns
        self.condition_patterns = {
            'depression': {
                'mood_range': (1, 5),
                'common_emotions': ['Sad', 'Lonely', 'Overwhelmed'],
                'daily_pattern': 'morning_low',
                'seasonal_effect': 'winter_worse'
            },
            'anxiety': {
                'mood_range': (3, 7),
                'common_emotions': ['Anxious', 'Overwhelmed', 'Frustrated'],
                'daily_pattern': 'evening_worse',
                'seasonal_effect': 'spring_worse'
            },
            'bipolar': {
                'mood_range': (1, 10),
                'common_emotions': ['Excited', 'Sad', 'Overwhelmed'],
                'daily_pattern': 'variable',
                'seasonal_effect': 'spring_mania'
            },
            'ptsd': {
                'mood_range': (2, 6),
                'common_emotions': ['Anxious', 'Angry', 'Overwhelmed'],
                'daily_pattern': 'night_worse',
                'seasonal_effect': 'anniversary_effect'
            }
        }
    
    def generate_diverse_mood_entries(self, num_entries=200, include_conditions=True):
        """Generate diverse mood entries with various mental health patterns"""
        entries = []
        base_date = datetime.now() - timedelta(days=num_entries)
        
        # Create user profiles with different characteristics
        user_profiles = self._create_user_profiles(10)
        
        for i in range(num_entries):
            # Select a random user profile
            profile = random.choice(user_profiles)
            entry_date = base_date + timedelta(days=i, hours=random.randint(6, 23))
            
            # Generate mood based on profile and context
            mood_entry = self._generate_mood_entry(profile, entry_date, i)
            entries.append(mood_entry)
        
        return entries
    
    def _create_user_profiles(self, num_profiles):
        """Create diverse user profiles with different mental health patterns"""
        profiles = []
        
        for i in range(num_profiles):
            profile = {
                'age_group': random.choice(self.demographics['age_groups']),
                'gender': random.choice(self.demographics['genders']),
                'occupation': random.choice(self.demographics['occupations']),
                'living_situation': random.choice(self.demographics['living_situations']),
                'has_condition': random.random() < 0.3,  # 30% have mental health conditions
                'condition': None,
                'personality_traits': self._generate_personality_traits(),
                'life_stress_level': random.uniform(0.1, 0.9),
                'social_support': random.uniform(0.2, 1.0)
            }
            
            if profile['has_condition']:
                profile['condition'] = random.choice(list(self.condition_patterns.keys()))
            
            profiles.append(profile)
        
        return profiles
    
    def _generate_personality_traits(self):
        """Generate personality traits that affect mood patterns"""
        return {
            'neuroticism': random.uniform(0, 1),
            'extraversion': random.uniform(0, 1),
            'conscientiousness': random.uniform(0, 1),
            'agreeableness': random.uniform(0, 1),
            'openness': random.uniform(0, 1)
        }
    
    def _generate_mood_entry(self, profile, entry_date, day_index):
        """Generate a single mood entry based on profile and context"""
        # Base mood calculation
        base_mood = self._calculate_base_mood(profile, entry_date, day_index)
        
        # Apply seasonal effects
        season = self._get_season(entry_date)
        seasonal_modifier = self.seasonal_patterns[season]['mood_modifier']
        base_mood += seasonal_modifier
        
        # Apply life events
        life_event_modifier = self._get_life_event_modifier(profile, day_index)
        base_mood += life_event_modifier
        
        # Apply daily patterns
        daily_modifier = self._get_daily_modifier(profile, entry_date)
        base_mood += daily_modifier
        
        # Apply random variation
        random_variation = random.uniform(-1, 1)
        base_mood += random_variation
        
        # Ensure mood is within 1-10 range
        mood = max(1, min(10, int(round(base_mood))))
        
        # Generate emotions based on mood and profile
        emotions = self._generate_emotions(mood, profile, entry_date)
        
        # Generate note based on mood, emotions, and context
        note = self._generate_contextual_note(mood, emotions, profile, entry_date)
        
        # Generate additional context
        context = self._generate_context(profile, entry_date, mood)
        
        return {
            'mood': mood,
            'emotions': emotions,
            'date': {
                'year': entry_date.year,
                'month': entry_date.month,
                'day': entry_date.day,
                'hour': entry_date.hour,
                'day_of_week': entry_date.weekday(),
                'is_weekend': entry_date.weekday() >= 5
            },
            'note': note,
            'context': context,
            'profile': {
                'age_group': profile['age_group'],
                'has_condition': profile['has_condition'],
                'condition': profile['condition'],
                'life_stress_level': profile['life_stress_level'],
                'social_support': profile['social_support']
            }
        }
    
    def _calculate_base_mood(self, profile, entry_date, day_index):
        """Calculate base mood based on profile characteristics"""
        base_mood = 5.0  # Neutral starting point
        
        # Age effects
        age_group = profile['age_group']
        if age_group in ['18-25', '26-35']:
            base_mood += random.uniform(-0.5, 0.5)  # More variable
        elif age_group in ['56-65', '65+']:
            base_mood += random.uniform(-0.3, 0.3)  # More stable
        
        # Occupation effects
        occupation = profile['occupation']
        if occupation == 'student':
            base_mood += random.uniform(-1, 1)  # High variability
        elif occupation == 'retired':
            base_mood += random.uniform(-0.5, 0.5)  # Moderate variability
        
        # Living situation effects
        if profile['living_situation'] == 'alone':
            base_mood -= 0.3
        elif profile['living_situation'] == 'with_partner':
            base_mood += 0.2
        
        # Mental health condition effects
        if profile['has_condition'] and profile['condition']:
            condition = self.condition_patterns[profile['condition']]
            min_mood, max_mood = condition['mood_range']
            base_mood = random.uniform(min_mood, max_mood)
        
        # Life stress effects
        stress_level = profile['life_stress_level']
        base_mood -= stress_level * 2  # Higher stress = lower mood
        
        # Social support effects
        social_support = profile['social_support']
        base_mood += social_support * 1.5  # Higher support = higher mood
        
        return base_mood
    
    def _get_season(self, date):
        """Determine season based on date"""
        month = date.month
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:
            return 'fall'
    
    def _get_life_event_modifier(self, profile, day_index):
        """Get mood modifier from life events"""
        # Life events occur randomly
        if random.random() < 0.1:  # 10% chance of life event
            event_type = random.choice(['positive', 'negative', 'neutral'])
            if event_type == 'positive':
                return random.uniform(1, 3)
            elif event_type == 'negative':
                return random.uniform(-3, -1)
            else:
                return random.uniform(-0.5, 0.5)
        return 0
    
    def _get_daily_modifier(self, profile, entry_date):
        """Get daily pattern modifier"""
        hour = entry_date.hour
        day_of_week = entry_date.weekday()
        
        # Weekend effect
        if day_of_week >= 5:  # Weekend
            return random.uniform(0, 1)
        
        # Time of day effects
        if hour < 8:  # Early morning
            return random.uniform(-1, 0)
        elif hour < 12:  # Morning
            return random.uniform(-0.5, 0.5)
        elif hour < 18:  # Afternoon
            return random.uniform(0, 0.5)
        else:  # Evening
            return random.uniform(-0.5, 0)
    
    def _generate_emotions(self, mood, profile, entry_date):
        """Generate emotions based on mood and profile"""
        if profile['has_condition'] and profile['condition']:
            condition = self.condition_patterns[profile['condition']]
            emotion_pool = condition['common_emotions']
        else:
            # Standard emotion mapping based on mood
            if mood >= 8:
                emotion_pool = ['Happy', 'Excited', 'Grateful', 'Confident']
            elif mood >= 6:
                emotion_pool = ['Happy', 'Calm', 'Peaceful', 'Grateful']
            elif mood >= 4:
                emotion_pool = ['Calm', 'Peaceful', 'Sad', 'Anxious']
            else:
                emotion_pool = ['Sad', 'Lonely', 'Overwhelmed', 'Anxious']
        
        # Select 1-3 emotions
        num_emotions = random.choices([1, 2, 3], weights=[0.3, 0.5, 0.2])[0]
        return random.sample(emotion_pool, min(num_emotions, len(emotion_pool)))
    
    def _generate_contextual_note(self, mood, emotions, profile, entry_date):
        """Generate contextual note based on mood, emotions, and profile"""
        # Base note templates
        note_templates = {
            'high_mood': [
                "Feeling {emotion} today! {context}",
                "Great day! {activity} and feeling {emotion}",
                "So grateful for {gratitude}. Feeling {emotion}!"
            ],
            'medium_mood': [
                "Having a {adjective} day. {context}",
                "Feeling {emotion} about {situation}",
                "Today was {adjective}. {reflection}"
            ],
            'low_mood': [
                "Struggling with {challenge} today. Feeling {emotion}",
                "Having a tough day. {context}",
                "Feeling {emotion} and {emotion2}. {support}"
            ]
        }
        
        # Select template based on mood
        if mood >= 7:
            template = random.choice(note_templates['high_mood'])
        elif mood >= 4:
            template = random.choice(note_templates['medium_mood'])
        else:
            template = random.choice(note_templates['low_mood'])
        
        # Fill in template
        note = self._fill_note_template(template, mood, emotions, profile, entry_date)
        return note
    
    def _fill_note_template(self, template, mood, emotions, profile, entry_date):
        """Fill in note template with contextual information"""
        # Contextual information
        activities = ['went for a walk', 'had coffee with a friend', 'worked on a project', 'read a book', 'cooked dinner']
        situations = ['work', 'relationships', 'health', 'future plans', 'family']
        challenges = ['stress', 'anxiety', 'loneliness', 'work pressure', 'family issues']
        gratitudes = ['my friends', 'good health', 'a roof over my head', 'my family', 'small joys']
        
        # Fill template
        note = template.format(
            emotion=random.choice(emotions).lower(),
            emotion2=random.choice(emotions).lower() if len(emotions) > 1 else 'tired',
            context=random.choice([
                f"Work was {random.choice(['challenging', 'productive', 'stressful'])}",
                f"Spent time {random.choice(activities)}",
                f"Thinking about {random.choice(situations)}"
            ]),
            activity=random.choice(activities),
            adjective=random.choice(['okay', 'decent', 'average', 'fine', 'tough', 'challenging']),
            situation=random.choice(situations),
            reflection=random.choice([
                "Trying to stay positive",
                "Working through some feelings",
                "Taking it one day at a time"
            ]),
            challenge=random.choice(challenges),
            support=random.choice([
                "Trying to reach out for help",
                "Taking care of myself",
                "One day at a time"
            ]),
            gratitude=random.choice(gratitudes)
        )
        
        return note
    
    def _generate_context(self, profile, entry_date, mood):
        """Generate additional context for the mood entry"""
        return {
            'weather': random.choice(['sunny', 'cloudy', 'rainy', 'snowy']),
            'sleep_quality': random.uniform(0, 1),
            'exercise_today': random.random() < 0.3,
            'social_interaction': random.random() < 0.7,
            'work_stress': random.uniform(0, 1),
            'medication_taken': profile['has_condition'] and random.random() < 0.8,
            'therapy_session': profile['has_condition'] and random.random() < 0.1,
            'crisis_thoughts': mood <= 3 and random.random() < 0.2
        }
    
    def generate_journal_entries(self, num_entries=100):
        """Generate diverse journal entries with varying sentiment and topics"""
        entries = []
        base_date = datetime.now() - timedelta(days=num_entries)
        
        journal_topics = [
            'daily_reflection', 'work_stress', 'relationships', 'health_concerns',
            'future_plans', 'gratitude', 'anxiety_episode', 'depression_episode',
            'social_interaction', 'hobby_activity', 'family_time', 'self_care',
            'therapy_session', 'medication_side_effects', 'sleep_issues'
        ]
        
        for i in range(num_entries):
            entry_date = base_date + timedelta(days=i)
            topic = random.choice(journal_topics)
            
            entry = self._generate_journal_entry(topic, entry_date)
            entries.append(entry)
        
        return entries
    
    def _generate_journal_entry(self, topic, entry_date):
        """Generate a single journal entry based on topic"""
        entry_templates = {
            'daily_reflection': [
                "Today I {action} and it made me feel {emotion}. {reflection}",
                "Reflecting on today, I {observation}. {insight}",
                "This day was {adjective}. {details}"
            ],
            'work_stress': [
                "Work has been {adjective} lately. {specific_issue}",
                "Feeling {emotion} about {work_situation}. {coping_strategy}",
                "The pressure at work is {intensity}. {response}"
            ],
            'relationships': [
                "My relationship with {person} is {status}. {details}",
                "Feeling {emotion} about {relationship_situation}. {thoughts}",
                "Had a {adjective} conversation with {person}. {outcome}"
            ],
            'gratitude': [
                "Today I'm grateful for {gratitude_item}. {elaboration}",
                "Feeling thankful for {blessing}. {reflection}",
                "Grateful for {positive_thing} in my life. {appreciation}"
            ],
            'anxiety_episode': [
                "Having an anxiety episode. {symptoms} {coping_attempts}",
                "Feeling anxious about {trigger}. {response}",
                "My anxiety is {intensity} today. {management_strategy}"
            ],
            'depression_episode': [
                "Struggling with depression today. {symptoms} {support_seeking}",
                "Feeling {emotion} and {emotion2}. {coping_efforts}",
                "Depression is {intensity} today. {self_care_attempts}"
            ]
        }
        
        template = random.choice(entry_templates.get(topic, entry_templates['daily_reflection']))
        
        # Fill template with contextual information
        content = self._fill_journal_template(template, topic)
        
        return {
            'date': entry_date.isoformat(),
            'content': content,
            'topic': topic,
            'mood': random.randint(1, 10),
            'sentiment': self._estimate_sentiment(content)
        }
    
    def _fill_journal_template(self, template, topic):
        """Fill journal template with contextual information"""
        # Contextual data for different topics
        context_data = {
            'action': ['went for a walk', 'had a conversation', 'completed a task', 'tried something new'],
            'emotion': ['happy', 'sad', 'anxious', 'grateful', 'frustrated', 'peaceful'],
            'reflection': ['I learned something about myself', 'It reminded me of what matters', 'I need to work on this'],
            'observation': ['noticed some patterns', 'felt more aware', 'saw things differently'],
            'insight': ['This helps me understand myself better', 'I am growing through this', 'There is hope in this'],
            'adjective': ['challenging', 'rewarding', 'difficult', 'enlightening', 'tough', 'meaningful'],
            'details': ['I am working through it', 'Taking it one step at a time', 'Learning to cope better'],
            'specific_issue': ['The workload is overwhelming', 'My boss is being difficult', 'I feel undervalued'],
            'coping_strategy': ['I am trying to set boundaries', 'Taking breaks when needed', 'Talking to HR'],
            'intensity': ['overwhelming', 'manageable', 'intense', 'moderate'],
            'response': ['I am trying to stay calm', 'Taking deep breaths', 'Reaching out for support'],
            'person': ['my partner', 'my friend', 'my family member', 'my colleague'],
            'status': ['complicated', 'good', 'strained', 'improving'],
            'relationship_situation': ['a recent argument', 'a misunderstanding', 'a celebration', 'a difficult conversation'],
            'thoughts': ['I need to communicate better', 'This is worth working on', 'I am not sure what to do'],
            'outcome': ['We resolved it', 'We agreed to disagree', 'We need more time', 'It brought us closer'],
            'gratitude_item': ['my health', 'my family', 'a good friend', 'a small kindness'],
            'elaboration': ['It reminds me what matters', 'I am blessed to have this', 'This gives me hope'],
            'blessing': ['good health', 'loving relationships', 'a roof over my head', 'inner strength'],
            'appreciation': ['I do not take this for granted', 'This means everything', 'I am so fortunate'],
            'symptoms': ['My heart is racing', 'I cannot stop worrying', 'I feel on edge'],
            'coping_attempts': ['I am trying deep breathing', 'I called a friend', 'I went for a walk'],
            'trigger': ['work deadlines', 'social situations', 'uncertainty', 'conflict'],
            'management_strategy': ['I am using my coping skills', 'I am being gentle with myself', 'I am seeking support'],
            'support_seeking': ['I reached out to a friend', 'I am considering therapy', 'I am talking to my doctor'],
            'coping_efforts': ['I am trying to be kind to myself', 'I am reaching out for help', 'I am taking it one day at a time'],
            'self_care_attempts': ['I am trying to rest', 'I am eating regularly', 'I am getting some fresh air']
        }
        
        # Fill template with random context data
        filled_template = template
        for key, values in context_data.items():
            if f'{{{key}}}' in filled_template:
                filled_template = filled_template.replace(f'{{{key}}}', random.choice(values))
        
        return filled_template
    
    def _estimate_sentiment(self, content):
        """Estimate sentiment of journal content"""
        positive_words = ['happy', 'grateful', 'good', 'great', 'wonderful', 'blessed', 'lucky', 'joy', 'love']
        negative_words = ['sad', 'anxious', 'worried', 'stressed', 'depressed', 'lonely', 'angry', 'frustrated', 'overwhelmed']
        
        content_lower = content.lower()
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

def generate_enhanced_dataset():
    """Generate a comprehensive enhanced dataset"""
    print("🧠 Generating Enhanced Mental Health Dataset")
    print("=" * 50)
    
    generator = EnhancedDataGenerator()
    
    # Generate diverse mood entries
    print("📊 Generating diverse mood entries...")
    mood_entries = generator.generate_diverse_mood_entries(200, include_conditions=True)
    print(f"✅ Generated {len(mood_entries)} mood entries")
    
    # Generate journal entries
    print("📝 Generating journal entries...")
    journal_entries = generator.generate_journal_entries(100)
    print(f"✅ Generated {len(journal_entries)} journal entries")
    
    # Save dataset
    dataset = {
        'mood_entries': mood_entries,
        'journal_entries': journal_entries,
        'generated_at': datetime.now().isoformat(),
        'total_entries': len(mood_entries) + len(journal_entries)
    }
    
    with open('enhanced_dataset.json', 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"💾 Dataset saved to enhanced_dataset.json")
    print(f"📈 Total entries: {dataset['total_entries']}")
    
    # Analyze dataset diversity
    print(f"\n📊 Dataset Analysis:")
    mood_values = [entry['mood'] for entry in mood_entries]
    print(f"   - Mood range: {min(mood_values)} - {max(mood_values)}")
    print(f"   - Average mood: {np.mean(mood_values):.2f}")
    
    # Count conditions
    conditions = [entry['profile']['condition'] for entry in mood_entries if entry['profile']['has_condition']]
    condition_counts = {condition: conditions.count(condition) for condition in set(conditions)}
    print(f"   - Mental health conditions: {condition_counts}")
    
    # Count emotions
    all_emotions = []
    for entry in mood_entries:
        all_emotions.extend(entry['emotions'])
    emotion_counts = {emotion: all_emotions.count(emotion) for emotion in set(all_emotions)}
    print(f"   - Most common emotions: {sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]}")
    
    return dataset

if __name__ == "__main__":
    dataset = generate_enhanced_dataset()
    print("\n🎉 Enhanced dataset generation completed!")
