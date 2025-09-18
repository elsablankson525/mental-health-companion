# Mental Health Companion - Complete Deployment Guide

## 🚀 Deployment Status

Your Mental Health Companion application is ready for deployment! Here's your complete deployment roadmap:

## 📋 Current Status
- ✅ Code pushed to GitHub: https://github.com/elsablankson525/mental-health-companion
- ✅ Build errors fixed (MLService export, Suspense boundary)
- ✅ Vercel configuration updated
- ✅ ML backend configured for deployment
- ⚠️ Frontend deployment needs Prisma client fix
- ⏳ ML backend needs deployment to Railway/Render
- ⏳ Database setup needed

## 🎯 Step-by-Step Deployment Plan

### 1. Deploy ML Backend (Priority: HIGH)

**Option A: Railway (Recommended)**
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository: `elsablankson525/mental-health-companion`
5. Set root directory to `ml_backend`
6. Railway will automatically detect Python and deploy
7. Copy the deployed URL (e.g., `https://your-app.railway.app`)

**Option B: Render**
1. Go to [Render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Set root directory to `ml_backend`
6. Use these settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120`

### 2. Set Up Production Database

**Option A: Supabase (Recommended)**
1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
5. Run migrations: `npx prisma db push`

**Option B: Neon**
1. Go to [Neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string
4. Run migrations: `npx prisma db push`

### 3. Deploy Frontend to Vercel

**Fix Prisma Issue First:**
```bash
# Add this to package.json build script:
"build": "prisma generate && next build"
```

**Deploy Steps:**
1. Go to [Vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your repository
5. Set environment variables (see below)
6. Deploy!

### 4. Environment Variables Setup

**For Vercel Frontend:**
```
NODE_ENV=production
NEXT_PUBLIC_ML_API_URL=https://your-ml-backend.railway.app/api
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-key
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

**For ML Backend (Railway/Render):**
```
FLASK_ENV=production
PORT=5000
```

## 🔧 Quick Fixes Needed

### Fix 1: Prisma Build Issue
```bash
# In package.json, change:
"build": "next build"
# To:
"build": "prisma generate && next build"
```

### Fix 2: Database Connection
- Set up Supabase/Neon database
- Update DATABASE_URL in environment variables
- Run `npx prisma db push` to create tables

## 🎉 Expected Results

After deployment, you'll have:
- **Frontend**: https://your-app.vercel.app
- **ML Backend**: https://your-ml-backend.railway.app
- **Database**: Connected and functional
- **Full Features**: Mood tracking, journaling, ML insights, etc.

## 🚨 Current Issues to Resolve

1. **Prisma Client**: Add `prisma generate` to build script
2. **Database**: Set up production PostgreSQL database
3. **ML Backend**: Deploy to Railway/Render
4. **Environment Variables**: Configure all production secrets

## 📞 Next Steps

1. **Deploy ML Backend** to Railway (5 minutes)
2. **Set up Database** on Supabase (5 minutes)
3. **Fix Prisma build** and deploy frontend (10 minutes)
4. **Configure environment variables** (5 minutes)
5. **Test full application** (5 minutes)

**Total Time**: ~30 minutes for complete deployment!

## 🆘 Need Help?

If you encounter any issues:
1. Check the deployment logs in Vercel/Railway
2. Verify environment variables are set correctly
3. Ensure database connection string is valid
4. Check that ML backend is responding at `/api/health`

Your application is 90% ready for deployment! Just need to complete these final steps.
