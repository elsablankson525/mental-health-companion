# 🚀 Enhanced ML Backend Deployment Guide

This guide will help you deploy the enhanced ML system as your main backend for the Mental Health Companion.

## 📋 Prerequisites

- Python 3.8 or higher
- pip package manager
- Git (for version control)
- PostgreSQL (if using database features)

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
# Install enhanced requirements
pip install -r requirements_enhanced.txt

# Or install individually
pip install flask flask-cors scikit-learn pandas numpy joblib nltk textblob scipy
```

### 2. Deploy Enhanced System

**Windows:**
```bash
deploy_enhanced.bat
```

**Linux/Mac:**
```bash
chmod +x deploy_enhanced.sh
./deploy_enhanced.sh
```

**Manual deployment:**
```bash
python start_enhanced.py
```

## 🔧 Configuration

### Environment Variables

Update your `.env.local` file:

```env
# ML Backend Configuration - Enhanced System
NEXT_PUBLIC_ML_API_URL=http://localhost:5000/api

# Enhanced ML System Configuration
ENHANCED_ML_ENABLED=true
CONTINUOUS_LEARNING=true
AB_TESTING_ENABLED=true
FEEDBACK_SYSTEM_ENABLED=true
```

### API Endpoints

The enhanced backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health and status |
| `/api/sentiment` | POST | Enhanced sentiment analysis |
| `/api/predict-mood` | POST | ML-powered mood prediction |
| `/api/recommendations` | POST | Personalized recommendations |
| `/api/feedback` | POST | User feedback collection |
| `/api/patterns` | POST | Mood pattern analysis |
| `/api/insights` | GET | System insights and metrics |
| `/api/train` | POST | Model training endpoint |

## 🧠 Enhanced Features

### 1. **Diverse Training Data**
- 200+ realistic mood entries
- Mental health condition patterns
- Seasonal and temporal variations
- Demographic diversity

### 2. **Advanced Feature Engineering**
- 72 comprehensive features
- Cyclical time encoding
- Text complexity analysis
- Contextual and profile features

### 3. **User Feedback System**
- Recommendation quality tracking
- User preference learning
- Performance analytics
- Personalized filtering

### 4. **A/B Testing Framework**
- Strategy comparison
- Statistical significance testing
- Consistent user assignment
- Performance optimization

### 5. **Continuous Learning**
- Automatic model updates
- Background retraining
- Performance monitoring
- Model versioning

### 6. **Enhanced Recommendations**
- Evidence-based strategies
- Crisis intervention resources
- Time and context awareness
- Emotion-specific suggestions

## 📊 Usage Examples

### Sentiment Analysis

```javascript
const response = await fetch('http://localhost:5000/api/sentiment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "I'm feeling great today!"
  })
});

const result = await response.json();
// Returns: { sentiment: "positive", confidence: 0.71, ... }
```

### Mood Prediction

```javascript
const response = await fetch('http://localhost:5000/api/predict-mood', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emotions: ['Happy', 'Excited'],
    note: 'Feeling great today!',
    time_context: { hour: 14, day_of_week: 1 },
    user_id: 'user_123'
  })
});

const result = await response.json();
// Returns: { predicted_mood: 8, confidence: 0.85, ... }
```

### Get Recommendations

```javascript
const response = await fetch('http://localhost:5000/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mood: 7,
    emotions: ['Happy', 'Excited'],
    sentiment_data: { sentiment: 'positive', confidence: 0.8 },
    user_id: 'user_123'
  })
});

const result = await response.json();
// Returns: { recommendations: [...], count: 8, enhanced: true }
```

### Record Feedback

```javascript
const response = await fetch('http://localhost:5000/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_123',
    recommendation_id: 'anxiety_breathing_exercise',
    feedback_type: 'helpful',
    rating: 4,
    comment: 'This really helped!',
    context: { category: 'anxiety_management' }
  })
});
```

## 🔍 Monitoring and Maintenance

### System Health Check

```bash
curl http://localhost:5000/api/health
```

### System Insights

```bash
curl http://localhost:5000/api/insights
```

### Logs

Check the console output for detailed logs, or redirect to a file:

```bash
python start_enhanced.py > logs/ml_backend.log 2>&1
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Missing dependencies**
   ```bash
   pip install -r requirements_enhanced.txt
   ```

3. **Model training fails**
   - Check if you have enough data
   - Verify feature engineering is working
   - Check logs for specific errors

4. **Database connection issues**
   - Verify PostgreSQL is running
   - Check connection string in environment variables

### Performance Optimization

1. **Increase model accuracy**
   - Collect more user data
   - Retrain models regularly
   - Monitor feedback quality

2. **Improve recommendations**
   - Use A/B testing to optimize strategies
   - Collect user feedback regularly
   - Update recommendation algorithms

3. **System monitoring**
   - Monitor API response times
   - Track model performance metrics
   - Set up alerts for system failures

## 🔄 Updates and Maintenance

### Regular Maintenance

1. **Weekly**
   - Check system health
   - Review feedback insights
   - Monitor A/B test results

2. **Monthly**
   - Retrain models with new data
   - Update recommendation strategies
   - Review system performance

3. **Quarterly**
   - Full system health audit
   - Update dependencies
   - Review and update training data

### Backup and Recovery

```bash
# Backup models
cp -r models/ backup/models_$(date +%Y%m%d)/

# Backup databases
cp enhanced_ml.db backup/enhanced_ml_$(date +%Y%m%d).db
```

## 📈 Performance Metrics

The enhanced system tracks these metrics:

- **Model Accuracy**: Mood prediction accuracy
- **Recommendation Quality**: User feedback scores
- **System Performance**: API response times
- **User Engagement**: Feedback frequency
- **Learning Progress**: Model improvement over time

## 🎯 Next Steps

1. **Deploy the enhanced system** using the deployment scripts
2. **Update your frontend** to use the new API endpoints
3. **Start collecting user data** for continuous learning
4. **Monitor system performance** and user feedback
5. **Iterate and improve** based on insights

## 📞 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Test individual endpoints using curl or Postman

The enhanced ML system is designed to be robust and self-improving, but monitoring and maintenance are key to optimal performance!
