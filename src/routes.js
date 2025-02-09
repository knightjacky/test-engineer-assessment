const express = require('express');
const multer = require('multer');
const path = require('path');
const UploadController = require('./controllers/uploadController');
const MappingController = require('./controllers/mappingController');
const VisualizationController = require('./controllers/visualizationController');
const DatabaseModel = require('./models/database');

function setupRoutes(app, upload) {
  // Home page
  app.get('/', async (req, res) => {
    try {
      const standardLabels = await DatabaseModel.getAllStandardLabels();
      res.render('index', { standardLabels });
    } catch (error) {
      console.error('Error loading standard labels:', error);
      res.status(500).send('Error loading standard labels');
    }
  });

  // Upload Excel file
  app.post('/upload', upload.single('file'), UploadController.handleUpload);

  // Save label mapping
  app.post('/mappings', MappingController.saveMapping);

  // Delete mapping
  app.delete('/mappings/:id', MappingController.deleteMapping);

  // Get financial data visualization
  app.get('/visualization', VisualizationController.getVisualization);
}

module.exports = { setupRoutes };