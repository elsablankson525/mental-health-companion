const crypto = require('crypto');

console.log('🔐 Generated Secure Secrets for Mental Health Companion');
console.log('======================================================\n');

const nextAuthSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy these to your .env.local file:');
console.log('====================================');
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log('\n⚠️  Keep these secrets secure and never commit them to version control!');
