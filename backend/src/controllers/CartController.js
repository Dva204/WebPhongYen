/**
 * Cart Controller
 * Handles HTTP requests for the shopping cart API
 */
const cartService = require('../services/CartService');
const ApiResponse = require('../utils/ApiResponse');

class CartController {
  /**
   * GET /api/cart
   * Returns the current user's cart
   */
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.id);
      ApiResponse.success(res, { cart });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart
   * Add an item (or increase qty) in the cart
   * Body: { productId, quantity }
   */
  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addItem(req.user.id, productId, quantity);
      ApiResponse.created(res, { cart }, 'Đã thêm vào giỏ hàng');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cart/:productId
   * Set exact quantity for an item
   * Body: { quantity }
   */
  async updateItem(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateItem(req.user.id, productId, quantity);
      ApiResponse.success(res, { cart }, 'Cập nhật giỏ hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cart/:productId
   * Remove a single item from the cart
   */
  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const cart = await cartService.removeItem(req.user.id, productId);
      ApiResponse.success(res, { cart }, 'Đã xoá sản phẩm khỏi giỏ hàng');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cart
   * Clear all items from the cart
   */
  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user.id);
      ApiResponse.success(res, { cart }, 'Đã xoá giỏ hàng');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
