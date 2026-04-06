/**
 * BullMQ configuration
 * Queue for async order processing
 */
const { Queue, Worker } = require('bullmq');
const env = require('./env');
const logger = require('../utils/logger');

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

if (env.REDIS_PASSWORD) {
  connection.password = env.REDIS_PASSWORD;
}

// Order processing queue
let orderQueue = null;

const getOrderQueue = () => {
  if (env.NODE_ENV === 'development') {
      logger.info('BullMQ disabled in development (mocked)');
      return { add: async () => ({ id: 'mock-job-id' }) };
  }

  if (!orderQueue) {
    orderQueue = new Queue('order-processing', { connection });
    logger.info('BullMQ order queue initialized');
  }
  return orderQueue;
};

/**
 * Add job to order queue
 */
const addOrderJob = async (jobName, data, opts = {}) => {
  try {
    if (env.NODE_ENV === 'development') {
      logger.info(`Mocked order job: ${jobName}`);
      return { id: 'mock' };
    }
    const queue = getOrderQueue();
    const job = await queue.add(jobName, data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      ...opts,
    });
    logger.info(`Order job added: ${job.id} - ${jobName}`);
    return job;
  } catch (error) {
    logger.error('Failed to add order job:', error.message);
    return null;
  }
};

module.exports = { connection, getOrderQueue, addOrderJob };
