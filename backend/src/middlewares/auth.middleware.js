/**
 * Auth Middleware
 * JWT verification and role-based access control
 */
const jwtUtil = require('../utils/jwt');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Authenticate user via JWT access token
 * Checks Authorization header: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('Access token required. Please login.'));
    }

    // Verify token
    const decoded = jwtUtil.verifyAccessToken(token);
    if (!decoded) {
      return next(AppError.unauthorized('Invalid or expired access token'));
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(AppError.unauthorized('User no longer exists or is deactivated'));
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(AppError.unauthorized('Authentication failed'));
  }
};

/**
 * Authorize by role
 * Usage: authorize('admin') or authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwtUtil.verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = {
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email,
          };
        }
      }
    }
  } catch {
    // Silently continue without auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
