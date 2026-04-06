/**
 * Product Routes
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema, paginationSchema } = require('../validators/schemas');
const { uploadSingle } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', validate(paginationSchema, 'query'), productController.getProducts);
router.get('/featured', productController.getFeatured);
router.get('/:id', productController.getProduct);

// Admin routes
router.post('/',
  authenticate,
  authorize('admin'),
  uploadSingle,
  validate(createProductSchema),
  productController.createProduct
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  uploadSingle,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct
);

module.exports = router;
