/**
 * Order Routes
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createOrderSchema, updateOrderStatusSchema, paginationSchema } = require('../validators/schemas');

// User routes (authenticated)
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/', authenticate, validate(paginationSchema, 'query'), orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrder);

// Admin routes
router.get('/admin/all',
  authenticate,
  authorize('admin'),
  validate(paginationSchema, 'query'),
  orderController.getAllOrders
);

router.put('/:id/status',
  authenticate,
  authorize('admin'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

module.exports = router;
