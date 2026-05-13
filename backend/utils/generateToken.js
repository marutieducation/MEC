const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get JWT secrets with rotation support
const getJwtSecrets = () => {
  const secrets = [];
  
  // Primary secret
  if (process.env.JWT_SECRET) {
    secrets.push(process.env.JWT_SECRET);
  }
  
  // Backup secrets for rotation
  if (process.env.JWT_SECRET_BACKUP_1) {
    secrets.push(process.env.JWT_SECRET_BACKUP_1);
  }
  
  if (process.env.JWT_SECRET_BACKUP_2) {
    secrets.push(process.env.JWT_SECRET_BACKUP_2);
  }
  
  // Fallback for development
  if (secrets.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 CRITICAL: JWT_SECRET is missing in production!');
      throw new Error('Server configuration error - JWT_SECRET required in production');
    } else {
      console.warn('⚠️  JWT_SECRET missing, using development fallback');
      const fallbackSecret = process.env.JWT_FALLBACK_SECRET || crypto.randomBytes(64).toString('hex');
      secrets.push(fallbackSecret);
      console.warn('🔧 Development JWT secret generated. Set JWT_SECRET in production!');
    }
  }
  
  return secrets;
};

const generateToken = (id) => {
  const secrets = getJwtSecrets();
  const primarySecret = secrets[0];
  
  // Validate JWT secret strength
  if (primarySecret.length < 32) {
    console.warn('⚠️  JWT_SECRET is too short, consider using a stronger secret');
  }

  // Default to 1 hour for security. Override with JWT_EXPIRE env var if needed
  const expiresIn = process.env.JWT_EXPIRE || '1h';

  try {
    return jwt.sign({ id }, primarySecret, {
      expiresIn,
      issuer: 'mec-uafms',
      audience: 'mec-users',
      algorithm: 'HS256',
      keyid: 'primary' // Key ID for rotation tracking
    });
  } catch (error) {
    console.error('🚨 JWT signing failed:', error.message);
    throw new Error('Token generation failed');
  }
};

// Verify token with multiple secrets (for rotation support)
const verifyToken = (token) => {
  const secrets = getJwtSecrets();
  const errors = [];
  
  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret, {
        issuer: 'mec-uafms',
        audience: 'mec-users',
        algorithms: ['HS256']
      });
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  // If all secrets failed, throw the last error
  throw new Error(`Token verification failed: ${errors.join(', ')}`);
};

module.exports = { generateToken, verifyToken, getJwtSecrets };
