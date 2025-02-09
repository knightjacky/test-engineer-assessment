const ExcelService = require('../services/excelService');
const DatabaseModel = require('../models/database');

class UploadController {
  static async handleUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      const { labels, financialData } = ExcelService.processExcelFile(req.file.path);

      // Store data in session and database
      req.session.excelLabels = labels;
      await DatabaseModel.saveFinancialData(financialData, req.session.userId);

      const standardLabels = await DatabaseModel.getAllStandardLabels();
      const mappings = await DatabaseModel.getMappings(req.session.userId);
      
      res.render('partials/label-mapping', { 
        labels: req.session.excelLabels,
        standardLabels,
        mappings,
        error: null
      });
    } catch (error) {
      console.error('Excel processing error:', error);
      res.status(400).send('Error processing file');
    }
  }
}

module.exports = UploadController;