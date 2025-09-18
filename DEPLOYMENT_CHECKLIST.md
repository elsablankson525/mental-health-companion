# Deployment Checklist

## Pre-Deployment
- [ ] Set up Supabase/Neon database
- [ ] Deploy ML backend to Railway/Render
- [ ] Update environment variables
- [ ] Test database connection
- [ ] Test ML backend endpoints

## Database Setup
- [ ] Create new Supabase/Neon project
- [ ] Copy connection string
- [ ] Run: npx prisma db push
- [ ] Run: npx prisma db seed (optional)

## ML Backend Deployment
- [ ] Push code to GitHub
- [ ] Connect Railway/Render to GitHub repo
- [ ] Set root directory to 'ml_backend'
- [ ] Deploy and get URL
- [ ] Test health endpoint

## Frontend Deployment
- [ ] Connect Vercel to GitHub repo
- [ ] Set environment variables in Vercel
- [ ] Deploy
- [ ] Test all features

## Post-Deployment Testing
- [ ] Test user registration/login
- [ ] Test mood tracking
- [ ] Test journal entries
- [ ] Test ML recommendations
- [ ] Test password reset
- [ ] Check database data

## Security
- [ ] Use strong secrets
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure rate limiting

## Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor database usage
- [ ] Check ML backend logs
- [ ] Set up error tracking
