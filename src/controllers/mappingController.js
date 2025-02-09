const DatabaseModel = require('../models/database');

class MappingController {
  static async saveMapping(req, res) {
    try {
      const { customLabel, standardLabelId } = req.body;
      const userId = req.session.userId;

      await DatabaseModel.saveCustomMapping(customLabel, standardLabelId, userId);
      
      const standardLabels = await DatabaseModel.getAllStandardLabels();
      const mappings = await DatabaseModel.getMappings(userId);

      res.render('partials/label-mapping', {
        labels: req.session.excelLabels || [],
        standardLabels,
        mappings,
        error: null
      });
    } catch (error) {
      console.error('Error saving mapping:', error);
      res.status(500).send('Error saving mapping');
    }
  }

  static async deleteMapping(req, res) {
    try {
      const userId = req.session.userId;
      await DatabaseModel.deleteMapping(req.params.id, userId);
      
      const standardLabels = await DatabaseModel.getAllStandardLabels();
      const mappings = await DatabaseModel.getMappings(userId);

      res.render('partials/label-mapping', {
        labels: req.session.excelLabels || [],
        standardLabels,
        mappings,
        error: null
      });
    } catch (error) {
      console.error('Error deleting mapping:', error);
      res.status(500).send('Error deleting mapping');
    }
  }
}

module.exports = MappingController;