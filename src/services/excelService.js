const XLSX = require('xlsx');

class ExcelService {
  static processExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const labels = [];
    const financialData = [];
    const periods = [];

    // Get period dates from header row
    for (let col = 1; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        // Convert Excel date number to ISO date string
        let date = cell.v;
        if (typeof date === 'number') {
          date = XLSX.SSF.format('yyyy-mm-dd', date);
        } else if (typeof date === 'string') {
          // Try to parse the date string and format it
          const parsed = new Date(date);
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString().split('T')[0];
          }
        }
        periods.push(date);
      }
    }

    let currentCategory = null;
    const labelsByCategory = new Map(); // Use Map to preserve insertion order

    // Process data rows
    for (let row = 1; row <= range.e.r; row++) {
      const labelCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      
      // Skip empty rows but continue processing
      if (!labelCell || !labelCell.v || typeof labelCell.v !== 'string' || !labelCell.v.trim()) {
        continue;
      }

      const label = labelCell.v.trim();

      // Check if this is a category row (no values in other columns)
      let isCategory = true;
      for (let col = 1; col <= range.e.c; col++) {
        const valueCell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (valueCell && valueCell.v !== null && valueCell.v !== undefined && valueCell.v !== '') {
          isCategory = false;
          break;
        }
      }

      if (isCategory) {
        currentCategory = label;
        if (!labelsByCategory.has(currentCategory)) {
          labelsByCategory.set(currentCategory, []);
        }
        continue;
      }

      // Add label with its category
      if (!labelsByCategory.has(currentCategory || 'Uncategorized')) {
        labelsByCategory.set(currentCategory || 'Uncategorized', []);
      }
      labelsByCategory.get(currentCategory || 'Uncategorized').push(label);

      // Get values for each period
      periods.forEach((period, index) => {
        const valueCell = worksheet[XLSX.utils.encode_cell({ r: row, c: index + 1 })];
        const value = valueCell && !isNaN(valueCell.v) ? parseFloat(valueCell.v) : 0;
        
        financialData.push({
          custom_label: label,
          custom_category: currentCategory || 'Uncategorized',
          period_date: period,
          value: value
        });
      });
    }

    // Convert Map entries to array of label objects maintaining order
    const orderedLabels = [];
    labelsByCategory.forEach((labels, category) => {
      labels.forEach(label => {
        orderedLabels.push({
          label,
          category
        });
      });
    });

    return {
      labels: orderedLabels,
      financialData
    };
  }
}

module.exports = ExcelService;