/**
 * Rate Limiter Middleware
 * Redis-based rate limiting to prevent abuse
 */
const rateLimit = require('express-rate-limit');
const env = require('../configs/env');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: env.isDev ? 1000 : env.RATE_LIMIT_MAX, // 1000 requests per window for dev
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isDev ? 100 : 10, // 100 login attempts per window for dev
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict for password reset / registration
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, strictLimiter };
