/**
 * Order Controller
 * Handles order HTTP requests
 */
const orderService = require('../services/OrderService');
const ApiResponse = require('../utils/ApiResponse');

class OrderController {
  /**
   * POST /api/orders
   */
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      
      // Real-time notification for admin
      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('order:new', order);
      }

      ApiResponse.created(res, { order }, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders (user's orders)
   */
  async getUserOrders(req, res, next) {
    try {
      const result = await orderService.getUserOrders(req.user.id, req.query);
      ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   */
  async getOrder(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      const order = await orderService.getOrderById(req.params.id, req.user.id, isAdmin);
      ApiResponse.success(res, { order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders (all orders - admin)
   */
  async getAllOrders(req, res, next) {
    try {
      const result = await orderService.getAllOrders(req.query);
      ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/orders/:id/status (admin)
   */
  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateStatus(req.params.id, req.body.status);
      
      // Real-time notification
      const io = req.app.get('io');
      if (io) {
        // Notify admin room
        io.to('admin').emit('order:updated', order);
        // Notify specific user room
        io.to(`user:${order.user._id || order.user}`).emit('order:status', {
          orderId: order._id,
          status: order.status
        });
        // Notify specific order room
        io.to(`order:${order._id}`).emit('order:refresh', order);
      }

      ApiResponse.success(res, { order }, `Order status updated to ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const stats = await orderService.getDashboardStats();
      ApiResponse.success(res, { stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
