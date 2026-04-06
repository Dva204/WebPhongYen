/**
 * Dashboard Routes (Admin)
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/dashboard', authenticate, authorize('admin'), orderController.getDashboard);

module.exports = router;
