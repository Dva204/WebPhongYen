/**
 * Auth Controller
 * Handles authentication HTTP requests
 */
const authService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');
const jwtUtil = require('../utils/jwt');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: jwtUtil.getRefreshTokenExpiry(),
        path: '/api/auth',
      });

      ApiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: jwtUtil.getRefreshTokenExpiry(),
        path: '/api/auth',
      });

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);

      // Clear cookie
      res.clearCookie('refreshToken', { path: '/api/auth' });

      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshToken(refreshToken);

      // Set new refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: jwtUtil.getRefreshTokenExpiry(),
        path: '/api/auth',
      });

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      ApiResponse.success(res, { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      ApiResponse.success(res, { user }, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
