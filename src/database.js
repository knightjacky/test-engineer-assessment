const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/finance.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure data directory exists with proper permissions
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true, mode: 0o755 });
}

// Create database connection with proper configurations
const db = new Database(DB_PATH, { 
  verbose: console.log,
  fileMustExist: false
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

function setupDatabase() {
  return new Promise((resolve, reject) => {
    try {
      const standardLabels = [
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
      ];

      // Create tables
      db.transaction(() => {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS standard_labels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            description TEXT
          )
        `).run();

        db.prepare(`
          CREATE TABLE IF NOT EXISTS custom_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custom_label TEXT NOT NULL,
            standard_label_id INTEGER,
            user_id TEXT NOT NULL,
            FOREIGN KEY (standard_label_id) REFERENCES standard_labels(id),
            UNIQUE(custom_label, user_id)
          )
        `).run();

        db.prepare(`
          CREATE TABLE IF NOT EXISTS financial_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custom_label TEXT NOT NULL,
            value REAL NOT NULL,
            period_date TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        // Check if standard labels need to be inserted
        const count = db.prepare('SELECT COUNT(*) as count FROM standard_labels').get();
        
        if (count.count === 0) {
          const insert = db.prepare(
            'INSERT INTO standard_labels (label, category, description) VALUES (?, ?, ?)'
          );

          standardLabels.forEach(([label, category, description]) => {
            insert.run(label, category, description);
          });
        }
      })();

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Export database functions
module.exports = {
  setupDatabase,
  getAllStandardLabels: () => {
    const stmt = db.prepare('SELECT * FROM standard_labels ORDER BY category, label');
    return stmt.all();
  },
  getMappings: (userId) => {
    const stmt = db.prepare(`
      SELECT 
        cm.id,
        cm.custom_label,
        sl.label as standard_label,
        sl.category
      FROM custom_mappings cm
      JOIN standard_labels sl ON cm.standard_label_id = sl.id
      WHERE cm.user_id = ?
      ORDER BY sl.category, sl.label
    `);
    return stmt.all(userId);
  },
  saveCustomMapping: (customLabel, standardLabelId, userId) => {
    const stmt = db.prepare(`
      INSERT INTO custom_mappings (custom_label, standard_label_id, user_id)
      VALUES (?, ?, ?)
      ON CONFLICT(custom_label, user_id) 
      DO UPDATE SET standard_label_id = excluded.standard_label_id
    `);
    return stmt.run(customLabel, standardLabelId, userId);
  },
  deleteMapping: (mappingId, userId) => {
    const stmt = db.prepare(
      'DELETE FROM custom_mappings WHERE id = ? AND user_id = ?'
    );
    return stmt.run(mappingId, userId);
  },
  saveFinancialData: (data, userId) => {
    const deleteStmt = db.prepare('DELETE FROM financial_data WHERE user_id = ?');
    const insertStmt = db.prepare(`
      INSERT INTO financial_data (custom_label, value, period_date, user_id)
      VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      deleteStmt.run(userId);
      data.forEach(({ custom_label, value, period_date }) => {
        insertStmt.run(custom_label, value, period_date, userId);
      });
    })();
  },
  getFinancialData: (userId) => {
    const stmt = db.prepare(`
      SELECT 
        sl.label as standard_label,
        sl.category,
        fd.period_date,
        SUM(fd.value) as total_value
      FROM financial_data fd
      JOIN custom_mappings cm ON fd.custom_label = cm.custom_label AND fd.user_id = cm.user_id
      JOIN standard_labels sl ON cm.standard_label_id = sl.id
      WHERE fd.user_id = ?
      GROUP BY sl.label, fd.period_date
      ORDER BY sl.category, sl.label, fd.period_date
    `);
    return stmt.all(userId);
  }
};