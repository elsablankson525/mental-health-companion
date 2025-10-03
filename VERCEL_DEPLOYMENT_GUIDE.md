# Vercel Deployment Guide

This guide will help you deploy your Mental Health Companion app to Vercel with both the Next.js frontend and Python ML backend.

## Prerequisites

1. Vercel account (free tier available)
2. GitHub repository with your code
3. Neon PostgreSQL database (or any PostgreSQL database)

## Step 1: Prepare Environment Variables

### Generate Production Secrets

```bash
npm run secrets:generate
```

This will generate secure secrets and update your `.env.production` file.

### Required Environment Variables

Set these in your Vercel dashboard:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generated secret for NextAuth
- `NEXTAUTH_URL` - Your production domain (e.g., `https://your-app.vercel.app`)
- `ENCRYPTION_KEY` - Generated encryption key
- `JWT_SECRET` - Generated JWT secret
- `NEXT_PUBLIC_ML_API_URL` - Your ML backend URL (set after ML deployment)
- `NODE_ENV` - Set to `production`

## Step 2: Deploy the Main Application

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Step 3: Deploy the ML Backend

### Create a separate Vercel project for ML backend

1. Navigate to ML backend directory:
```bash
cd ml_backend
```

2. Deploy ML backend:
```bash
vercel --prod
```

3. Note the deployment URL (e.g., `https://your-ml-backend.vercel.app`)

### Update ML Backend URL

1. Go to your main app's Vercel dashboard
2. Update `NEXT_PUBLIC_ML_API_URL` to your ML backend URL
3. Redeploy the main app

## Step 4: Database Setup

### Run Prisma Migrations

1. In your main app's Vercel dashboard, go to Functions tab
2. Create a new function to run migrations:

```javascript
// api/migrate.js
const { execSync } = require('child_process');

export default async function handler(req, res) {
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    res.status(200).json({ message: 'Migration completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

3. Visit `https://your-app.vercel.app/api/migrate` to run migrations

## Step 5: Verify Deployment

### Test Main Application

1. Visit your app URL
2. Test authentication (sign up/sign in)
3. Test core features (mood tracking, journal, etc.)

### Test ML Backend

1. Visit `https://your-ml-backend.vercel.app/api/health`
2. Should return health status

### Test Integration

1. In your app, try mood prediction features
2. Check browser console for any errors
3. Verify API calls are working

## Troubleshooting

### Common Issues

#### 1. Internal Server Error (500)

**Causes:**
- Missing environment variables
- Database connection issues
- Prisma client not generated

**Solutions:**
- Check all environment variables are set
- Verify database connection string
- Run `npx prisma generate` before deployment

#### 2. Authentication Errors

**Causes:**
- Wrong NEXTAUTH_URL
- Missing NEXTAUTH_SECRET
- Database connection issues

**Solutions:**
- Set NEXTAUTH_URL to your production domain
- Generate new NEXTAUTH_SECRET
- Check database connectivity

#### 3. ML Backend Connection Issues

**Causes:**
- Wrong ML backend URL
- CORS issues
- ML backend not deployed

**Solutions:**
- Verify ML backend URL is correct
- Check CORS configuration in ML backend
- Ensure ML backend is deployed and accessible

#### 4. Database Connection Issues

**Causes:**
- Wrong DATABASE_URL
- Database not accessible
- Connection pooling issues

**Solutions:**
- Verify DATABASE_URL format
- Check database accessibility
- Consider connection pooling settings

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test database connection
vercel env pull .env.local
npx prisma db push

# Test ML backend locally
cd ml_backend
python app.py
curl http://localhost:5000/api/health
```

## Performance Optimization

### For Production

1. **Enable Vercel Analytics**:
   - Add `@vercel/analytics` to your app
   - Monitor performance and errors

2. **Database Optimization**:
   - Use connection pooling
   - Optimize queries
   - Add proper indexes

3. **Caching**:
   - Implement Redis for session storage
   - Cache frequently accessed data

4. **CDN**:
   - Use Vercel's global CDN
   - Optimize images and static assets

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to version control
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **Database Security**:
   - Use SSL connections
   - Implement proper access controls
   - Regular security updates

3. **API Security**:
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS everywhere

## Monitoring and Maintenance

1. **Set up monitoring**:
   - Vercel Analytics
   - Error tracking (Sentry)
   - Uptime monitoring

2. **Regular maintenance**:
   - Update dependencies
   - Monitor database performance
   - Review logs regularly

3. **Backup strategy**:
   - Regular database backups
   - Code repository backups
   - Environment variable backups

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review this guide
3. Check GitHub issues
4. Contact support if needed

Remember to test thoroughly in a staging environment before deploying to production!
