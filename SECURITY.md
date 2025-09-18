# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Mental Health Companion application.

## Authentication & Authorization

### Multi-Factor Authentication Options
- **Email/Password**: Traditional authentication with bcrypt hashing
- **Google OAuth**: Secure third-party authentication
- **Phone Number OTP**: SMS-based verification for enhanced security

### Security Features
- Rate limiting on login attempts (5 attempts per 15 minutes)
- Account lockout after failed attempts
- Session management with JWT tokens
- Secure password requirements (8+ chars, mixed case, numbers, special chars)
- Login attempt logging and monitoring

## Middleware Protection

### Route Protection
- Protected routes require authentication
- Automatic redirects for unauthenticated users
- Callback URL preservation for post-login redirects

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Enforces HTTPS
- `Content-Security-Policy` - Prevents XSS and injection attacks

## Rate Limiting

### Global Rate Limiting
- 100 requests per 15-minute window per IP
- Automatic cleanup of expired entries
- 429 status code for rate limit exceeded

### Authentication Rate Limiting
- 5 login attempts per 15 minutes per email/phone
- Account lockout after max attempts
- Progressive delays for repeated failures

### OTP Rate Limiting
- 5 OTP requests per hour per phone number
- 1-minute cooldown between requests
- Maximum 3 verification attempts per OTP

## Data Protection

### Password Security
- bcrypt hashing with salt rounds (12)
- Password strength validation
- Secure password requirements enforcement

### Input Sanitization
- HTML tag removal
- JavaScript protocol blocking
- Event handler removal
- SQL injection prevention through Prisma ORM

### Data Encryption
- Sensitive data hashing with SHA-256
- Secure random string generation
- Environment variable protection

## Database Security

### User Data Protection
- Phone number normalization and validation
- Email format validation
- Unique constraints on email and phone
- Soft deletion for audit trails

### Login Monitoring
- Comprehensive login attempt logging
- IP address and user agent tracking
- Success/failure reason tracking
- Automatic cleanup of old logs

## OTP Security

### Code Generation
- Cryptographically secure random numbers
- 6-digit codes with 5-minute expiry
- Single-use codes with attempt limits
- Automatic cleanup of expired codes

### SMS Security
- Phone number validation and normalization
- Rate limiting on SMS requests
- Secure code transmission
- Development mode logging (production uses real SMS)

## Session Security

### JWT Configuration
- 30-day maximum session duration
- 24-hour session update interval
- Secure token generation
- Automatic session refresh

### Session Management
- Secure session ID generation
- Session invalidation on logout
- Cross-site request forgery (CSRF) protection
- Secure cookie configuration

## API Security

### Endpoint Protection
- Authentication required for protected endpoints
- Input validation on all endpoints
- Error handling without information leakage
- Request logging and monitoring

### CORS Configuration
- Restricted origin policies
- Secure header handling
- Preflight request handling

## Environment Security

### Required Environment Variables
```bash
# Authentication
NEXTAUTH_SECRET="32-character-minimum-secret"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# SMS Service (Twilio recommended)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Security
ENCRYPTION_KEY="32-character-encryption-key"
JWT_SECRET="your-jwt-secret"
```

### Production Security Checklist
- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Configure proper CORS origins
- [ ] Enable database SSL connections
- [ ] Set up proper logging and monitoring
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up intrusion detection
- [ ] Configure proper error handling
- [ ] Enable security headers

## Monitoring & Logging

### Security Events Logged
- Login attempts (success/failure)
- Account lockouts
- Rate limit violations
- OTP requests and verifications
- Authentication method usage
- Session creation and destruction

### Log Retention
- Login logs: 90 days
- OTP codes: 5 minutes (automatic cleanup)
- Rate limit data: 15 minutes (automatic cleanup)
- Session data: 30 days

## Incident Response

### Security Incident Procedures
1. Immediate account lockout for suspicious activity
2. Log analysis for attack patterns
3. Rate limit adjustments if needed
4. User notification for security events
5. Database audit for compromised accounts

### Recovery Procedures
- Account unlock after verification
- Password reset with OTP verification
- Session invalidation and re-authentication
- Data integrity verification

## Compliance Considerations

### Data Privacy
- Minimal data collection
- Secure data storage
- User consent for data processing
- Right to data deletion

### Mental Health Data Protection
- Encrypted storage of sensitive health data
- Access controls for health information
- Audit trails for data access
- Secure data transmission

## Security Testing

### Recommended Tests
- Penetration testing
- Authentication bypass attempts
- Rate limiting validation
- Input validation testing
- Session security testing
- OTP security validation

### Automated Security Checks
- Dependency vulnerability scanning
- Code security analysis
- Environment variable validation
- Database security configuration
- API endpoint security testing

## Updates and Maintenance

### Regular Security Tasks
- Dependency updates
- Security patch application
- Log analysis and review
- Rate limit tuning
- User access review
- Security configuration audit

### Emergency Procedures
- Immediate security patch deployment
- Account lockout procedures
- Service shutdown procedures
- Data backup and recovery
- Incident communication protocols

---

**Note**: This security implementation provides a strong foundation, but security is an ongoing process. Regular reviews, updates, and testing are essential to maintain security posture.
