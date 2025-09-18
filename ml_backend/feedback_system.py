#!/usr/bin/env python3
"""
User Feedback System for Mental Health Companion
Implements feedback loops to improve recommendations and model performance
"""

import json
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict, deque
import sqlite3
import os

class FeedbackSystem:
    """User feedback system for continuous improvement"""
    
    def __init__(self, db_path="feedback.db"):
        self.db_path = db_path
        self.init_database()
        
        # Feedback tracking
        self.feedback_history = deque(maxlen=1000)  # Keep last 1000 feedback entries
        self.recommendation_performance = defaultdict(list)
        self.user_preferences = defaultdict(dict)
        
        # Learning parameters
        self.learning_rate = 0.1
        self.min_feedback_samples = 5
        self.feedback_weights = {
            'helpful': 1.0,
            'not_helpful': -0.5,
            'irrelevant': -0.8,
            'inappropriate': -1.0
        }
    
    def init_database(self):
        """Initialize feedback database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create feedback table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                recommendation_id TEXT,
                feedback_type TEXT,
                rating INTEGER,
                comment TEXT,
                timestamp DATETIME,
                context TEXT
            )
        ''')
        
        # Create recommendation performance table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recommendation_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recommendation_type TEXT,
                recommendation_text TEXT,
                total_feedback INTEGER,
                positive_feedback INTEGER,
                negative_feedback INTEGER,
                avg_rating REAL,
                last_updated DATETIME
            )
        ''')
        
        # Create user preferences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                preferred_categories TEXT,
                avoided_categories TEXT,
                feedback_threshold REAL,
                last_updated DATETIME
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def record_feedback(self, user_id, recommendation_id, feedback_type, rating=None, comment=None, context=None):
        """Record user feedback for a recommendation"""
        feedback_entry = {
            'user_id': user_id,
            'recommendation_id': recommendation_id,
            'feedback_type': feedback_type,
            'rating': rating,
            'comment': comment,
            'context': context,
            'timestamp': datetime.now()
        }
        
        # Store in memory
        self.feedback_history.append(feedback_entry)
        
        # Store in database
        self._store_feedback_db(feedback_entry)
        
        # Update recommendation performance
        self._update_recommendation_performance(recommendation_id, feedback_type, rating)
        
        # Update user preferences
        self._update_user_preferences(user_id, feedback_type, context)
        
        return True
    
    def _store_feedback_db(self, feedback_entry):
        """Store feedback in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO feedback (user_id, recommendation_id, feedback_type, rating, comment, timestamp, context)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            feedback_entry['user_id'],
            feedback_entry['recommendation_id'],
            feedback_entry['feedback_type'],
            feedback_entry['rating'],
            feedback_entry['comment'],
            feedback_entry['timestamp'].isoformat(),
            json.dumps(feedback_entry['context']) if feedback_entry['context'] else None
        ))
        
        conn.commit()
        conn.close()
    
    def _update_recommendation_performance(self, recommendation_id, feedback_type, rating):
        """Update recommendation performance metrics"""
        # Parse recommendation ID to get type and text
        rec_type, rec_text = self._parse_recommendation_id(recommendation_id)
        
        if rec_type not in self.recommendation_performance:
            self.recommendation_performance[rec_type] = []
        
        # Calculate feedback score
        feedback_score = self.feedback_weights.get(feedback_type, 0)
        if rating is not None:
            feedback_score = (rating - 3) / 2  # Convert 1-5 rating to -1 to 1 scale
        
        self.recommendation_performance[rec_type].append({
            'text': rec_text,
            'score': feedback_score,
            'timestamp': datetime.now()
        })
        
        # Update database
        self._update_recommendation_performance_db(rec_type, rec_text, feedback_score)
    
    def _parse_recommendation_id(self, recommendation_id):
        """Parse recommendation ID to extract type and text"""
        # Simple parsing - in practice, this would be more sophisticated
        parts = recommendation_id.split('_', 1)
        if len(parts) == 2:
            return parts[0], parts[1]
        return 'general', recommendation_id
    
    def _update_recommendation_performance_db(self, rec_type, rec_text, feedback_score):
        """Update recommendation performance in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if recommendation exists
        cursor.execute('''
            SELECT id, total_feedback, positive_feedback, negative_feedback, avg_rating
            FROM recommendation_performance
            WHERE recommendation_type = ? AND recommendation_text = ?
        ''', (rec_type, rec_text))
        
        result = cursor.fetchone()
        
        if result:
            # Update existing record
            rec_id, total, positive, negative, avg_rating = result
            total += 1
            if feedback_score > 0:
                positive += 1
            elif feedback_score < 0:
                negative += 1
            
            new_avg = ((avg_rating * (total - 1)) + feedback_score) / total
            
            cursor.execute('''
                UPDATE recommendation_performance
                SET total_feedback = ?, positive_feedback = ?, negative_feedback = ?, 
                    avg_rating = ?, last_updated = ?
                WHERE id = ?
            ''', (total, positive, negative, new_avg, datetime.now().isoformat(), rec_id))
        else:
            # Create new record
            positive = 1 if feedback_score > 0 else 0
            negative = 1 if feedback_score < 0 else 0
            
            cursor.execute('''
                INSERT INTO recommendation_performance
                (recommendation_type, recommendation_text, total_feedback, positive_feedback, 
                 negative_feedback, avg_rating, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (rec_type, rec_text, 1, positive, negative, feedback_score, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def _update_user_preferences(self, user_id, feedback_type, context):
        """Update user preferences based on feedback"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                'preferred_categories': [],
                'avoided_categories': [],
                'feedback_threshold': 0.5
            }
        
        # Extract category from context if available
        if context and 'category' in context:
            category = context['category']
            
            if feedback_type in ['helpful', 'very_helpful']:
                if category not in self.user_preferences[user_id]['preferred_categories']:
                    self.user_preferences[user_id]['preferred_categories'].append(category)
            elif feedback_type in ['not_helpful', 'irrelevant', 'inappropriate']:
                if category not in self.user_preferences[user_id]['avoided_categories']:
                    self.user_preferences[user_id]['avoided_categories'].append(category)
        
        # Update database
        self._update_user_preferences_db(user_id)
    
    def _update_user_preferences_db(self, user_id):
        """Update user preferences in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        prefs = self.user_preferences[user_id]
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_preferences
            (user_id, preferred_categories, avoided_categories, feedback_threshold, last_updated)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            json.dumps(prefs['preferred_categories']),
            json.dumps(prefs['avoided_categories']),
            prefs['feedback_threshold'],
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
    
    def get_recommendation_quality_score(self, recommendation_type, recommendation_text):
        """Get quality score for a recommendation based on feedback"""
        if recommendation_type not in self.recommendation_performance:
            return 0.5  # Neutral score for new recommendations
        
        scores = [entry['score'] for entry in self.recommendation_performance[recommendation_type]
                 if entry['text'] == recommendation_text]
        
        if not scores:
            return 0.5
        
        # Calculate weighted average with recency bias
        recent_scores = scores[-10:]  # Last 10 feedback entries
        weights = np.exp(np.linspace(-1, 0, len(recent_scores)))  # Exponential decay
        
        weighted_score = np.average(recent_scores, weights=weights)
        return max(0, min(1, (weighted_score + 1) / 2))  # Convert to 0-1 scale
    
    def get_user_preferences(self, user_id):
        """Get user preferences for personalized recommendations"""
        if user_id in self.user_preferences:
            return self.user_preferences[user_id]
        
        # Load from database if not in memory
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT preferred_categories, avoided_categories, feedback_threshold
            FROM user_preferences WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            prefs = {
                'preferred_categories': json.loads(result[0]) if result[0] else [],
                'avoided_categories': json.loads(result[1]) if result[1] else [],
                'feedback_threshold': result[2] or 0.5
            }
            self.user_preferences[user_id] = prefs
            return prefs
        
        return {
            'preferred_categories': [],
            'avoided_categories': [],
            'feedback_threshold': 0.5
        }
    
    def get_top_recommendations(self, category, limit=10):
        """Get top performing recommendations for a category"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT recommendation_text, avg_rating, total_feedback, positive_feedback
            FROM recommendation_performance
            WHERE recommendation_type = ? AND total_feedback >= ?
            ORDER BY avg_rating DESC, total_feedback DESC
            LIMIT ?
        ''', (category, self.min_feedback_samples, limit))
        
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                'text': row[0],
                'avg_rating': row[1],
                'total_feedback': row[2],
                'positive_feedback': row[3],
                'success_rate': row[3] / row[2] if row[2] > 0 else 0
            }
            for row in results
        ]
    
    def get_feedback_insights(self, days=30):
        """Get insights from feedback data"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Filter recent feedback
        recent_feedback = [
            f for f in self.feedback_history
            if f['timestamp'] >= cutoff_date
        ]
        
        if not recent_feedback:
            return {
                'total_feedback': 0,
                'feedback_distribution': {},
                'top_categories': [],
                'user_engagement': 0,
                'improvement_areas': []
            }
        
        # Calculate insights
        total_feedback = len(recent_feedback)
        feedback_distribution = defaultdict(int)
        category_feedback = defaultdict(list)
        user_engagement = len(set(f['user_id'] for f in recent_feedback))
        
        for feedback in recent_feedback:
            feedback_distribution[feedback['feedback_type']] += 1
            
            if feedback['context'] and 'category' in feedback['context']:
                category = feedback['context']['category']
                category_feedback[category].append(feedback['feedback_type'])
        
        # Calculate category performance
        category_performance = {}
        for category, feedbacks in category_feedback.items():
            positive_count = sum(1 for f in feedbacks if f in ['helpful', 'very_helpful'])
            total_count = len(feedbacks)
            category_performance[category] = {
                'success_rate': positive_count / total_count if total_count > 0 else 0,
                'total_feedback': total_count
            }
        
        # Identify improvement areas
        improvement_areas = [
            category for category, perf in category_performance.items()
            if perf['success_rate'] < 0.6 and perf['total_feedback'] >= 5
        ]
        
        return {
            'total_feedback': total_feedback,
            'feedback_distribution': dict(feedback_distribution),
            'top_categories': sorted(category_performance.items(), 
                                   key=lambda x: x[1]['success_rate'], reverse=True)[:5],
            'user_engagement': user_engagement,
            'improvement_areas': improvement_areas
        }
    
    def generate_feedback_report(self):
        """Generate comprehensive feedback report"""
        insights = self.get_feedback_insights(30)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'period_days': 30,
            'insights': insights,
            'recommendation_performance': dict(self.recommendation_performance),
            'active_users': len(self.user_preferences)
        }
        
        return report

def test_feedback_system():
    """Test the feedback system"""
    print("🔄 Testing Feedback System")
    print("=" * 40)
    
    # Initialize feedback system
    feedback_system = FeedbackSystem("test_feedback.db")
    
    # Simulate user feedback
    test_feedback = [
        {
            'user_id': 'user_001',
            'recommendation_id': 'anxiety_breathing_exercise',
            'feedback_type': 'helpful',
            'rating': 4,
            'comment': 'This really helped me calm down',
            'context': {'category': 'anxiety_management', 'mood': 4}
        },
        {
            'user_id': 'user_001',
            'recommendation_id': 'depression_social_connection',
            'feedback_type': 'not_helpful',
            'rating': 2,
            'comment': 'Not relevant to my situation',
            'context': {'category': 'depression_support', 'mood': 3}
        },
        {
            'user_id': 'user_002',
            'recommendation_id': 'anxiety_breathing_exercise',
            'feedback_type': 'very_helpful',
            'rating': 5,
            'comment': 'Amazing technique!',
            'context': {'category': 'anxiety_management', 'mood': 6}
        },
        {
            'user_id': 'user_002',
            'recommendation_id': 'stress_time_management',
            'feedback_type': 'helpful',
            'rating': 4,
            'comment': 'Good advice',
            'context': {'category': 'stress_management', 'mood': 5}
        }
    ]
    
    # Record feedback
    for feedback in test_feedback:
        feedback_system.record_feedback(**feedback)
        print(f"✅ Recorded feedback: {feedback['feedback_type']} for {feedback['recommendation_id']}")
    
    # Test recommendation quality scoring
    print(f"\n📊 Recommendation Quality Scores:")
    quality_score = feedback_system.get_recommendation_quality_score('anxiety_management', 'breathing_exercise')
    print(f"   Anxiety breathing exercise: {quality_score:.2f}")
    
    # Test user preferences
    print(f"\n👤 User Preferences:")
    user_prefs = feedback_system.get_user_preferences('user_001')
    print(f"   User 001 preferred categories: {user_prefs['preferred_categories']}")
    print(f"   User 001 avoided categories: {user_prefs['avoided_categories']}")
    
    # Test top recommendations
    print(f"\n🏆 Top Recommendations:")
    top_recs = feedback_system.get_top_recommendations('anxiety_management', 3)
    for rec in top_recs:
        print(f"   {rec['text']}: {rec['success_rate']:.2f} success rate")
    
    # Generate feedback report
    print(f"\n📈 Feedback Insights:")
    insights = feedback_system.get_feedback_insights()
    print(f"   Total feedback: {insights['total_feedback']}")
    print(f"   User engagement: {insights['user_engagement']} users")
    print(f"   Improvement areas: {insights['improvement_areas']}")
    
    # Clean up test database
    if os.path.exists("test_feedback.db"):
        os.remove("test_feedback.db")
    
    print(f"\n✅ Feedback system test completed!")
    
    return feedback_system

if __name__ == "__main__":
    feedback_system = test_feedback_system()
