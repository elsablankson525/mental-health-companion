#!/usr/bin/env python3
"""
Test Enhanced ML System Deployment
Simple test to verify the enhanced system works
"""

import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_enhanced_system():
    """Test the enhanced ML system components"""
    print("🧠 Testing Enhanced ML System Deployment")
    print("=" * 50)
    
    try:
        # Test 1: Import enhanced ML system
        print("1️⃣ Testing enhanced ML system import...")
        from enhanced_ml_system import EnhancedMentalHealthML
        print("   ✅ Enhanced ML system imported successfully")
        
        # Test 2: Initialize system
        print("2️⃣ Testing system initialization...")
        enhanced_ml = EnhancedMentalHealthML(
            models_dir="test_models",
            db_path="test_enhanced.db"
        )
        print("   ✅ System initialized successfully")
        
        # Test 3: Generate training data
        print("3️⃣ Testing data generation...")
        mood_entries, journal_entries = enhanced_ml.generate_enhanced_training_data(
            num_mood_entries=50,
            num_journal_entries=25
        )
        print(f"   ✅ Generated {len(mood_entries)} mood entries and {len(journal_entries)} journal entries")
        
        # Test 4: Train models
        print("4️⃣ Testing model training...")
        success = enhanced_ml.train_enhanced_models(mood_entries, journal_entries)
        if success:
            print("   ✅ Models trained successfully")
        else:
            print("   ❌ Model training failed")
            return False
        
        # Test 5: Test prediction
        print("5️⃣ Testing mood prediction...")
        prediction = enhanced_ml.predict_mood_enhanced(
            emotions=['Happy', 'Excited'],
            note='Feeling great today!',
            time_context={'hour': 14, 'day_of_week': 1},
            user_id='test_user'
        )
        print(f"   ✅ Prediction: {prediction}")
        
        # Test 6: Test recommendations
        print("6️⃣ Testing recommendations...")
        recommendations = enhanced_ml.get_enhanced_recommendations(
            mood=7,
            emotions=['Happy', 'Excited'],
            sentiment_data={'sentiment': 'positive', 'confidence': 0.8},
            user_id='test_user'
        )
        print(f"   ✅ Generated {len(recommendations)} recommendations")
        
        # Test 7: Test feedback system
        print("7️⃣ Testing feedback system...")
        enhanced_ml.record_user_feedback(
            user_id='test_user',
            recommendation_id='test_recommendation',
            feedback_type='helpful',
            rating=4,
            comment='This worked well!',
            context={'category': 'general'}
        )
        print("   ✅ Feedback recorded successfully")
        
        # Test 8: Get system insights
        print("8️⃣ Testing system insights...")
        insights = enhanced_ml.get_system_insights()
        print(f"   ✅ System status: {insights['system_status']}")
        
        print("\n🎉 All tests passed! Enhanced ML system is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Cleanup
        try:
            import shutil
            if os.path.exists("test_models"):
                shutil.rmtree("test_models")
            if os.path.exists("test_enhanced.db"):
                os.remove("test_enhanced.db")
            if os.path.exists("test_enhanced.db_feedback"):
                os.remove("test_enhanced.db_feedback")
            if os.path.exists("test_enhanced.db_ab"):
                os.remove("test_enhanced.db_ab")
            if os.path.exists("test_enhanced.db_learning"):
                os.remove("test_enhanced.db_learning")
        except:
            pass

if __name__ == "__main__":
    success = test_enhanced_system()
    sys.exit(0 if success else 1)
