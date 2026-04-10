/**
 * Category Repository
 */
const BaseRepository = require('./BaseRepository');
const Category = require('../models/Category');
const { cache } = require('../configs/redis');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findActive() {
    const cacheKey = 'categories:active';
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const categories = await Category.find({ isActive: true })
      .sort('sortOrder name')
      .lean();

    if (categories) {
      await cache.set(cacheKey, categories, 3600);
    }
    return categories;
  }

  async findBySlug(slug) {
    return Category.findOne({ slug, isActive: true }).lean();
  }

  /**
   * Clear category caches
   */
  async clearCache() {
    await cache.del('categories:active');
  }

  // Override update methods to clear cache
  async create(data) {
    const category = await super.create(data);
    await this.clearCache();
    return category;
  }

  async updateById(id, data) {
    const category = await super.updateById(id, data);
    await this.clearCache();
    return category;
  }

  async deleteById(id) {
    const result = await super.deleteById(id);
    await this.clearCache();
    return result;
  }
}

module.exports = new CategoryRepository();
