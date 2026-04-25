const dashboardService = require('../services/DashboardService');
const logger = require('../utils/logger');

class DashboardController {
  /**
   * Get financial statistics
   * GET /api/dashboard/finance
   */
  async getFinanceStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await dashboardService.getFinanceStats(startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error(`Error in getFinanceStats: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new DashboardController();
