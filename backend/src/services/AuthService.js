/**
 * Auth Service
 * Business logic for authentication (register, login, logout, refresh)
 */
const userRepository = require('../repositories/UserRepository');
const jwtUtil = require('../utils/jwt');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register new user
   */
  async register({ name, email, password, phone }) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    // Create user
    const user = await userRepository.create({ name, email, password, phone });

    // Generate tokens
    const payload = { id: user._id, role: user.role };
    const tokens = jwtUtil.generateTokens(payload);

    // Save refresh token
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    logger.info(`New user registered: ${email}`);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user with password
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw AppError.forbidden('Account is deactivated');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const payload = { id: user._id, role: user.role };
    const tokens = jwtUtil.generateTokens(payload);

    // Save refresh token
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
      ...tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw AppError.unauthorized('Refresh token required');
    }

    // Verify refresh token
    const decoded = jwtUtil.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    // Find user with this refresh token
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    // Generate new tokens
    const payload = { id: user._id, role: user.role };
    const tokens = jwtUtil.generateTokens(payload);

    // Update refresh token
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const allowedFields = ['name', 'phone', 'address'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) updateData[field] = data[field];
    });

    const user = await userRepository.updateById(userId, updateData);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
