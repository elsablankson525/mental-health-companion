# 🧠 Mental Health Companion - ML System

This document describes the Machine Learning system integrated into the Mental Health Companion webapp.

## 🎯 Overview

The ML system provides intelligent features to enhance the mental health tracking experience:

- **Sentiment Analysis**: Analyzes text from journal entries and chat messages
- **Mood Prediction**: Predicts mood based on historical patterns and current context
- **Pattern Recognition**: Identifies trends and patterns in mood data
- **Personalized Recommendations**: Suggests coping strategies based on current state

## 🏗️ Architecture

```
Frontend (React/Next.js) ←→ ML Backend (Python/Flask) ←→ ML Models
     ↓                           ↓                        ↓
- Chat Interface            - Sentiment Analysis      - Random Forest
- Mood Tracker              - Mood Prediction         - TF-IDF Vectorizer
- Insights Dashboard        - Pattern Analysis        - NLTK VADER
- Journal Page              - Recommendations         - TextBlob
```

## 🚀 Quick Start

### 1. Start the ML Backend

```bash
cd ml_backend
python start.py
```

The server will start at `http://localhost:5000`

### 2. Configure Frontend

Copy the environment file and update the ML API URL:

```bash
cp env.example .env.local
```

Update `.env.local`:
```
NEXT_PUBLIC_ML_API_URL=http://localhost:5000/api
```

### 3. Start the Frontend

```bash
npm run dev
```

## 📊 ML Features

### Sentiment Analysis
- **Input**: Text from journal entries or chat messages
- **Output**: Sentiment classification (positive/negative/neutral) with confidence scores
- **Models**: VADER sentiment analyzer + TextBlob
- **Features**: Polarity, subjectivity, confidence scores

### Mood Prediction
- **Input**: Current emotions, time context, note sentiment
- **Output**: Predicted mood score (1-10) with confidence
- **Model**: Random Forest Classifier
- **Features**: 22 features including emotions, time patterns, sentiment scores

### Pattern Analysis
- **Input**: Historical mood and journal data
- **Output**: Trend analysis, time patterns, emotion frequency
- **Analysis**: Statistical analysis of mood trends and patterns

### Recommendations
- **Input**: Current mood, emotions, sentiment data
- **Output**: Personalized coping strategies and activities
- **Logic**: Rule-based system with mood and emotion-specific suggestions

## 🔧 API Endpoints

### Health Check
```http
GET /api/health
```
Returns server status and model training status.

### Sentiment Analysis
```http
POST /api/sentiment
Content-Type: application/json

{
  "text": "I'm feeling great today!"
}
```

### Train Model
```http
POST /api/train
Content-Type: application/json

{
  "mood_entries": [
    {
      "mood": 8,
      "emotions": ["Happy", "Excited"],
      "date": "2024-01-01T10:00:00Z",
      "note": "Great day!"
    }
  ]
}
```

### Predict Mood
```http
POST /api/predict
Content-Type: application/json

{
  "features": {
    "emotion_count": 2,
    "has_note": 1,
    "hour": 14,
    "day_of_week": 1,
    "is_weekend": 0,
    "happy": 1,
    "sad": 0,
    "anxious": 0,
    "calm": 0,
    "excited": 1,
    "frustrated": 0,
    "grateful": 0,
    "lonely": 0,
    "confident": 0,
    "overwhelmed": 0,
    "peaceful": 0,
    "angry": 0,
    "note_sentiment_positive": 0.8,
    "note_sentiment_negative": 0.1,
    "note_sentiment_neutral": 0.1,
    "note_polarity": 0.6,
    "note_subjectivity": 0.4
  }
}
```

### Get Recommendations
```http
POST /api/recommendations
Content-Type: application/json

{
  "mood": 6,
  "emotions": ["Anxious", "Overwhelmed"],
  "sentiment_data": {
    "sentiment": "negative",
    "confidence": 0.8
  }
}
```

### Analyze Patterns
```http
POST /api/patterns
Content-Type: application/json

{
  "mood_entries": [...],
  "journal_entries": [...]
}
```

## 🎨 Frontend Integration

### ML Service
The `lib/ml-service.ts` file provides a TypeScript interface to the ML backend:

```typescript
import { mlService } from '@/lib/ml-service'

// Analyze sentiment
const sentiment = await mlService.analyzeSentiment("I'm feeling great!")

// Predict mood
const prediction = await mlService.predictMood(features)

// Get recommendations
const recommendations = await mlService.getRecommendations(mood, emotions)
```

### Enhanced Components

#### Chat Interface
- Real-time sentiment analysis of user messages
- Context-aware AI responses based on sentiment
- Personalized recommendations in chat

#### Mood Tracker
- ML-powered mood prediction
- Sentiment analysis of mood notes
- Personalized coping strategies

#### Insights Dashboard
- Advanced pattern analysis
- Trend detection and visualization
- ML-powered insights

## 📈 Model Training

The system automatically trains models when sufficient data is available:

- **Minimum data**: 10 mood entries
- **Training trigger**: Manual training via API or automatic retraining
- **Model persistence**: Models are saved and loaded automatically
- **Feature engineering**: Automatic feature extraction from mood and journal data

## 🔒 Privacy & Security

- **Local processing**: All ML processing happens locally
- **No external APIs**: No data sent to external services
- **Data storage**: All data stored locally in browser
- **Model training**: Uses only user's own data

## 🛠️ Development

### Adding New Features

1. **Backend**: Add new endpoints in `ml_backend/app.py`
2. **Frontend**: Update `lib/ml-service.ts` with new methods
3. **Components**: Integrate new features in React components

### Model Improvements

1. **Feature Engineering**: Add new features in `extract_features()`
2. **Model Selection**: Try different algorithms in `train_mood_predictor()`
3. **Hyperparameter Tuning**: Optimize model parameters

### Testing

```bash
# Test ML backend
cd ml_backend
python -m pytest tests/

# Test frontend integration
npm run test
```

## 📊 Performance

- **Sentiment Analysis**: ~100ms per request
- **Mood Prediction**: ~200ms per request
- **Pattern Analysis**: ~500ms for 100+ entries
- **Model Training**: ~2-5 seconds for 50+ entries

## 🚀 Deployment

### Development
```bash
# Backend
cd ml_backend && python start.py

# Frontend
npm run dev
```

### Production
```bash
# Backend
cd ml_backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Frontend
npm run build && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section below
2. Review the API documentation
3. Open an issue on GitHub

## 🔧 Troubleshooting

### Common Issues

**ML Backend not starting**
- Check Python version (3.8+ required)
- Install requirements: `pip install -r requirements.txt`
- Check port 5000 is available

**Frontend can't connect to ML backend**
- Verify ML backend is running on port 5000
- Check `NEXT_PUBLIC_ML_API_URL` in `.env.local`
- Ensure CORS is enabled in Flask app

**Models not training**
- Ensure at least 10 mood entries exist
- Check data format matches expected schema
- Review error logs in browser console

**Poor prediction accuracy**
- Collect more training data (50+ entries recommended)
- Check data quality and consistency
- Consider feature engineering improvements
