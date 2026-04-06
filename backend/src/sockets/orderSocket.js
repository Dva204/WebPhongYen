/**
 * Socket.io Configuration
 * Real-time order status updates
 */
const jwtUtil = require('../utils/jwt');
const logger = require('../utils/logger');

const setupSocket = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      // Allow unauthenticated connections (limited features)
      socket.user = null;
      return next();
    }

    const decoded = jwtUtil.verifyAccessToken(token);
    if (!decoded) {
      return next(new Error('Authentication failed'));
    }

    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user-specific room for personalized updates
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      logger.info(`User ${socket.user.id} joined room`);

      // Admin joins admin room
      if (socket.user.role === 'admin') {
        socket.join('admin');
        logger.info('Admin joined admin room');
      }
    }

    // Handle track order
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      logger.debug(`Socket tracking order: ${orderId}`);
    });

    // Handle untrack order
    socket.on('order:untrack', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} - ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error: ${socket.id}`, err.message);
    });
  });

  logger.info('Socket.io configured');
  return io;
};

module.exports = { setupSocket };
