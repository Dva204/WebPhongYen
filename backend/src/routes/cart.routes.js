/**
 * Cart Routes
 * All routes are protected by JWT authentication
 *
 * GET    /api/cart               → Get current user cart
 * POST   /api/cart               → Add item (or increase qty)
 * PUT    /api/cart/:productId    → Set exact quantity for item
 * DELETE /api/cart/:productId    → Remove single item
 * DELETE /api/cart               → Clear entire cart
 */
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { addToCartSchema, updateCartItemSchema } = require('../validators/schemas');

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addItem);
router.put('/:productId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
