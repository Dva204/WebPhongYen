/**
 * Review Service
 * Business logic for product reviews and rating recalculation
 */
const reviewRepository = require('../repositories/ReviewRepository');
const productRepository = require('../repositories/ProductRepository');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class ReviewService {
  /**
   * Create a new review
   * - One review per user per product
   * - Recalculates product average rating afterward
   */
  async createReview(userId, data) {
    const { productId, rating, comment } = data;

    // Ensure product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Sản phẩm không tồn tại');
    }

    // Check duplicate
    const existing = await reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      throw AppError.badRequest('Bạn đã đánh giá sản phẩm này rồi. Hãy chỉnh sửa đánh giá hiện có.');
    }

    const review = await reviewRepository.create({
      userId,
      productId,
      rating,
      comment: comment || '',
    });

    // Update product rating stats
    await this._recalculateProductRating(productId);

    logger.info(`Review created: product ${productId} by user ${userId}, rating ${rating}`);

    // Return with user populated
    return await this._populateReview(review._id);
  }

  /**
   * Update an existing review (only by owner)
   */
  async updateReview(reviewId, userId, data) {
    const review = await reviewRepository.findById(reviewId, '', false);
    if (!review) {
      throw AppError.notFound('Đánh giá không tồn tại');
    }

    // Ownership check
    if (review.userId.toString() !== userId) {
      throw AppError.forbidden('Bạn không có quyền chỉnh sửa đánh giá này');
    }

    const updated = await reviewRepository.updateById(reviewId, {
      rating: data.rating !== undefined ? data.rating : review.rating,
      comment: data.comment !== undefined ? data.comment : review.comment,
    });

    // Recalculate product rating
    await this._recalculateProductRating(review.productId.toString());

    logger.info(`Review updated: ${reviewId} by user ${userId}`);

    return await this._populateReview(reviewId);
  }

  /**
   * Delete a review (only by owner)
   */
  async deleteReview(reviewId, userId) {
    const review = await reviewRepository.findById(reviewId, '', false);
    if (!review) {
      throw AppError.notFound('Đánh giá không tồn tại');
    }

    // Ownership check
    if (review.userId.toString() !== userId) {
      throw AppError.forbidden('Bạn không có quyền xoá đánh giá này');
    }

    const productId = review.productId.toString();
    await reviewRepository.deleteById(reviewId);

    // Recalculate product rating
    await this._recalculateProductRating(productId);

    logger.info(`Review deleted: ${reviewId} by user ${userId}`);

    return { message: 'Đánh giá đã được xoá' };
  }

  /**
   * Get reviews for a product (paginated, newest first)
   */
  async getProductReviews(productId, query = {}) {
    const { page = 1, limit = 10 } = query;

    // Ensure product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Sản phẩm không tồn tại');
    }

    return reviewRepository.findByProduct(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  /**
   * Recalculate and persist average rating on the Product document
   * @private
   */
  async _recalculateProductRating(productId) {
    const mongoose = require('mongoose');
    const objectId = mongoose.Types.ObjectId.isValid(productId)
      ? new mongoose.Types.ObjectId(productId)
      : productId;

    const stats = await reviewRepository.getProductRatingStats(objectId);

    await Product.findByIdAndUpdate(productId, {
      'rating.average': stats.average,
      'rating.count': stats.count,
    });

    logger.info(`Product ${productId} rating recalculated: avg=${stats.average}, count=${stats.count}`);
  }

  /**
   * Populate userId field for a review by ID
   * @private
   */
  async _populateReview(reviewId) {
    const Review = require('../models/Review');
    return Review.findById(reviewId).populate('userId', 'name').lean();
  }
}

module.exports = new ReviewService();
