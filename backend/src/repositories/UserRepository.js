/**
 * User Repository
 * Data access layer for User model
 */
const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return User.findOne({ email }).select('+password +refreshToken');
  }

  async findByRefreshToken(refreshToken) {
    return User.findOne({ refreshToken }).select('+refreshToken');
  }

  async updateRefreshToken(userId, refreshToken) {
    return User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
  }

  async clearRefreshToken(userId) {
    return User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

module.exports = new UserRepository();
