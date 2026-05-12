const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('🚨 CRITICAL: JWT_SECRET is missing during token generation!');
    throw new Error('Server configuration error');
  }

  // Default to 1 hour for security. Override with JWT_EXPIRE env var if needed (e.g., '7d' for refresh tokens)
  const expiresIn = process.env.JWT_EXPIRE || '1h';

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = generateToken;
