# Mental Health Companion - Production Deployment Guide

This guide will help you deploy your Mental Health Companion app to production with Vercel (frontend) and Railway/Render (ML backend), using a cloud PostgreSQL database.

## 🚀 Quick Start

### 1. Database Setup (Supabase/Neon)

#### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > Database
3. Copy the connection string (it will look like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)
4. Save this as your `DATABASE_URL`

#### Option B: Neon
1. Go to [neon.tech](https://neon.tech) and create a new project
2. Copy the connection string from the dashboard
3. Save this as your `DATABASE_URL`

### 2. Deploy ML Backend (Railway)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" > "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Choose the `ml_backend` folder as the root directory
5. Add environment variables:
   - `PORT`: 5000
   - `NODE_ENV`: production
6. Deploy and copy the generated URL (e.g., `https://your-app.railway.app`)

### 3. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project" > "Import Git Repository"
3. Connect your GitHub account and select this repository
4. Configure environment variables in Vercel dashboard:

```env
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key-here

# ML Backend
NEXT_PUBLIC_ML_API_URL=https://your-ml-backend.railway.app/api

# Security
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key-here

# Environment
NODE_ENV=production
```

5. Deploy!

## 📋 Detailed Setup Instructions

### Database Migration

After setting up your cloud database, run the migration:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database (optional)
npm run db:seed
```

### Environment Variables

Create a `.env.local` file for local development:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mental_health_companion"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production-must-be-32-chars-minimum"

# ML Backend
NEXT_PUBLIC_ML_API_URL="http://localhost:5000/api"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key-here"
JWT_SECRET="your-jwt-secret-key-here"

# Environment
NODE_ENV="development"
```

### ML Backend Deployment

The ML backend is configured to work with:
- **Railway**: Uses `Procfile` and `requirements.txt`
- **Render**: Uses `Procfile` and `requirements.txt`
- **Heroku**: Uses `Procfile` and `requirements.txt`

#### Railway Deployment Steps:
1. Connect GitHub repository
2. Select `ml_backend` as root directory
3. Railway will automatically detect Python and install dependencies
4. Set environment variables in Railway dashboard
5. Deploy!

#### Render Deployment Steps:
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Set root directory to `ml_backend`
6. Deploy!

### Frontend Deployment

The frontend is optimized for Vercel with:
- `vercel.json` configuration
- Environment variables setup
- Build optimizations

#### Vercel Deployment Steps:
1. Connect GitHub repository
2. Vercel will auto-detect Next.js
3. Set environment variables
4. Deploy!

## 🔧 Configuration Files

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

### ML Backend Requirements (`ml_backend/requirements.txt`)
```
Flask==3.0.0
Flask-CORS==4.0.0
pandas==2.1.4
numpy==1.24.3
scikit-learn==1.3.2
joblib==1.3.2
textblob==0.17.1
nltk==3.8.1
vaderSentiment==3.3.2
gunicorn==21.2.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
```

### ML Backend Procfile (`ml_backend/Procfile`)
```
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120
```

## 🧪 Testing Your Deployment

### 1. Test ML Backend
```bash
curl https://your-ml-backend.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "models_loaded": {
    "mood_predictor": true,
    "scaler": true,
    "vectorizer": true
  }
}
```

### 2. Test Frontend
1. Visit your Vercel URL
2. Try signing up/signing in
3. Test mood tracking
4. Test journal entries
5. Check if ML recommendations are working

### 3. Test Database Connection
1. Go to your app's dashboard
2. Create a mood entry
3. Check if it appears in your Supabase/Neon dashboard

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly

### Database Security
- Use connection pooling
- Enable SSL connections
- Set up proper user permissions

### API Security
- Implement rate limiting
- Add CORS configuration
- Use HTTPS everywhere

## 📊 Monitoring and Maintenance

### Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor performance and errors

### Database Monitoring
- Use Supabase/Neon dashboard for database metrics
- Set up alerts for high usage

### ML Backend Monitoring
- Monitor Railway/Render logs
- Set up health checks
- Monitor API response times

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if DATABASE_URL is correct
npx prisma db push

# Test connection
npx prisma studio
```

#### ML Backend Not Responding
```bash
# Check Railway/Render logs
# Verify environment variables
# Test health endpoint
curl https://your-ml-backend.railway.app/api/health
```

#### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Build locally
npm run build
```

### Getting Help

1. Check Vercel deployment logs
2. Check Railway/Render logs
3. Check database connection
4. Verify environment variables
5. Test API endpoints individually

## 🎉 Success!

Once everything is deployed and working:

1. **Frontend**: `https://your-app.vercel.app`
2. **ML Backend**: `https://your-ml-backend.railway.app`
3. **Database**: Managed by Supabase/Neon

Your Mental Health Companion app is now live and ready for users! 🚀

## 📈 Next Steps

1. Set up custom domain (optional)
2. Configure email services for notifications
3. Add monitoring and analytics
4. Set up automated backups
5. Implement CI/CD pipeline
6. Add more ML features
7. Scale based on usage

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
