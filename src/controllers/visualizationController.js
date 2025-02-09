const DatabaseModel = require('../models/database');

class VisualizationController {
  static async getVisualization(req, res) {
    try {
      const userId = req.session.userId;
      const data = await DatabaseModel.getFinancialData(userId);
      res.render('partials/visualization', { data });
    } catch (error) {
      console.error('Error loading financial data:', error);
      res.status(500).send('Error loading financial data');
    }
  }
}

module.exports = VisualizationController;