# Enhanced Authentication System Setup Guide

This guide will help you set up the enhanced authentication system with email/password authentication and comprehensive security features.

## 🚀 Quick Start

### 1. Run the Setup Script

**Windows:**
```bash
scripts\setup-enhanced-auth.bat
```

**Linux/Mac:**
```bash
node scripts/setup-enhanced-auth.js
```

### 2. Configure Environment Variables

Update your `.env` file with the following required variables:

```bash
# Authentication
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"



# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mental_health_companion"
```

### 3. Start the Application

```bash
npm run dev
```

## 🔧 Detailed Setup Instructions



### Database Setup

The setup script will automatically:
- Generate Prisma client
- Push the database schema
- Seed the database with initial data

If you need to do this manually:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 🔐 Authentication Methods

### 1. Email/Password Authentication
- Traditional login with email and password
- Password strength validation (8+ chars, mixed case, numbers, special chars)
- bcrypt hashing with salt rounds
- Account lockout after 5 failed attempts



## 🛡️ Security Features

### Rate Limiting
- **Global**: 100 requests per 15 minutes per IP
- **Login**: 5 attempts per 15 minutes per email

### Account Protection
- Account lockout after failed attempts
- Progressive delays for repeated failures
- Login attempt logging and monitoring
- Session security with JWT tokens

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Content-Security-Policy
- X-XSS-Protection

### Data Protection
- Input sanitization and validation
- SQL injection prevention
- CSRF protection
- Secure password requirements
- Encrypted sensitive data

## 📱 User Interface

### Sign In Page
- Email/Password form
- Real-time validation and feedback

### Sign Up Page
- Email/Password registration
- Password strength indicator

## 🔍 Testing the Authentication

### Test Email/Password Login
1. Go to `/auth/signin`
2. Enter valid credentials
3. Verify successful login

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database credentials



**Rate Limiting Issues**
- Wait for rate limit window to reset
- Check IP address restrictions
- Verify rate limit configuration

### Debug Mode

Enable debug mode in development:

```bash
NODE_ENV=development
```

This will:
- Show detailed error messages
- Enable NextAuth debug mode

## 📊 Monitoring and Logs

### Login Attempts
All login attempts are logged with:
- User ID (if known)
- Email used
- IP address
- User agent
- Success/failure status
- Timestamp

### Rate Limiting
Rate limit violations are tracked and logged for security monitoring.


## 🔄 Production Deployment

### Environment Variables
Update these for production:

```bash
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-32-chars-minimum"
DATABASE_URL="postgresql://user:pass@prod-db:5432/db"
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Configure proper CORS origins
- [ ] Enable database SSL connections
- [ ] Set up proper logging and monitoring
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up intrusion detection

### Performance Considerations
- Use Redis for rate limiting in production
- Implement database connection pooling
- Set up proper caching strategies
- Monitor API response times
- Implement proper error handling

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Database Documentation](https://www.prisma.io/docs/)
- [Security Best Practices](SECURITY.md)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the SECURITY.md file for security considerations
3. Check the application logs for error details
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed

For additional help, refer to the main project documentation or create an issue in the project repository.
