/**
 * Review Routes
 *
 * POST   /api/reviews            → Create review (auth required)
 * PUT    /api/reviews/:id        → Update own review (auth required)
 * DELETE /api/reviews/:id        → Delete own review (auth required)
 *
 * Note: GET /api/products/:id/reviews is mounted in product.routes.js
 */
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ReviewController');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createReviewSchema, updateReviewSchema } = require('../validators/schemas');

// Create review — auth required
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview
);

// Update own review — auth required
router.put(
  '/:id',
  authenticate,
  validate(updateReviewSchema),
  reviewController.updateReview
);

// Delete own review — auth required
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
