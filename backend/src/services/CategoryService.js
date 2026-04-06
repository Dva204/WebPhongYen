/**
 * Category Service
 */
const categoryRepository = require('../repositories/CategoryRepository');
const { cache } = require('../configs/redis');
const AppError = require('../utils/AppError');

const CACHE_KEY = 'categories:all';
const CACHE_TTL = 600; // 10 minutes

class CategoryService {
  async getAll() {
    const cached = await cache.get(CACHE_KEY);
    if (cached) return cached;

    const categories = await categoryRepository.findActive();
    await cache.set(CACHE_KEY, categories, CACHE_TTL);
    return categories;
  }

  async getById(id) {
    return categoryRepository.findById(id);
  }

  async create(data) {
    const category = await categoryRepository.create(data);
    await cache.del(CACHE_KEY);
    return category;
  }

  async update(id, data) {
    const category = await categoryRepository.updateById(id, data);
    if (!category) throw AppError.notFound('Category not found');
    await cache.del(CACHE_KEY);
    return category;
  }

  async delete(id) {
    const category = await categoryRepository.deleteById(id);
    if (!category) throw AppError.notFound('Category not found');
    await cache.del(CACHE_KEY);
    return category;
  }
}

module.exports = new CategoryService();
