#!/usr/bin/env python3
"""
Continuous Learning System for Mental Health Companion
Implements automatic model retraining and continuous improvement
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import deque
import joblib
import os
import sqlite3
from typing import Dict, List, Any, Optional, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import threading
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContinuousLearningSystem:
    """Continuous learning system for model improvement"""
    
    def __init__(self, models_dir="models", db_path="learning.db"):
        self.models_dir = models_dir
        self.db_path = db_path
        self.init_database()
        
        # Learning parameters
        self.retrain_threshold = 50  # Retrain after 50 new samples
        self.min_accuracy_improvement = 0.02  # 2% minimum improvement
        self.max_retrain_frequency = 24  # Hours between retrains
        self.data_buffer = deque(maxlen=1000)  # Keep last 1000 samples
        
        # Model tracking
        self.model_versions = {}
        self.performance_history = deque(maxlen=100)
        self.last_retrain = None
        
        # Background retraining
        self.retrain_thread = None
        self.stop_retraining = False
        
        # Initialize models
        self.load_latest_models()
    
    def init_database(self):
        """Initialize learning database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create learning data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learning_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                features TEXT,
                target_value REAL,
                prediction REAL,
                confidence REAL,
                timestamp DATETIME,
                data_type TEXT
            )
        ''')
        
        # Create model versions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_versions (
                version_id TEXT PRIMARY KEY,
                model_type TEXT,
                accuracy REAL,
                created_date DATETIME,
                file_path TEXT,
                is_active BOOLEAN
            )
        ''')
        
        # Create retraining log table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS retraining_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version_id TEXT,
                accuracy_improvement REAL,
                samples_used INTEGER,
                retrain_date DATETIME,
                success BOOLEAN,
                error_message TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_training_sample(self, user_id: str, features: Dict, target_value: float, 
                           prediction: float = None, confidence: float = None, 
                           data_type: str = "mood_entry"):
        """Add a new training sample to the learning system"""
        sample = {
            'user_id': user_id,
            'features': features,
            'target_value': target_value,
            'prediction': prediction,
            'confidence': confidence,
            'timestamp': datetime.now(),
            'data_type': data_type
        }
        
        # Add to buffer
        self.data_buffer.append(sample)
        
        # Store in database
        self._store_learning_sample(sample)
        
        # Check if retraining is needed
        if self._should_retrain():
            self._schedule_retraining()
    
    def _store_learning_sample(self, sample: Dict):
        """Store learning sample in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO learning_data
            (user_id, features, target_value, prediction, confidence, timestamp, data_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            sample['user_id'],
            json.dumps(sample['features']),
            sample['target_value'],
            sample['prediction'],
            sample['confidence'],
            sample['timestamp'].isoformat(),
            sample['data_type']
        ))
        
        conn.commit()
        conn.close()
    
    def _should_retrain(self) -> bool:
        """Check if model should be retrained"""
        # Check if enough time has passed since last retrain
        if self.last_retrain:
            time_since_retrain = datetime.now() - self.last_retrain
            if time_since_retrain.total_seconds() < self.max_retrain_frequency * 3600:
                return False
        
        # Check if enough new samples
        recent_samples = self._get_recent_samples(self.retrain_threshold)
        if len(recent_samples) < self.retrain_threshold:
            return False
        
        # Check if retraining is already in progress
        if self.retrain_thread and self.retrain_thread.is_alive():
            return False
        
        return True
    
    def _get_recent_samples(self, limit: int) -> List[Dict]:
        """Get recent learning samples"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, features, target_value, prediction, confidence, timestamp, data_type
            FROM learning_data
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        samples = []
        for row in cursor.fetchall():
            samples.append({
                'user_id': row[0],
                'features': json.loads(row[1]),
                'target_value': row[2],
                'prediction': row[3],
                'confidence': row[4],
                'timestamp': datetime.fromisoformat(row[5]),
                'data_type': row[6]
            })
        
        conn.close()
        return samples
    
    def _schedule_retraining(self):
        """Schedule background retraining"""
        if self.retrain_thread and self.retrain_thread.is_alive():
            return
        
        self.retrain_thread = threading.Thread(target=self._retrain_models_background)
        self.retrain_thread.daemon = True
        self.retrain_thread.start()
    
    def _retrain_models_background(self):
        """Background model retraining"""
        try:
            logger.info("Starting background model retraining...")
            success = self.retrain_models()
            
            if success:
                logger.info("Background retraining completed successfully")
            else:
                logger.warning("Background retraining failed")
                
        except Exception as e:
            logger.error(f"Error in background retraining: {e}")
    
    def retrain_models(self) -> bool:
        """Retrain models with new data"""
        try:
            # Get recent training data
            recent_samples = self._get_recent_samples(self.retrain_threshold * 2)
            
            if len(recent_samples) < self.retrain_threshold:
                logger.warning("Not enough samples for retraining")
                return False
            
            # Prepare training data
            X, y = self._prepare_training_data(recent_samples)
            
            if X is None or y is None:
                logger.error("Failed to prepare training data")
                return False
            
            # Train new model
            new_model, new_scaler = self._train_new_model(X, y)
            
            if new_model is None:
                logger.error("Failed to train new model")
                return False
            
            # Evaluate new model
            accuracy = self._evaluate_model(new_model, new_scaler, X, y)
            
            # Check if new model is better
            current_accuracy = self._get_current_model_accuracy()
            improvement = accuracy - current_accuracy
            
            if improvement >= self.min_accuracy_improvement:
                # Save new model
                version_id = self._save_model_version(new_model, new_scaler, accuracy)
                
                # Update active model
                self._update_active_model(new_model, new_scaler)
                
                # Log retraining
                self._log_retraining(version_id, improvement, len(recent_samples), True)
                
                logger.info(f"Model retrained successfully. Accuracy improved by {improvement:.3f}")
                return True
            else:
                logger.info(f"New model not significantly better (improvement: {improvement:.3f})")
                return False
                
        except Exception as e:
            logger.error(f"Error in model retraining: {e}")
            self._log_retraining(None, 0, 0, False, str(e))
            return False
    
    def _prepare_training_data(self, samples: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data from samples"""
        try:
            features_list = []
            targets = []
            
            for sample in samples:
                features = sample['features']
                target = sample['target_value']
                
                # Convert features to array
                feature_array = self._features_to_array(features)
                if feature_array is not None:
                    features_list.append(feature_array)
                    targets.append(target)
            
            if not features_list:
                return None, None
            
            X = np.array(features_list)
            y = np.array(targets)
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing training data: {e}")
            return None, None
    
    def _features_to_array(self, features: Dict) -> Optional[np.ndarray]:
        """Convert features dictionary to numpy array"""
        try:
            # Define expected feature order (should match training)
            feature_order = [
                'emotion_count', 'has_note', 'hour', 'day_of_week', 'is_weekend',
                'emotion_happy', 'emotion_sad', 'emotion_anxious', 'emotion_calm',
                'emotion_excited', 'emotion_frustrated', 'emotion_grateful',
                'emotion_lonely', 'emotion_confident', 'emotion_overwhelmed',
                'emotion_peaceful', 'emotion_angry', 'sentiment_positive',
                'sentiment_negative', 'sentiment_neutral', 'polarity', 'subjectivity'
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
    
    def _train_new_model(self, X: np.ndarray, y: np.ndarray) -> Tuple[Any, Any]:
        """Train new model with given data"""
        try:
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train Random Forest
            model = RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2
            )
            
            model.fit(X_scaled, y)
            
            return model, scaler
            
        except Exception as e:
            logger.error(f"Error training new model: {e}")
            return None, None
    
    def _evaluate_model(self, model: Any, scaler: Any, X: np.ndarray, y: np.ndarray) -> float:
        """Evaluate model performance"""
        try:
            X_scaled = scaler.transform(X)
            y_pred = model.predict(X_scaled)
            accuracy = accuracy_score(y, y_pred)
            return accuracy
            
        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            return 0.0
    
    def _get_current_model_accuracy(self) -> float:
        """Get current model accuracy"""
        # Get recent predictions and actual values
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT target_value, prediction
            FROM learning_data
            WHERE prediction IS NOT NULL
            ORDER BY timestamp DESC
            LIMIT 100
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            return 0.5  # Default accuracy
        
        actual = [row[0] for row in results]
        predicted = [row[1] for row in results]
        
        # Calculate accuracy (for classification)
        correct = sum(1 for a, p in zip(actual, predicted) if abs(a - p) <= 1)
        return correct / len(actual)
    
    def _save_model_version(self, model: Any, scaler: Any, accuracy: float) -> str:
        """Save new model version"""
        version_id = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Save model files
        model_path = os.path.join(self.models_dir, f"mood_predictor_{version_id}.joblib")
        scaler_path = os.path.join(self.models_dir, f"scaler_{version_id}.joblib")
        
        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)
        
        # Save to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Deactivate previous models
        cursor.execute('UPDATE model_versions SET is_active = FALSE WHERE model_type = "mood_predictor"')
        
        # Add new model version
        cursor.execute('''
            INSERT INTO model_versions
            (version_id, model_type, accuracy, created_date, file_path, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (version_id, "mood_predictor", accuracy, datetime.now().isoformat(), model_path, True))
        
        conn.commit()
        conn.close()
        
        return version_id
    
    def _update_active_model(self, model: Any, scaler: Any):
        """Update active model in memory"""
        # Update model files
        joblib.dump(model, os.path.join(self.models_dir, "mood_predictor.joblib"))
        joblib.dump(scaler, os.path.join(self.models_dir, "scaler.joblib"))
        
        # Update tracking
        self.last_retrain = datetime.now()
        self.model_versions["mood_predictor"] = {
            'model': model,
            'scaler': scaler,
            'last_updated': self.last_retrain
        }
    
    def _log_retraining(self, version_id: str, improvement: float, samples_used: int, 
                       success: bool, error_message: str = None):
        """Log retraining attempt"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO retraining_log
            (version_id, accuracy_improvement, samples_used, retrain_date, success, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (version_id, improvement, samples_used, datetime.now().isoformat(), success, error_message))
        
        conn.commit()
        conn.close()
    
    def load_latest_models(self):
        """Load latest trained models"""
        try:
            model_path = os.path.join(self.models_dir, "mood_predictor.joblib")
            scaler_path = os.path.join(self.models_dir, "scaler.joblib")
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                
                self.model_versions["mood_predictor"] = {
                    'model': model,
                    'scaler': scaler,
                    'last_updated': datetime.now()
                }
                
                logger.info("Latest models loaded successfully")
            else:
                logger.warning("No trained models found")
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def get_learning_insights(self) -> Dict:
        """Get insights about the learning system"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get total samples
        cursor.execute('SELECT COUNT(*) FROM learning_data')
        total_samples = cursor.fetchone()[0]
        
        # Get recent samples
        cursor.execute('''
            SELECT COUNT(*) FROM learning_data
            WHERE timestamp > datetime('now', '-7 days')
        ''')
        recent_samples = cursor.fetchone()[0]
        
        # Get model versions
        cursor.execute('''
            SELECT version_id, accuracy, created_date, is_active
            FROM model_versions
            ORDER BY created_date DESC
            LIMIT 5
        ''')
        model_versions = cursor.fetchall()
        
        # Get retraining history
        cursor.execute('''
            SELECT accuracy_improvement, samples_used, retrain_date, success
            FROM retraining_log
            ORDER BY retrain_date DESC
            LIMIT 10
        ''')
        retraining_history = cursor.fetchall()
        
        conn.close()
        
        return {
            'total_samples': total_samples,
            'recent_samples': recent_samples,
            'model_versions': [
                {
                    'version_id': row[0],
                    'accuracy': row[1],
                    'created_date': row[2],
                    'is_active': bool(row[3])
                }
                for row in model_versions
            ],
            'retraining_history': [
                {
                    'accuracy_improvement': row[0],
                    'samples_used': row[1],
                    'retrain_date': row[2],
                    'success': bool(row[3])
                }
                for row in retraining_history
            ],
            'last_retrain': self.last_retrain.isoformat() if self.last_retrain else None,
            'buffer_size': len(self.data_buffer)
        }
    
    def start_continuous_learning(self):
        """Start continuous learning background process"""
        if self.retrain_thread and self.retrain_thread.is_alive():
            logger.warning("Continuous learning already running")
            return
        
        self.stop_retraining = False
        self.retrain_thread = threading.Thread(target=self._continuous_learning_loop)
        self.retrain_thread.daemon = True
        self.retrain_thread.start()
        
        logger.info("Continuous learning started")
    
    def stop_continuous_learning(self):
        """Stop continuous learning background process"""
        self.stop_retraining = True
        if self.retrain_thread:
            self.retrain_thread.join(timeout=5)
        
        logger.info("Continuous learning stopped")
    
    def _continuous_learning_loop(self):
        """Main continuous learning loop"""
        while not self.stop_retraining:
            try:
                # Check if retraining is needed
                if self._should_retrain():
                    self.retrain_models()
                
                # Wait before next check
                time.sleep(3600)  # Check every hour
                
            except Exception as e:
                logger.error(f"Error in continuous learning loop: {e}")
                time.sleep(300)  # Wait 5 minutes before retrying

def test_continuous_learning_system():
    """Test the continuous learning system"""
    print("🔄 Testing Continuous Learning System")
    print("=" * 50)
    
    # Initialize system
    learning_system = ContinuousLearningSystem("test_models", "test_learning.db")
    
    # Generate test data
    print("📊 Generating test training samples...")
    for i in range(100):
        features = {
            'emotion_count': random.randint(1, 3),
            'has_note': random.randint(0, 1),
            'hour': random.randint(6, 22),
            'day_of_week': random.randint(0, 6),
            'is_weekend': random.randint(0, 1),
            'emotion_happy': random.randint(0, 1),
            'emotion_sad': random.randint(0, 1),
            'emotion_anxious': random.randint(0, 1),
            'emotion_calm': random.randint(0, 1),
            'emotion_excited': random.randint(0, 1),
            'emotion_frustrated': random.randint(0, 1),
            'emotion_grateful': random.randint(0, 1),
            'emotion_lonely': random.randint(0, 1),
            'emotion_confident': random.randint(0, 1),
            'emotion_overwhelmed': random.randint(0, 1),
            'emotion_peaceful': random.randint(0, 1),
            'emotion_angry': random.randint(0, 1),
            'sentiment_positive': random.random(),
            'sentiment_negative': random.random(),
            'sentiment_neutral': random.random(),
            'polarity': random.uniform(-1, 1),
            'subjectivity': random.random()
        }
        
        # Generate target based on features
        target = random.randint(1, 10)
        
        learning_system.add_training_sample(
            user_id=f"user_{i:03d}",
            features=features,
            target_value=target,
            prediction=target + random.randint(-1, 1),
            confidence=random.random(),
            data_type="mood_entry"
        )
    
    print(f"✅ Added 100 training samples")
    
    # Test retraining
    print("🔄 Testing model retraining...")
    success = learning_system.retrain_models()
    print(f"   Retraining success: {success}")
    
    # Get insights
    print("📈 Learning System Insights:")
    insights = learning_system.get_learning_insights()
    print(f"   Total samples: {insights['total_samples']}")
    print(f"   Recent samples: {insights['recent_samples']}")
    print(f"   Model versions: {len(insights['model_versions'])}")
    print(f"   Buffer size: {insights['buffer_size']}")
    
    # Clean up
    learning_system.stop_continuous_learning()
    
    # Clean up test files
    import shutil
    if os.path.exists("test_models"):
        shutil.rmtree("test_models")
    if os.path.exists("test_learning.db"):
        os.remove("test_learning.db")
    
    print("✅ Continuous learning system test completed!")
    
    return learning_system

if __name__ == "__main__":
    import random
    learning_system = test_continuous_learning_system()
