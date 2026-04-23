/**
 * Cart Repository
 * Data access layer for Cart model
 */
const BaseRepository = require('./BaseRepository');
const Cart = require('../models/Cart');

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  /**
   * Find cart by userId and populate product details
   */
  async findByUser(userId) {
    return Cart.findOne({ userId })
      .populate('items.productId', 'name price image stock isActive')
      .lean();
  }

  /**
   * Find or create cart for a user
   */
  async findOrCreateByUser(userId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart;
  }

  /**
   * Add or update an item in the cart (atomic upsert on items array)
   */
  async upsertItem(userId, item) {
    // Try to update existing item first
    const updated = await Cart.findOneAndUpdate(
      { userId, 'items.productId': item.productId },
      {
        $inc: { 'items.$.quantity': item.quantity },
        $set: {
          'items.$.price': item.price,
          'items.$.name': item.name,
          'items.$.image': item.image,
        },
      },
      { new: true }
    );

    if (updated) return updated;

    // Item doesn't exist — push new item (upsert cart doc if needed)
    return Cart.findOneAndUpdate(
      { userId },
      {
        $push: { items: item },
      },
      { new: true, upsert: true }
    );
  }

  /**
   * Set exact quantity for a specific product in cart
   */
  async setItemQuantity(userId, productId, quantity) {
    return Cart.findOneAndUpdate(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
  }

  /**
   * Remove a specific item from cart
   */
  async removeItem(userId, productId) {
    return Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );
  }

  /**
   * Clear all items in cart
   */
  async clearCart(userId) {
    return Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );
  }
}

module.exports = new CartRepository();
