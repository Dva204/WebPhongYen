/**
 * Review Repository
 * Data access layer for Review model
 */
const BaseRepository = require('./BaseRepository');
const Review = require('../models/Review');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  /**
   * Get paginated reviews for a product, newest first
   */
  async findByProduct(productId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ productId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ productId }),
    ]);

    return {
      data: reviews,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find a review by user + product (to check for duplicates or editing)
   */
  async findByUserAndProduct(userId, productId) {
    return Review.findOne({ userId, productId }).lean();
  }

  /**
   * Calculate average rating and count for a product
   */
  async getProductRatingStats(productId) {
    const result = await Review.aggregate([
      { $match: { productId: productId } },
      {
        $group: {
          _id: '$productId',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (!result.length) return { average: 0, count: 0 };
    return {
      average: Math.round(result[0].average * 10) / 10, // 1 decimal place
      count: result[0].count,
    };
  }
}

module.exports = new ReviewRepository();
