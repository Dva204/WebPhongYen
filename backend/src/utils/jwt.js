/**
 * JWT Utility Functions
 * Generate and verify access/refresh tokens
 */
const jwt = require('jsonwebtoken');
const env = require('../configs/env');

const jwtUtil = {
  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });
  },

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    });
  },

  /**
   * Generate both tokens
   */
  generateTokens(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (error) {
      return null;
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  },

  /**
   * Get token expiry for cookies
   */
  getRefreshTokenExpiry() {
    // Parse JWT_REFRESH_EXPIRY (e.g., '7d' -> 7 days in ms)
    const match = env.JWT_REFRESH_EXPIRY.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] || 86400000);
  },
};

module.exports = jwtUtil;
