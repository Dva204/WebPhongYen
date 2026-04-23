/**
 * Review Controller
 * Handles HTTP requests for the product review API
 */
const reviewService = require('../services/ReviewService');
const ApiResponse = require('../utils/ApiResponse');

class ReviewController {
  /**
   * POST /api/reviews
   * Create a new review for a product
   * Body: { productId, rating, comment }
   */
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.id, req.body);
      ApiResponse.created(res, { review }, 'Đánh giá của bạn đã được ghi nhận');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/reviews/:id
   * Update own review
   * Body: { rating?, comment? }
   */
  async updateReview(req, res, next) {
    try {
      const review = await reviewService.updateReview(
        req.params.id,
        req.user.id,
        req.body
      );
      ApiResponse.success(res, { review }, 'Đánh giá đã được cập nhật');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Delete own review
   */
  async deleteReview(req, res, next) {
    try {
      const result = await reviewService.deleteReview(req.params.id, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id/reviews
   * Get paginated reviews for a product (public)
   */
  async getProductReviews(req, res, next) {
    try {
      const result = await reviewService.getProductReviews(
        req.params.id,
        req.query
      );
      ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
