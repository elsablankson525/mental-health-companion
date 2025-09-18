#!/usr/bin/env python3
"""
Enhanced Recommendations System for Mental Health Companion
Based on current mental health research and evidence-based practices
"""

class EnhancedMentalHealthRecommendations:
    """Enhanced recommendations system incorporating current mental health research"""
    
    def __init__(self):
        # Evidence-based recommendations based on 2024 mental health research
        self.recommendations = {
            'crisis_intervention': [
                "If you're having thoughts of self-harm, please contact the National Suicide Prevention Lifeline at 988",
                "Text HOME to 741741 for 24/7 crisis support via text",
                "Contact your local emergency services (911) if you're in immediate danger",
                "Reach out to a trusted friend, family member, or mental health professional immediately"
            ],
            'anxiety_management': [
                "Practice the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
                "Try box breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4",
                "Use progressive muscle relaxation, tensing and releasing each muscle group",
                "Limit caffeine intake and news consumption, especially before bed",
                "Practice mindfulness meditation for 10-15 minutes daily",
                "Create a worry time - set aside 15 minutes daily to address concerns",
                "Use the STOP technique: Stop, Take a breath, Observe, Proceed mindfully"
            ],
            'depression_support': [
                "Maintain a regular sleep schedule, even on weekends",
                "Get 30 minutes of natural sunlight daily, especially in the morning",
                "Engage in gentle physical activity like walking or stretching",
                "Practice gratitude by writing down 3 good things each day",
                "Connect with others, even if it's just a brief conversation",
                "Set small, achievable daily goals",
                "Consider professional help - therapy and medication can be very effective",
                "Limit social media use and focus on real-world connections"
            ],
            'stress_management': [
                "Practice time management using the Pomodoro Technique (25 min work, 5 min break)",
                "Learn to say no to additional commitments when you're overwhelmed",
                "Create a calming bedtime routine to improve sleep quality",
                "Use the 4-7-8 breathing technique: Inhale 4, hold 7, exhale 8",
                "Take regular breaks throughout the day, even if just for 2-3 minutes",
                "Practice yoga or tai chi for gentle movement and mindfulness",
                "Keep a stress journal to identify patterns and triggers"
            ],
            'mood_enhancement': [
                "Listen to uplifting music or nature sounds",
                "Spend time in nature, even if it's just a local park",
                "Engage in creative activities like drawing, writing, or crafting",
                "Practice acts of kindness - helping others boosts your own mood",
                "Watch funny videos or read humorous content",
                "Dance or move your body to music you enjoy",
                "Plan something to look forward to, even if it's small"
            ],
            'sleep_improvement': [
                "Maintain a consistent sleep schedule, even on weekends",
                "Create a cool, dark, quiet sleep environment",
                "Avoid screens 1 hour before bedtime",
                "Use blue light blocking glasses if you must use screens",
                "Practice relaxation techniques before bed",
                "Avoid large meals, caffeine, and alcohol close to bedtime",
                "Keep your bedroom only for sleep and intimacy"
            ],
            'social_connection': [
                "Reach out to one person today, even if it's just a text",
                "Join a group or club related to your interests",
                "Volunteer for a cause you care about",
                "Schedule regular check-ins with friends and family",
                "Consider joining online communities with shared interests",
                "Practice active listening when talking with others",
                "Share your feelings with someone you trust"
            ],
            'self_care': [
                "Take a warm bath or shower with calming scents",
                "Practice self-compassion - treat yourself as you would a good friend",
                "Engage in hobbies or activities you used to enjoy",
                "Set boundaries with work and social obligations",
                "Take mental health days when needed",
                "Practice positive self-talk and challenge negative thoughts",
                "Create a self-care routine that works for your schedule"
            ]
        }
        
        # Mood-based recommendation triggers
        self.mood_triggers = {
            'very_low': (1, 3),  # Crisis intervention + depression support
            'low': (4, 5),       # Depression support + mood enhancement
            'moderate': (6, 7),   # Stress management + self-care
            'high': (8, 10)      # Mood enhancement + social connection
        }
        
        # Emotion-based recommendation mapping
        self.emotion_mapping = {
            'Anxious': 'anxiety_management',
            'Sad': 'depression_support',
            'Overwhelmed': 'stress_management',
            'Lonely': 'social_connection',
            'Angry': 'stress_management',
            'Frustrated': 'stress_management',
            'Happy': 'mood_enhancement',
            'Excited': 'mood_enhancement',
            'Calm': 'self_care',
            'Peaceful': 'self_care',
            'Grateful': 'mood_enhancement',
            'Confident': 'mood_enhancement'
        }
    
    def get_recommendations(self, mood, emotions, sentiment_data=None, time_context=None):
        """Get personalized recommendations based on mood, emotions, and context"""
        recommendations = []
        
        # Determine mood category
        mood_category = None
        for category, (min_mood, max_mood) in self.mood_triggers.items():
            if min_mood <= mood <= max_mood:
                mood_category = category
                break
        
        # Add crisis intervention for very low moods
        if mood_category == 'very_low':
            recommendations.extend(self.recommendations['crisis_intervention'])
        
        # Add mood-based recommendations
        if mood_category == 'very_low':
            recommendations.extend(self.recommendations['depression_support'])
        elif mood_category == 'low':
            recommendations.extend(self.recommendations['depression_support'])
            recommendations.extend(self.recommendations['mood_enhancement'])
        elif mood_category == 'moderate':
            recommendations.extend(self.recommendations['stress_management'])
            recommendations.extend(self.recommendations['self_care'])
        else:  # high mood
            recommendations.extend(self.recommendations['mood_enhancement'])
            recommendations.extend(self.recommendations['social_connection'])
        
        # Add emotion-specific recommendations
        for emotion in emotions:
            if emotion in self.emotion_mapping:
                category = self.emotion_mapping[emotion]
                recommendations.extend(self.recommendations[category])
        
        # Add time-based recommendations
        if time_context:
            hour = time_context.get('hour', 12)
            if hour < 8:  # Early morning
                recommendations.extend([
                    "Start your day with a few minutes of gentle stretching",
                    "Eat a nutritious breakfast to fuel your day",
                    "Set a positive intention for the day ahead"
                ])
            elif hour > 20:  # Evening
                recommendations.extend([
                    "Create a relaxing bedtime routine",
                    "Reflect on three good things that happened today",
                    "Avoid screens for better sleep quality"
                ])
        
        # Add sentiment-based recommendations
        if sentiment_data and sentiment_data.get('sentiment') == 'negative':
            recommendations.extend([
                "Challenge negative thoughts with evidence",
                "Practice self-compassion and kindness",
                "Consider talking to a mental health professional"
            ])
        
        # Add sleep recommendations if it's late
        if time_context and time_context.get('hour', 12) > 22:
            recommendations.extend(self.recommendations['sleep_improvement'])
        
        # Remove duplicates and limit to top recommendations
        unique_recommendations = list(dict.fromkeys(recommendations))
        return unique_recommendations[:8]  # Return top 8 recommendations
    
    def get_evidence_based_tips(self):
        """Get evidence-based mental health tips based on current research"""
        return [
            "Regular exercise can be as effective as medication for mild to moderate depression",
            "Social connection is one of the strongest predictors of mental health and longevity",
            "Sleep quality directly impacts mood, anxiety, and cognitive function",
            "Mindfulness meditation has been shown to reduce anxiety and improve emotional regulation",
            "Exposure to natural light helps regulate circadian rhythms and improve mood",
            "Gratitude practice can increase happiness and life satisfaction",
            "Professional therapy is most effective when combined with self-care practices",
            "Setting small, achievable goals can build confidence and motivation"
        ]
    
    def get_crisis_resources(self):
        """Get crisis intervention resources"""
        return {
            'national_suicide_prevention_lifeline': {
                'phone': '988',
                'description': '24/7 crisis support and suicide prevention',
                'available': 'Always'
            },
            'crisis_text_line': {
                'text': 'HOME to 741741',
                'description': '24/7 crisis support via text message',
                'available': 'Always'
            },
            'emergency_services': {
                'phone': '911',
                'description': 'For immediate life-threatening emergencies',
                'available': 'Always'
            },
            'mental_health_america': {
                'website': 'mhanational.org',
                'description': 'Resources and screening tools',
                'available': 'Online 24/7'
            }
        }

# Test the enhanced recommendations system
if __name__ == "__main__":
    rec_system = EnhancedMentalHealthRecommendations()
    
    print("🧠 Enhanced Mental Health Recommendations System")
    print("=" * 60)
    
    # Test different scenarios
    test_cases = [
        {
            'mood': 2,
            'emotions': ['Sad', 'Lonely'],
            'sentiment_data': {'sentiment': 'negative', 'confidence': 0.8},
            'time_context': {'hour': 14, 'day_of_week': 1}
        },
        {
            'mood': 6,
            'emotions': ['Anxious', 'Overwhelmed'],
            'sentiment_data': {'sentiment': 'negative', 'confidence': 0.6},
            'time_context': {'hour': 9, 'day_of_week': 2}
        },
        {
            'mood': 8,
            'emotions': ['Happy', 'Excited'],
            'sentiment_data': {'sentiment': 'positive', 'confidence': 0.7},
            'time_context': {'hour': 19, 'day_of_week': 5}
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}:")
        print(f"   Mood: {case['mood']}, Emotions: {case['emotions']}")
        print(f"   Sentiment: {case['sentiment_data']['sentiment']}")
        
        recommendations = rec_system.get_recommendations(
            case['mood'],
            case['emotions'],
            case['sentiment_data'],
            case['time_context']
        )
        
        print(f"   Recommendations:")
        for j, rec in enumerate(recommendations[:5], 1):
            print(f"   {j}. {rec}")
    
    print(f"\n💡 Evidence-Based Tips:")
    tips = rec_system.get_evidence_based_tips()
    for i, tip in enumerate(tips[:3], 1):
        print(f"   {i}. {tip}")
    
    print(f"\n🚨 Crisis Resources:")
    resources = rec_system.get_crisis_resources()
    for name, info in resources.items():
        print(f"   {name.replace('_', ' ').title()}: {info['phone'] if 'phone' in info else info['text'] if 'text' in info else info['website']}")
