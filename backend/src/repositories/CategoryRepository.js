/**
 * Category Repository
 */
const BaseRepository = require('./BaseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findActive() {
    return Category.find({ isActive: true }).sort('sortOrder name');
  }

  async findBySlug(slug) {
    return Category.findOne({ slug, isActive: true });
  }
}

module.exports = new CategoryRepository();
