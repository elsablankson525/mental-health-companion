import psycopg2
import psycopg2.extras
import os
from datetime import datetime, timedelta
import json

class DatabaseService:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/mental_health_companion')
            self.connection = psycopg2.connect(database_url)
            print("✅ Connected to PostgreSQL database")
        except Exception as e:
            print(f"❌ Error connecting to database: {e}")
            self.connection = None
    
    def get_user_mood_entries(self, user_id, limit=100):
        """Get mood entries for a specific user"""
        if not self.connection:
            return []
        
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT mood, emotions, note, date, created_at
                    FROM "MoodEntry"
                    WHERE "userId" = %s
                    ORDER BY date DESC
                    LIMIT %s
                """, (user_id, limit))
                return cursor.fetchall()
        except Exception as e:
            print(f"Error fetching mood entries: {e}")
            return []
    
    def get_user_journal_entries(self, user_id, limit=100):
        """Get journal entries for a specific user"""
        if not self.connection:
            return []
        
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT title, content, date, created_at
                    FROM "JournalEntry"
                    WHERE "userId" = %s
                    ORDER BY date DESC
                    LIMIT %s
                """, (user_id, limit))
                return cursor.fetchall()
        except Exception as e:
            print(f"Error fetching journal entries: {e}")
            return []
    
    def get_user_chat_messages(self, user_id, limit=100):
        """Get chat messages for a specific user"""
        if not self.connection:
            return []
        
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT message, "isUser", timestamp, created_at
                    FROM "ChatMessage"
                    WHERE "userId" = %s
                    ORDER BY timestamp DESC
                    LIMIT %s
                """, (user_id, limit))
                return cursor.fetchall()
        except Exception as e:
            print(f"Error fetching chat messages: {e}")
            return []
    
    def get_user_data_for_ml(self, user_id):
        """Get all user data formatted for ML processing"""
        mood_entries = self.get_user_mood_entries(user_id)
        journal_entries = self.get_user_journal_entries(user_id)
        chat_messages = self.get_user_chat_messages(user_id)
        
        return {
            'mood_entries': mood_entries,
            'journal_entries': journal_entries,
            'chat_messages': chat_messages
        }
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("Database connection closed")
