# 🚀 Railway Deployment Guide for ML Backend

This guide will help you deploy the Mental Health Companion ML backend to Railway using the web interface.

## 📋 Prerequisites

- Railway account (sign up at https://railway.app)
- Git repository (GitHub, GitLab, or Bitbucket)
- ML backend files ready in your repository

## 🛠️ Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your `ml_backend` directory contains these essential files:
- ✅ `app.py` - Main Flask application
- ✅ `requirements.txt` - Python dependencies
- ✅ `Procfile` - Process configuration
- ✅ `railway.json` - Railway-specific configuration
- ✅ `nixpacks.toml` - Build configuration
- ✅ `runtime.txt` - Python version specification
- ✅ `models/` directory with trained models

### 2. Push to Git Repository

If you haven't already, push your code to a Git repository:

```bash
git add .
git commit -m "Prepare ML backend for Railway deployment"
git push origin main
```

### 3. Deploy via Railway Web Interface

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Sign in to your account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or your Git provider)
   - Choose your repository

3. **Configure Deployment**
   - Railway will automatically detect it's a Python project
   - Set the **Root Directory** to `ml_backend`
   - Railway will use the existing configuration files

4. **Environment Variables** (Optional)
   - Go to the Variables tab
   - Add any environment variables if needed:
     ```
     PORT=5000
     NODE_ENV=production
     ```

5. **Deploy**
   - Click "Deploy"
   - Railway will build and deploy your application
   - Wait for deployment to complete

### 4. Get Your Deployment URL

Once deployed, Railway will provide you with:
- **Public URL**: `https://your-app-name.railway.app`
- **API Base URL**: `https://your-app-name.railway.app/api`

## 🔧 Configuration Files Explained

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["python311", "gcc"]

[phases.install]
cmds = [
  "pip install -r requirements.txt",
  "python -c \"import nltk; nltk.download('vader_lexicon')\""
]

[phases.build]
cmds = ["echo 'Build complete'"]

[start]
cmd = "gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120"
```

### `Procfile`
```
web: sh -c "gunicorn app:app --bind 0.0.0.0:${PORT:-5000} --workers 4 --timeout 120"
```

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app-name.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "models_loaded": {
    "mood_predictor": true,
    "scaler": true,
    "vectorizer": true
  }
}
```

### 2. Sentiment Analysis Test
```bash
curl -X POST https://your-app-name.railway.app/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I am feeling great today!"}'
```

### 3. Mood Prediction Test
```bash
curl -X POST https://your-app-name.railway.app/api/predict-mood \
  -H "Content-Type: application/json" \
  -d '{"emotions": ["happy", "excited"], "note": "Feeling great!"}'
```

## 🔄 Updating Your Frontend

Once deployed, update your frontend configuration:

### Update `.env.local` or environment variables:
```env
NEXT_PUBLIC_ML_API_URL=https://your-app-name.railway.app/api
```

### Update your ML service configuration:
```typescript
// In your frontend code
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'https://your-app-name.railway.app/api';
```

## 📊 Monitoring and Logs

### Railway Dashboard
- View deployment logs in real-time
- Monitor resource usage
- Check deployment status

### Application Logs
- Access logs through Railway dashboard
- Monitor API endpoint usage
- Track error rates and performance

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `requirements.txt` for missing dependencies
   - Verify Python version in `runtime.txt`
   - Check build logs in Railway dashboard

2. **Runtime Errors**
   - Verify all model files are present in `models/` directory
   - Check environment variables
   - Review application logs

3. **API Not Responding**
   - Verify health check endpoint
   - Check if PORT environment variable is set
   - Ensure gunicorn is starting correctly

4. **Model Loading Issues**
   - Verify model files are committed to repository
   - Check file paths in `app.py`
   - Ensure models directory structure is correct

### Debug Commands

```bash
# Check if models exist
ls -la models/

# Test locally before deployment
python app.py

# Check requirements
pip install -r requirements.txt
```

## 🔧 Advanced Configuration

### Custom Domain (Optional)
1. Go to Railway project settings
2. Add custom domain
3. Configure DNS records
4. Update frontend with new domain

### Environment-Specific Variables
```env
# Production
NODE_ENV=production
PORT=5000

# Development
NODE_ENV=development
DEBUG=true
```

### Scaling
- Railway automatically handles scaling
- Monitor resource usage in dashboard
- Upgrade plan if needed for higher traffic

## 📈 Performance Optimization

### Production Optimizations
- Models are pre-loaded on startup
- Gunicorn with multiple workers
- Proper timeout configurations
- Health check monitoring

### Monitoring
- Track API response times
- Monitor memory usage
- Check error rates
- Review user feedback

## 🎯 Next Steps

1. **Deploy to Railway** using this guide
2. **Test all endpoints** to ensure functionality
3. **Update frontend** with new API URL
4. **Monitor performance** and user feedback
5. **Set up monitoring** and alerts

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all configuration files
3. Test endpoints individually
4. Review this guide for troubleshooting steps

Your ML backend should now be successfully deployed on Railway! 🎉
