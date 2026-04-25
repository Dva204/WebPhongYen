const Order = require('../models/Order');

class DashboardService {
  /**
   * Gets financial statistics including revenue, COGS, and profit.
   * Uses MongoDB aggregation for performance.
   */
  async getFinanceStats(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Only count placed orders (not cancelled)
    matchStage.status = { $ne: 'cancelled' };

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalPrice' },
          cogs: { $sum: '$totalCost' },
          profit: { $sum: '$profit' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          revenue: { $round: ['$revenue', 2] },
          cogs: { $round: ['$cogs', 2] },
          profit: { $round: ['$profit', 2] },
          orderCount: 1
        }
      }
    ]);

    return stats[0] || { revenue: 0, cogs: 0, profit: 0, orderCount: 0 };
  }
}

module.exports = new DashboardService();
