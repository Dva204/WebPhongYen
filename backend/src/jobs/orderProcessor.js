/**
 * Order Processor - BullMQ Worker
 * Handles async order processing tasks
 */
const { Worker } = require('bullmq');
const { connection } = require('../configs/bull');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * Start order processing worker
 */
const startOrderWorker = (io) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('Order worker bypassed in development');
    return null;
  }
  const worker = new Worker(
    'order-processing',
    async (job) => {
      const { name, data } = job;
      logger.info(`Processing job: ${name} (${job.id})`);

      switch (name) {
        case 'process-new-order': {
          const order = await Order.findById(data.orderId);
          const user = await User.findById(data.userId);

          if (order && user) {
            // Send confirmation email
            const template = emailTemplates.orderConfirmation(order, user);
            await sendEmail({
              to: user.email,
              ...template,
            });

            // Emit real-time event
            if (io) {
              io.to(`user:${data.userId}`).emit('order:created', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
              });
            }

            // Auto-confirm after 1 second (simulate)
            await Order.findByIdAndUpdate(data.orderId, { status: 'confirmed' });

            if (io) {
              io.to(`user:${data.userId}`).emit('order:statusUpdate', {
                orderId: order._id,
                status: 'confirmed',
              });
            }
          }
          break;
        }

        case 'order-status-update': {
          const order = await Order.findById(data.orderId);
          const user = await User.findById(data.userId);

          if (order && user) {
            // Send status update email
            const template = emailTemplates.orderStatusUpdate(order, user, data.status);
            await sendEmail({
              to: user.email,
              ...template,
            });

            // Emit real-time event
            if (io) {
              io.to(`user:${data.userId}`).emit('order:statusUpdate', {
                orderId: order._id,
                status: data.status,
              });
            }
          }
          break;
        }

        default:
          logger.warn(`Unknown job type: ${name}`);
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job failed: ${job?.id}`, err.message);
  });

  logger.info('Order worker started');
  return worker;
};

module.exports = { startOrderWorker };
