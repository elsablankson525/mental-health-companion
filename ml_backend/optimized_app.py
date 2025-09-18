#!/usr/bin/env python3
"""
Optimized ML Backend for Mental Health Companion
High-performance Flask application with caching, async processing, and optimization
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import asyncio
import threading
from datetime import datetime, timedelta
import json
from functools import wraps
import time
from concurrent.futures import ThreadPoolExecutor
import psutil

# Import optimization libraries
from cachetools import TTLCache
import redis
from celery import Celery

# Import ML modules
from enhanced_ml_system import EnhancedMentalHealthML
from enhanced_recommendations import EnhancedMentalHealthRecommendations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config.update(
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max request size
    JSON_SORT_KEYS=False,
    JSONIFY_PRETTYPRINT_REGULAR=False
)

# Redis configuration for caching
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Celery configuration for background tasks
celery_app = Celery('ml_backend', broker=REDIS_URL)

# In-memory cache for frequently accessed data
memory_cache = TTLCache(maxsize=1000, ttl=300)  # 5 minutes TTL

# Thread pool for CPU-intensive tasks
thread_pool = ThreadPoolExecutor(max_workers=4)

# Performance monitoring
class PerformanceMonitor:
    def __init__(self):
        self.request_times = []
        self.error_count = 0
        self.success_count = 0
    
    def record_request(self, duration, success=True):
        self.request_times.append(duration)
        if success:
            self.success_count += 1
        else:
            self.error_count += 1
        
        # Keep only last 1000 requests
        if len(self.request_times) > 1000:
            self.request_times = self.request_times[-1000:]
    
    def get_stats(self):
        if not self.request_times:
            return {"avg_response_time": 0, "success_rate": 0}
        
        avg_time = sum(self.request_times) / len(self.request_times)
        total_requests = self.success_count + self.error_count
        success_rate = (self.success_count / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "avg_response_time": round(avg_time, 3),
            "success_rate": round(success_rate, 2),
            "total_requests": total_requests
        }

performance_monitor = PerformanceMonitor()

# Caching decorator
def cache_result(ttl=300, key_prefix=""):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            try:
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
            except Exception as e:
                logger.warning(f"Cache read error: {e}")
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            try:
                redis_client.setex(cache_key, ttl, json.dumps(result, default=str))
            except Exception as e:
                logger.warning(f"Cache write error: {e}")
            
            return result
        return wrapper
    return decorator

# Performance monitoring decorator
def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            performance_monitor.record_request(time.time() - start_time, True)
            return result
        except Exception as e:
            performance_monitor.record_request(time.time() - start_time, False)
            raise e
    return wrapper

# Initialize enhanced ML system with error handling
try:
    enhanced_ml = EnhancedMentalHealthML(
        models_dir="models",
        db_path="enhanced_ml.db"
    )
    logger.info("Enhanced ML system initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize enhanced ML system: {e}")
    enhanced_ml = None

# Initialize recommendations system
try:
    recommendations = EnhancedMentalHealthRecommendations()
    logger.info("Recommendations system initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize recommendations system: {e}")
    recommendations = None

# Background task for model updates
@celery_app.task
def update_models_async():
    """Background task to update ML models"""
    try:
        if enhanced_ml:
            enhanced_ml.retrain_models()
            logger.info("Models updated successfully")
    except Exception as e:
        logger.error(f"Model update failed: {e}")

# Health check endpoint with system metrics
@app.route('/api/health', methods=['GET'])
@monitor_performance
def health_check():
    """Enhanced health check with system status and performance metrics"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # ML system status
        ml_status = "healthy" if enhanced_ml else "unavailable"
        recommendations_status = "healthy" if recommendations else "unavailable"
        
        # Cache status
        try:
            redis_client.ping()
            cache_status = "connected"
        except:
            cache_status = "disconnected"
        
        # Performance stats
        perf_stats = performance_monitor.get_stats()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {
                'ml_system': ml_status,
                'recommendations': recommendations_status,
                'cache': cache_status,
                'api': 'running'
            },
            'system_metrics': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
                'cache_size': len(memory_cache)
            },
            'performance': perf_stats
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 500

# Optimized mood prediction endpoint
@app.route('/api/predict-mood', methods=['POST'])
@monitor_performance
@cache_result(ttl=600, key_prefix="mood_prediction")
def predict_mood():
    """Predict mood with caching and optimization"""
    try:
        if not enhanced_ml:
            return jsonify({'error': 'ML system not available'}), 503
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text input required'}), 400
        
        text = data['text']
        if len(text) > 10000:  # Limit text length
            return jsonify({'error': 'Text too long'}), 400
        
        # Use thread pool for CPU-intensive prediction
        future = thread_pool.submit(enhanced_ml.predict_mood, text)
        prediction = future.result(timeout=30)  # 30 second timeout
        
        return jsonify({
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Mood prediction failed: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

# Optimized sentiment analysis endpoint
@app.route('/api/analyze-sentiment', methods=['POST'])
@monitor_performance
@cache_result(ttl=300, key_prefix="sentiment")
def analyze_sentiment():
    """Analyze sentiment with caching"""
    try:
        if not enhanced_ml:
            return jsonify({'error': 'ML system not available'}), 503
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text input required'}), 400
        
        text = data['text']
        if len(text) > 5000:
            return jsonify({'error': 'Text too long'}), 400
        
        # Use thread pool for analysis
        future = thread_pool.submit(enhanced_ml.analyze_sentiment, text)
        analysis = future.result(timeout=20)
        
        return jsonify({
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {e}")
        return jsonify({'error': 'Analysis failed'}), 500

# Optimized pattern analysis endpoint
@app.route('/api/analyze-patterns', methods=['POST'])
@monitor_performance
@cache_result(ttl=1800, key_prefix="patterns")  # 30 minutes cache
def analyze_patterns():
    """Analyze patterns with extended caching"""
    try:
        if not enhanced_ml:
            return jsonify({'error': 'ML system not available'}), 503
        
        data = request.get_json()
        if not data or 'mood_entries' not in data:
            return jsonify({'error': 'Mood entries required'}), 400
        
        mood_entries = data['mood_entries']
        journal_entries = data.get('journal_entries', [])
        
        # Limit data size
        if len(mood_entries) > 1000 or len(journal_entries) > 1000:
            return jsonify({'error': 'Too much data'}), 400
        
        # Use thread pool for analysis
        future = thread_pool.submit(
            enhanced_ml.analyze_patterns, 
            mood_entries, 
            journal_entries
        )
        analysis = future.result(timeout=60)
        
        return jsonify({
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Pattern analysis failed: {e}")
        return jsonify({'error': 'Analysis failed'}), 500

# Optimized recommendations endpoint
@app.route('/api/recommendations', methods=['POST'])
@monitor_performance
@cache_result(ttl=900, key_prefix="recommendations")
def get_recommendations():
    """Get personalized recommendations with caching"""
    try:
        if not recommendations:
            return jsonify({'error': 'Recommendations system not available'}), 503
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'User data required'}), 400
        
        # Use thread pool for recommendations
        future = thread_pool.submit(recommendations.get_recommendations, data)
        recs = future.result(timeout=30)
        
        return jsonify({
            'recommendations': recs,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Recommendations failed: {e}")
        return jsonify({'error': 'Recommendations failed'}), 500

# Batch processing endpoint for multiple predictions
@app.route('/api/batch-predict', methods=['POST'])
@monitor_performance
def batch_predict():
    """Process multiple predictions in batch"""
    try:
        if not enhanced_ml:
            return jsonify({'error': 'ML system not available'}), 503
        
        data = request.get_json()
        if not data or 'texts' not in data:
            return jsonify({'error': 'Texts array required'}), 400
        
        texts = data['texts']
        if len(texts) > 50:  # Limit batch size
            return jsonify({'error': 'Too many texts'}), 400
        
        # Process in parallel using thread pool
        futures = []
        for text in texts:
            if len(text) <= 10000:  # Individual text limit
                future = thread_pool.submit(enhanced_ml.predict_mood, text)
                futures.append(future)
        
        # Collect results
        results = []
        for future in futures:
            try:
                result = future.result(timeout=30)
                results.append(result)
            except Exception as e:
                logger.warning(f"Batch prediction failed for one item: {e}")
                results.append({'error': 'Prediction failed'})
        
        return jsonify({
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")
        return jsonify({'error': 'Batch processing failed'}), 500

# Model retraining endpoint (triggers background task)
@app.route('/api/retrain-models', methods=['POST'])
@monitor_performance
def retrain_models():
    """Trigger model retraining in background"""
    try:
        if not enhanced_ml:
            return jsonify({'error': 'ML system not available'}), 503
        
        # Start background task
        task = update_models_async.delay()
        
        return jsonify({
            'message': 'Model retraining started',
            'task_id': task.id,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Model retraining failed: {e}")
        return jsonify({'error': 'Retraining failed'}), 500

# Cache management endpoints
@app.route('/api/cache/clear', methods=['POST'])
@monitor_performance
def clear_cache():
    """Clear all caches"""
    try:
        # Clear Redis cache
        redis_client.flushdb()
        
        # Clear memory cache
        memory_cache.clear()
        
        return jsonify({
            'message': 'Cache cleared successfully',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Cache clear failed: {e}")
        return jsonify({'error': 'Cache clear failed'}), 500

@app.route('/api/cache/stats', methods=['GET'])
@monitor_performance
def cache_stats():
    """Get cache statistics"""
    try:
        redis_info = redis_client.info()
        
        return jsonify({
            'memory_cache': {
                'size': len(memory_cache),
                'maxsize': memory_cache.maxsize,
                'ttl': memory_cache.ttl
            },
            'redis_cache': {
                'used_memory': redis_info.get('used_memory_human'),
                'connected_clients': redis_info.get('connected_clients'),
                'keyspace_hits': redis_info.get('keyspace_hits'),
                'keyspace_misses': redis_info.get('keyspace_misses')
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Cache stats failed: {e}")
        return jsonify({'error': 'Cache stats failed'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'Request too large'}), 413

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# Graceful shutdown
def shutdown_handler():
    """Handle graceful shutdown"""
    logger.info("Shutting down ML backend...")
    thread_pool.shutdown(wait=True)
    if enhanced_ml:
        enhanced_ml.cleanup()
    logger.info("Shutdown complete")

# Register shutdown handler
import atexit
atexit.register(shutdown_handler)

if __name__ == '__main__':
    # Production configuration
    if os.getenv('FLASK_ENV') == 'production':
        app.run(host='0.0.0.0', port=5000, threaded=True)
    else:
        # Development configuration
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
