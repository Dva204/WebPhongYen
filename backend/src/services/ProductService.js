/**
 * Product Service
 * Business logic for product management with Redis caching
 */
const productRepository = require('../repositories/ProductRepository');
const { cache } = require('../configs/redis');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const Ingredient = require('../models/Ingredient');

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

    // Calculate dynamic stock for each product
    for (let product of result.data) {
      product.stock = await this._calculateRecipeStock(product);
    }

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

    const product = await productRepository.findById(id, 'category recipe.ingredient');
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    // Calculate dynamic stock
    product.stock = await this._calculateRecipeStock(product);

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

  /**
   * Calculates the maximum possible stock for a product based on its recipe and ingredient stocks.
   */
  async _calculateRecipeStock(product) {
    if (!product.recipe || product.recipe.length === 0) {
      return product.stock || 0; // Fallback to manual stock if no recipe
    }

    let minStock = Infinity;

    for (const item of product.recipe) {
      // If recipe is populated, use item.ingredient.stock, else fetch it
      let ingredientStock = 0;
      if (item.ingredient && typeof item.ingredient === 'object' && 'stock' in item.ingredient) {
        ingredientStock = item.ingredient.stock;
      } else {
        const ingredient = await Ingredient.findById(item.ingredient);
        ingredientStock = ingredient ? ingredient.stock : 0;
      }

      const possibleQty = Math.floor(ingredientStock / item.quantity);
      if (possibleQty < minStock) {
        minStock = possibleQty;
      }
    }

    return minStock === Infinity ? 0 : minStock;
  }
}

module.exports = new ProductService();
