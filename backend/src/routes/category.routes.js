/**
 * Category Routes
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCategorySchema } = require('../validators/schemas');

// Public
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Admin
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), categoryController.create);
router.put('/:id', authenticate, authorize('admin'), categoryController.update);
router.delete('/:id', authenticate, authorize('admin'), categoryController.delete);

module.exports = router;
