#!/usr/bin/env python3
"""
Startup script for Enhanced ML Backend
Handles initialization and training if needed
"""

import os
import sys
import logging
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_ml_system import EnhancedMentalHealthML
from enhanced_data_generator import generate_enhanced_dataset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def initialize_enhanced_system():
    """Initialize the enhanced ML system with training if needed"""
    logger.info("🚀 Initializing Enhanced ML System...")
    
    try:
        # Initialize enhanced ML system
        enhanced_ml = EnhancedMentalHealthML(
            models_dir="models",
            db_path="enhanced_ml.db"
        )
        
        # Check if models are loaded
        if not enhanced_ml.models_loaded:
            logger.info("📊 No trained models found. Generating training data...")
            
            # Generate enhanced training data
            mood_entries, journal_entries = enhanced_ml.generate_enhanced_training_data(
                num_mood_entries=300,
                num_journal_entries=150
            )
            
            logger.info(f"✅ Generated {len(mood_entries)} mood entries and {len(journal_entries)} journal entries")
            
            # Train models
            logger.info("🤖 Training enhanced models...")
            success = enhanced_ml.train_enhanced_models(mood_entries, journal_entries)
            
            if success:
                logger.info("✅ Enhanced models trained successfully!")
            else:
                logger.error("❌ Model training failed")
                return None
        else:
            logger.info("✅ Pre-trained models loaded successfully")
        
        # Set up A/B testing experiments
        logger.info("🧪 Setting up A/B testing experiments...")
        enhanced_ml._setup_ab_experiments()
        
        # Start continuous learning
        logger.info("🔄 Starting continuous learning...")
        enhanced_ml.learning_system.start_continuous_learning()
        
        logger.info("🎉 Enhanced ML System initialized successfully!")
        return enhanced_ml
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize enhanced ML system: {e}")
        return None

def main():
    """Main startup function"""
    print("🧠 Mental Health Companion - Enhanced ML Backend")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Initialize system
    enhanced_ml = initialize_enhanced_system()
    
    if enhanced_ml is None:
        print("❌ Failed to initialize enhanced ML system")
        sys.exit(1)
    
    # Get system status
    insights = enhanced_ml.get_system_insights()
    
    print("\n📊 System Status:")
    print(f"   Models loaded: {insights['models_loaded']}")
    print(f"   System status: {insights['system_status']}")
    print(f"   Active experiments: {len(insights['active_experiments'])}")
    
    print("\n🚀 Starting Flask server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔗 API endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/sentiment")
    print("   - POST /api/predict-mood")
    print("   - POST /api/recommendations")
    print("   - POST /api/feedback")
    print("   - POST /api/patterns")
    print("   - GET  /api/insights")
    print("   - POST /api/train")
    print("\n💡 Press Ctrl+C to stop the server")
    print("-" * 60)
    
    # Start Flask app
    from enhanced_app import app
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == "__main__":
    main()
