const rateLimit = require('express-rate-limit');

// General rate limiter (for most endpoints)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// Very strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for development
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skipFailedRequests: false
});

// Registration rate limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  message: { message: 'Too many account creations. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password reset requests per hour
  message: { message: 'Too many password reset attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// Payment rate limiter
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment operations per 15 minutes
  message: { message: 'Too many payment operations. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: { message: 'Too many file uploads. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// API search rate limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: { message: 'Too many search requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// Admin operations rate limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 admin operations per 15 minutes
  message: { message: 'Too many admin operations. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

module.exports = {
  generalLimiter,
  strictLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  paymentLimiter,
  uploadLimiter,
  searchLimiter,
  adminLimiter
};
