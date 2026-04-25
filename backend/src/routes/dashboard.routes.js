const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All dashboard routes are restricted to admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/finance', dashboardController.getFinanceStats);

module.exports = router;
