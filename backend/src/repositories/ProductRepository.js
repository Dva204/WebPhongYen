/**
 * Product Repository
 * Data access layer for Product model with search capabilities
 */
const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Search products by text
   */
  async search(searchTerm, options = {}) {
    const filter = {
      $text: { $search: searchTerm },
      isActive: true,
      ...options.filter,
    };
    return this.paginate({ ...options, filter });
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId, options = {}) {
    const filter = { category: categoryId, isActive: true };
    return this.paginate({ ...options, filter, populate: 'category' });
  }

  /**
   * Get featured products
   */
  async findFeatured(limit = 8) {
    return Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug icon')
      .sort('-createdAt')
      .limit(limit);
  }

  /**
   * Find with filters (price range, category, etc.)
   */
  async findWithFilters(filters = {}, options = {}) {
    const query = { isActive: true };

    if (filters.category) query.category = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.tags) {
      query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
    }

    return this.paginate({
      ...options,
      filter: query,
      populate: 'category',
    });
  }

  /**
   * Decrease stock for order items
   */
  async decreaseStock(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.product, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    return Product.bulkWrite(bulkOps);
  }

  /**
   * Restore stock (for cancelled orders)
   */
  async restoreStock(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity } },
      },
    }));
    return Product.bulkWrite(bulkOps);
  }
}

module.exports = new ProductRepository();
