/**
 * Cart Service
 * Business logic for shopping cart management
 */
const cartRepository = require('../repositories/CartRepository');
const productRepository = require('../repositories/ProductRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class CartService {
  /**
   * Get current user's cart with computed totals
   */
  async getCart(userId) {
    const cart = await cartRepository.findByUser(userId);

    if (!cart) {
      return { items: [], totalPrice: 0, totalItems: 0 };
    }

    // Remove any items whose product is no longer active/available
    const validItems = cart.items.filter(
      (item) => item.productId && item.productId.isActive !== false
    );

    const totalPrice = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      _id: cart._id,
      items: validItems,
      totalPrice: Math.round(totalPrice),
      totalItems,
    };
  }

  /**
   * Add an item to the cart (increase qty if product already exists)
   */
  async addItem(userId, productId, quantity = 1) {
    // Validate product exists and is available
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Sản phẩm không tồn tại');
    }
    if (!product.isActive) {
      throw AppError.badRequest('Sản phẩm không còn bán');
    }
    if (product.stock < quantity) {
      throw AppError.badRequest(
        `Không đủ hàng. Tồn kho: ${product.stock}`
      );
    }

    const itemPayload = {
      productId: product._id,
      quantity,
      name: product.name,
      price: product.price,
      image: product.image || '',
    };

    const cart = await cartRepository.upsertItem(userId, itemPayload);

    logger.info(`Cart: user ${userId} added product ${productId} x${quantity}`);

    return this._formatCart(cart);
  }

  /**
   * Update quantity of a specific item
   */
  async updateItem(userId, productId, quantity) {
    if (quantity < 1) {
      throw AppError.badRequest('Số lượng phải ít nhất là 1');
    }

    // Validate stock
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Sản phẩm không tồn tại');
    }
    if (product.stock < quantity) {
      throw AppError.badRequest(
        `Không đủ hàng. Tồn kho: ${product.stock}`
      );
    }

    const cart = await cartRepository.setItemQuantity(userId, productId, quantity);
    if (!cart) {
      throw AppError.notFound('Sản phẩm không có trong giỏ hàng');
    }

    return this._formatCart(cart);
  }

  /**
   * Remove one item from the cart
   */
  async removeItem(userId, productId) {
    const cart = await cartRepository.removeItem(userId, productId);
    if (!cart) {
      throw AppError.notFound('Sản phẩm không có trong giỏ hàng');
    }

    logger.info(`Cart: user ${userId} removed product ${productId}`);
    return this._formatCart(cart);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId) {
    const cart = await cartRepository.clearCart(userId);
    logger.info(`Cart: user ${userId} cleared cart`);
    return this._formatCart(cart);
  }

  /**
   * Format cart document into standard response shape
   * @private
   */
  _formatCart(cart) {
    if (!cart) return { items: [], totalPrice: 0, totalItems: 0 };

    const items = cart.items || [];
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      _id: cart._id,
      items,
      totalPrice: Math.round(totalPrice),
      totalItems,
    };
  }
}

module.exports = new CartService();
