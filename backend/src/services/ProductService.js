/**
 * Product Service
 * Business logic for product management with Redis caching
 */
const productRepository = require('../repositories/ProductRepository');
const { cache } = require('../configs/redis');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Cache keys
const CACHE_PREFIX = 'products';
const CACHE_TTL = 300; // 5 minutes

class ProductService {
  /**
   * Get all products with filters and pagination
   */
  async getProducts(query = {}) {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      search,
      tags,
    } = query;

    // Try cache for simple queries (no filters)
    const cacheKey = `${CACHE_PREFIX}:list:${page}:${limit}:${sort}:${category || ''}:${search || ''}`;
    if (!minPrice && !maxPrice && !tags) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    const result = await productRepository.findWithFilters(
      { category, minPrice, maxPrice, search, tags },
      { page: parseInt(page), limit: parseInt(limit), sort }
    );

    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL);

    return result;
  }

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    const cacheKey = `${CACHE_PREFIX}:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cached;
    }

    const product = await productRepository.findById(id, 'category');
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    await cache.set(cacheKey, product, CACHE_TTL);
    return product;
  }

  /**
   * Get featured products
   */
  async getFeatured() {
    const cacheKey = `${CACHE_PREFIX}:featured`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const products = await productRepository.findFeatured();
    await cache.set(cacheKey, products, CACHE_TTL);
    return products;
  }

  /**
   * Create product (admin)
   */
  async createProduct(data) {
    const product = await productRepository.create(data);
    await this._invalidateCache();
    logger.info(`Product created: ${product.name}`);
    return product;
  }

  /**
   * Update product (admin)
   */
  async updateProduct(id, data) {
    const product = await productRepository.updateById(id, data);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    await this._invalidateCache();
    await cache.del(`${CACHE_PREFIX}:${id}`);
    logger.info(`Product updated: ${product.name}`);
    return product;
  }

  /**
   * Delete product (admin)
   */
  async deleteProduct(id) {
    const product = await productRepository.deleteById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    await this._invalidateCache();
    await cache.del(`${CACHE_PREFIX}:${id}`);
    logger.info(`Product deleted: ${product.name}`);
    return product;
  }

  /**
   * Invalidate all product cache
   */
  async _invalidateCache() {
    await cache.delPattern(`${CACHE_PREFIX}:*`);
    logger.debug('Product cache invalidated');
  }
}

module.exports = new ProductService();
