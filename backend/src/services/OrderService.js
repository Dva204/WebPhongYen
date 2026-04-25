/**
 * Order Service
 * Business logic for order management with async processing
 */
const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');
const { addOrderJob } = require('../configs/bull');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const costService = require('./CostService');
const Ingredient = require('../models/Ingredient');

class OrderService {
  /**
   * Create new order
   */
  async createOrder(userId, orderData) {
    const { items, shippingAddress, paymentMethod, note } = orderData;

    // Validate and get product details
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw AppError.badRequest(`Product not found: ${item.productId}`);
      }
      if (!product.isActive) {
        throw AppError.badRequest(`Product is unavailable: ${product.name}`);
      }
      if (product.stock < item.quantity) {
        throw AppError.badRequest(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const orderItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      };

      orderItems.push(orderItem);
      totalPrice += product.price * item.quantity;

      // Check ingredient availability
      if (product.recipe && product.recipe.length > 0) {
        for (const recipeItem of product.recipe) {
          const ingredient = await Ingredient.findById(recipeItem.ingredient);
          const requiredQty = recipeItem.quantity * item.quantity;
          if (!ingredient || ingredient.stock < requiredQty) {
            throw AppError.badRequest(`Insufficient ingredients (${ingredient?.name || 'Unknown'}) for ${product.name}`);
          }
        }
      }
    }

    // Calculate costs and profit
    const totalCost = await costService.calculateOrderCosts(orderItems);
    const profit = totalPrice - totalCost;

    // Create order
    const order = await orderRepository.create({
      user: userId,
      items: orderItems,
      totalPrice,
      totalCost,
      profit,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      note,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 min
    });

    // Decrease INGREDIENT stock instead of PRODUCT stock
    for (const item of orderItems) {
      const product = await productRepository.findById(item.product);
      if (product.recipe && product.recipe.length > 0) {
        for (const recipeItem of product.recipe) {
          await Ingredient.findByIdAndUpdate(recipeItem.ingredient, {
            $inc: { stock: -(recipeItem.quantity * item.quantity) }
          });
        }
      }
    }

    // Add async job for email notification, etc.
    await addOrderJob('process-new-order', {
      orderId: order._id.toString(),
      userId,
    });

    logger.info(`Order created: ${order.orderNumber} by user ${userId}`);

    return order;
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId, query = {}) {
    const { page = 1, limit = 10 } = query;
    return orderRepository.findByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  /**
   * Get single order (verify ownership)
   */
  async getOrderById(orderId, userId, isAdmin = false) {
    const order = await orderRepository.findByIdPopulated(orderId);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    // Non-admin can only view own orders
    if (!isAdmin && order.user._id.toString() !== userId) {
      throw AppError.forbidden('Not authorized to view this order');
    }

    return order;
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(query = {}) {
    const { page = 1, limit = 20, status, startDate, endDate } = query;
    return orderRepository.findAllAdmin({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate,
      endDate,
    });
  }

  /**
   * Update order status (admin)
   */
  async updateStatus(orderId, status) {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
      throw AppError.badRequest(
        `Cannot change status from '${order.status}' to '${status}'`
      );
    }

    // If cancelled, restore stock
    if (status === 'cancelled') {
      await productRepository.restoreStock(order.items);
    }

    // If delivered, mark as paid (for cash orders)
    const updateData = { status };
    if (status === 'delivered' && order.paymentMethod === 'cash') {
      updateData.paymentStatus = 'paid';
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, updateData);

    // Add job for status notification
    await addOrderJob('order-status-update', {
      orderId: orderId.toString(),
      status,
      userId: order.user.toString(),
    });

    logger.info(`Order ${order.orderNumber} status: ${order.status} → ${status}`);

    return updatedOrder;
  }

  /**
   * Dashboard statistics (admin)
   */
  async getDashboardStats() {
    const [stats, revenueChart, topProducts] = await Promise.all([
      orderRepository.getStats(),
      orderRepository.getRevenueChart(7),
      orderRepository.getTopProducts(5),
    ]);

    return { ...stats, revenueChart, topProducts };
  }
}

module.exports = new OrderService();
