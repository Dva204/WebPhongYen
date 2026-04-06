/**
 * Server Entry Point
 * Starts Express server with MongoDB, Redis, Socket.io, and BullMQ
 */
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./configs/env');
const connectDB = require('./configs/db');
const { connectRedis } = require('./configs/redis');
const { setupSocket } = require('./sockets/orderSocket');
const { startOrderWorker } = require('./jobs/orderProcessor');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    if (env.NODE_ENV === 'development') {
      const { seedDatabase } = require('./seeds/seed');
      await seedDatabase();
    }

    // Connect to Redis (graceful fallback if unavailable)
    await connectRedis();

    // Create HTTP server
    const server = http.createServer(app);

    // Setup Socket.io
    const io = new Server(server, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
    });

    setupSocket(io);

    // Make io accessible in routes if needed
    app.set('io', io);

    // Start BullMQ worker
    try {
      startOrderWorker(io);
    } catch (err) {
      logger.warn('BullMQ worker failed to start (Redis may not be available):', err.message);
    }

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════╗
║     🍔 FastFood Pro API Server          ║
║                                          ║
║   Port:        ${env.PORT}                     ║
║   Environment: ${env.NODE_ENV.padEnd(20)}  ║
║   MongoDB:     Connected                 ║
║   API:         http://localhost:${env.PORT}/api  ║
╚══════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
