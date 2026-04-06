/**
 * Product Controller
 * Handles product HTTP requests
 */
const productService = require('../services/ProductService');
const ApiResponse = require('../utils/ApiResponse');

class ProductController {
  /**
   * GET /api/products
   */
  async getProducts(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);
      ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/featured
   */
  async getFeatured(req, res, next) {
    try {
      const products = await productService.getFeatured();
      ApiResponse.success(res, { products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   */
  async getProduct(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      ApiResponse.success(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products (admin)
   */
  async createProduct(req, res, next) {
    try {
      // Handle image upload
      if (req.file) {
        req.body.image = req.file.path && req.file.path.startsWith('http')
          ? req.file.path
          : `/uploads/${req.file.filename}`;
      }

      const product = await productService.createProduct(req.body);
      ApiResponse.created(res, { product }, 'Product created');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id (admin)
   */
  async updateProduct(req, res, next) {
    try {
      if (req.file) {
        req.body.image = req.file.path && req.file.path.startsWith('http')
          ? req.file.path
          : `/uploads/${req.file.filename}`;
      }

      const product = await productService.updateProduct(req.params.id, req.body);
      ApiResponse.success(res, { product }, 'Product updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id (admin)
   */
  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      ApiResponse.success(res, null, 'Product deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
