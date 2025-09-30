# Production Environment Setup Guide

## Overview
This guide helps you configure your Mental Health Companion app for production deployment with Neon PostgreSQL and Railway ML backend.

## Required Environment Variables

### For Vercel Deployment (Frontend)

Set these environment variables in your Vercel dashboard:

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# ML Backend Configuration (Railway)
NEXT_PUBLIC_ML_API_URL=https://your-ml-backend.railway.app/api

# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-32-chars-minimum

# Security Keys
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key-here

# Environment
NODE_ENV=production
```

### For Railway Deployment (ML Backend)

Set these environment variables in your Railway dashboard:

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False

# Server Configuration
PORT=5000
HOST=0.0.0.0

# Security
SECRET_KEY=your-production-secret-key-here

# CORS Configuration
CORS_ORIGINS=https://your-app.vercel.app
```

## Setup Steps

### 1. Neon PostgreSQL Setup

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Update the `DATABASE_URL` in both Vercel and Railway

### 2. Railway ML Backend Setup

1. Create a Railway account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `ml_backend` folder
4. Set the environment variables listed above
5. Copy the deployment URL and update `NEXT_PUBLIC_ML_API_URL` in Vercel

### 3. Vercel Frontend Setup

1. Connect your GitHub repository to Vercel
2. Set all environment variables in the Vercel dashboard
3. Deploy the application

## Database Migration

After setting up Neon PostgreSQL:

1. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Testing Connections

### Test Database Connection
```bash
# Test from your local machine
npx prisma db pull
```

### Test ML Backend Connection
```bash
# Test health endpoint
curl https://your-ml-backend.railway.app/api/health

# Test sentiment analysis
curl -X POST https://your-ml-backend.railway.app/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I am feeling great today!"}'
```

## Security Considerations

1. **Never commit real credentials** to your repository
2. **Use strong, unique secrets** for production
3. **Enable SSL/TLS** for all connections
4. **Set up proper CORS** origins
5. **Use environment-specific configurations**

## Monitoring

### Database Monitoring
- Monitor connection pool usage in Neon dashboard
- Set up alerts for connection failures
- Monitor query performance

### ML Backend Monitoring
- Monitor response times in Railway dashboard
- Set up health checks
- Monitor error rates

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify SSL mode is set to 'require'
   - Check Neon project status

2. **ML Backend Not Responding**
   - Check Railway deployment logs
   - Verify environment variables
   - Test health endpoint

3. **CORS Errors**
   - Update CORS_ORIGINS in Railway
   - Check NEXTAUTH_URL matches your domain

### Support Resources

- [Neon Documentation](https://neon.tech/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Next Steps

1. Set up monitoring and alerting
2. Configure backup strategies
3. Implement rate limiting
4. Set up CI/CD pipelines
5. Configure custom domains
