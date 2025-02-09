const path = require('path');

module.exports = {
  DB_PATH: path.join(__dirname, '../../data/finance.db'),
  DB_OPTIONS: {
    verbose: console.log,
    fileMustExist: false
  },
  STANDARD_LABELS: [
    // Income Statement
    ['Revenue', 'Income Statement', 'Total revenue from operations'],
    ['Cost of Goods Sold', 'Income Statement', 'Direct costs of producing goods sold'],
    ['Gross Profit', 'Income Statement', 'Revenue minus cost of goods sold'],
    ['Operating Expenses', 'Income Statement', 'Expenses from normal operations'],
    ['Net Income', 'Income Statement', 'Total profit or loss for the period'],
    
    // Balance Sheet
    ['Cash and Equivalents', 'Balance Sheet', 'Liquid assets'],
    ['Accounts Receivable', 'Balance Sheet', 'Money owed by customers'],
    ['Inventory', 'Balance Sheet', 'Value of goods for sale'],
    ['Total Assets', 'Balance Sheet', 'Sum of all assets'],
    ['Total Liabilities', 'Balance Sheet', 'Sum of all liabilities'],
    
    // Cash Flow
    ['Operating Cash Flow', 'Cash Flow', 'Cash from core business operations'],
    ['Investing Cash Flow', 'Cash Flow', 'Cash from investment activities'],
    ['Financing Cash Flow', 'Cash Flow', 'Cash from financing activities']
  ]
};