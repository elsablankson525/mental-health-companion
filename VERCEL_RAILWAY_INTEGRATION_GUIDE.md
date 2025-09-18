# 🔗 Vercel + Railway Integration Guide

This guide will help you connect your frontend (deployed on Vercel) with your ML backend (deployed on Railway).

## 📋 Prerequisites

- ✅ Frontend deployed on Vercel
- ✅ ML Backend deployed on Railway
- ✅ Railway URL for your ML backend

## 🚀 Step-by-Step Integration

### 1. Get Your Railway ML Backend URL

Your Railway deployment URL should look like:
- `https://mental-health-companion-production-xxxx.up.railway.app`
- Or `https://your-app-name.railway.app`

**Your ML API base URL will be**: `https://your-railway-url.railway.app/api`

### 2. Update Vercel Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add/Update these variables**:

```env
# Production ML Backend URL (replace with your Railway URL)
NEXT_PUBLIC_ML_API_URL=https://your-railway-url.railway.app/api

# Production NextAuth URL (replace with your Vercel URL)
NEXTAUTH_URL=https://your-app.vercel.app

# Production secrets (generate new secure ones)
NEXTAUTH_SECRET=your-production-secret-32-chars-minimum
ENCRYPTION_KEY=your-production-encryption-key-32-chars
JWT_SECRET=your-production-jwt-secret

# Database (your existing Supabase/Neon URL)
DATABASE_URL=your-production-database-url

# Environment
NODE_ENV=production
```

### 3. Test the Connection

Run the integration test script:

```bash
# Set your Railway URL
export NEXT_PUBLIC_ML_API_URL="https://your-railway-url.railway.app/api"

# Run the test
node scripts/test-railway-integration.js
```

### 4. Redeploy Your Frontend

After updating environment variables:

1. **Trigger a new deployment** in Vercel
2. **Or push a new commit** to trigger automatic deployment
3. **Wait for deployment** to complete

### 5. Verify Full Integration

Test your deployed frontend:

1. **Visit your Vercel URL**
2. **Test ML features**:
   - Mood tracking
   - Sentiment analysis
   - Chat interface
   - Insights dashboard

## 🧪 Testing Your Integration

### Manual Testing

Test these endpoints directly:

```bash
# Health check
curl https://your-railway-url.railway.app/api/health

# Sentiment analysis
curl -X POST https://your-railway-url.railway.app/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I am feeling great today!"}'

# Mood prediction
curl -X POST https://your-railway-url.railway.app/api/predict-mood \
  -H "Content-Type: application/json" \
  -d '{"emotions": ["happy", "excited"], "note": "Feeling great!"}'
```

### Frontend Testing

1. **Open your Vercel app**
2. **Navigate to mood tracker**
3. **Add a mood entry**
4. **Check if ML predictions work**
5. **Test chat interface**
6. **Verify insights dashboard**

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Railway backend has CORS enabled
   - Should work automatically

2. **Environment Variables Not Updated**
   - Check Vercel dashboard
   - Ensure variables are set for production
   - Redeploy after changes

3. **ML Backend Not Responding**
   - Check Railway deployment logs
   - Verify Railway URL is correct
   - Test Railway endpoints directly

4. **Authentication Issues**
   - Update NEXTAUTH_URL to your Vercel URL
   - Generate new production secrets
   - Check database connection

### Debug Steps

1. **Check Railway logs**:
   - Go to Railway dashboard
   - View deployment logs
   - Look for errors

2. **Check Vercel logs**:
   - Go to Vercel dashboard
   - View function logs
   - Check for API errors

3. **Test endpoints individually**:
   - Use curl or Postman
   - Verify each ML endpoint
   - Check response formats

## 📊 Monitoring

### Railway Monitoring

- **Deployment status**: Check Railway dashboard
- **Resource usage**: Monitor CPU/memory
- **Logs**: View real-time logs
- **Health checks**: Automatic monitoring

### Vercel Monitoring

- **Deployment status**: Check Vercel dashboard
- **Function logs**: View API logs
- **Performance**: Monitor response times
- **Errors**: Track error rates

## 🔄 Updates and Maintenance

### Updating ML Backend

1. **Make changes** to ML backend code
2. **Push to GitHub**
3. **Railway auto-deploys**
4. **Test endpoints**

### Updating Frontend

1. **Make changes** to frontend code
2. **Push to GitHub**
3. **Vercel auto-deploys**
4. **Test integration**

### Environment Variable Updates

1. **Update in Vercel dashboard**
2. **Redeploy frontend**
3. **Test changes**

## 🎯 Success Checklist

- [ ] Railway ML backend deployed and accessible
- [ ] Vercel environment variables updated
- [ ] Frontend redeployed with new variables
- [ ] Health check endpoint working
- [ ] Sentiment analysis working
- [ ] Mood prediction working
- [ ] Frontend ML features functional
- [ ] No CORS errors
- [ ] Authentication working
- [ ] Database connection stable

## 📞 Support

If you encounter issues:

1. **Check Railway logs** for backend errors
2. **Check Vercel logs** for frontend errors
3. **Test endpoints** individually
4. **Verify environment variables**
5. **Check network connectivity**

## 🎉 Next Steps

Once integration is complete:

1. **Monitor performance**
2. **Collect user feedback**
3. **Optimize ML models**
4. **Scale as needed**
5. **Add new features**

Your Mental Health Companion is now fully integrated with ML capabilities! 🚀
