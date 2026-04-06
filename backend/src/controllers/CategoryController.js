/**
 * Category Controller
 */
const categoryService = require('../services/CategoryService');
const ApiResponse = require('../utils/ApiResponse');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAll();
      ApiResponse.success(res, { categories });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(req.params.id);
      ApiResponse.success(res, { category });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body);
      ApiResponse.created(res, { category });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      ApiResponse.success(res, { category }, 'Category updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id);
      ApiResponse.success(res, null, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
