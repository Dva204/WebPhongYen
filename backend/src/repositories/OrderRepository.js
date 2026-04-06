/**
 * Order Repository
 * Data access layer for Order model
 */
const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Find orders by user with pagination
   */
  async findByUser(userId, options = {}) {
    return this.paginate({
      ...options,
      filter: { user: userId },
      sort: '-createdAt',
    });
  }

  /**
   * Find order by ID with populated user and product refs
   */
  async findByIdPopulated(orderId) {
    return Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image price');
  }

  /**
   * Get all orders (admin) with pagination
   */
  async findAllAdmin(options = {}) {
    const { status, startDate, endDate, ...rest } = options;
    const filter = {};

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return this.paginate({
      ...rest,
      filter,
      sort: '-createdAt',
      populate: 'user',
    });
  }

  /**
   * Update order status
   */
  async updateStatus(orderId, status) {
    return Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
  }

  /**
   * Dashboard statistics
   */
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const [totalOrders, monthlyRevenue, dailyOrders, statusBreakdown, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.find()
        .sort('-createdAt')
        .limit(10)
        .populate('user', 'name email'),
    ]);

    return {
      totalOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      dailyOrders,
      statusBreakdown: statusBreakdown.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      recentOrders,
    };
  }

  /**
   * Revenue chart data (last 7 days)
   */
  async getRevenueChart(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Top selling products
   */
  async getTopProducts(limit = 5) {
    return Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);
  }
}

module.exports = new OrderRepository();
