const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');
const { DB_PATH, STANDARD_LABELS } = require('../config/database');

const DB_DIR = path.dirname(DB_PATH);

class DatabaseModel {
  static async getDb() {
    if (!DatabaseModel.db) {
      // Ensure directory exists with proper permissions
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true, mode: 0o755 });
      }

      // Remove stale lock file if it exists
      const lockFile = `${DB_PATH}.lock`;
      if (fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
        } catch (err) {
          console.warn('Could not remove stale lock file:', err);
        }
      }

      // Open database with proper configuration
      DatabaseModel.db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        timeout: 6000, // Increase timeout for busy connections
      });

      // Enable WAL mode for better concurrency
      await DatabaseModel.db.exec('PRAGMA journal_mode = WAL');
      await DatabaseModel.db.exec('PRAGMA busy_timeout = 6000');
      await DatabaseModel.db.exec('PRAGMA foreign_keys = ON');
    }
    return DatabaseModel.db;
  }

  static async initialize() {
    try {
      const db = await this.getDb();
      
      // Create tables
      await this._createTables(db);
      await this._insertStandardLabels(db);
      
      return true;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  static async _createTables(db) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS standard_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS custom_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        custom_label TEXT NOT NULL,
        standard_label_id INTEGER,
        user_id TEXT NOT NULL,
        FOREIGN KEY (standard_label_id) REFERENCES standard_labels(id),
        UNIQUE(custom_label, user_id)
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS financial_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        custom_label TEXT NOT NULL,
        value REAL NOT NULL,
        period_date TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  static async _insertStandardLabels(db) {
    const count = await db.get('SELECT COUNT(*) as count FROM standard_labels');
    
    if (count.count === 0) {
      const stmt = await db.prepare(
        'INSERT INTO standard_labels (label, category, description) VALUES (?, ?, ?)'
      );

      for (const [label, category, description] of STANDARD_LABELS) {
        await stmt.run(label, category, description);
      }
    }
  }

  static async getAllStandardLabels() {
    const db = await this.getDb();
    return db.all('SELECT * FROM standard_labels ORDER BY category, label');
  }

  static async getMappings(userId) {
    const db = await this.getDb();
    return db.all(`
      SELECT 
        cm.id,
        cm.custom_label,
        sl.label as standard_label,
        sl.category
      FROM custom_mappings cm
      JOIN standard_labels sl ON cm.standard_label_id = sl.id
      WHERE cm.user_id = ?
      ORDER BY sl.category, sl.label
    `, userId);
  }

  static async saveCustomMapping(customLabel, standardLabelId, userId) {
    const db = await this.getDb();
    return db.run(`
      INSERT INTO custom_mappings (custom_label, standard_label_id, user_id)
      VALUES (?, ?, ?)
      ON CONFLICT(custom_label, user_id) 
      DO UPDATE SET standard_label_id = excluded.standard_label_id
    `, customLabel, standardLabelId, userId);
  }

  static async deleteMapping(mappingId, userId) {
    const db = await this.getDb();
    return db.run(
      'DELETE FROM custom_mappings WHERE id = ? AND user_id = ?',
      mappingId, userId
    );
  }

  static async saveFinancialData(data, userId) {
    const db = await this.getDb();
    await db.run('BEGIN TRANSACTION');

    try {
      await db.run('DELETE FROM financial_data WHERE user_id = ?', userId);

      const stmt = await db.prepare(`
        INSERT INTO financial_data (custom_label, value, period_date, user_id)
        VALUES (?, ?, ?, ?)
      `);

      for (const { custom_label, value, period_date } of data) {
        await stmt.run(custom_label, value, period_date, userId);
      }

      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  }

  static async getFinancialData(userId) {
    const db = await this.getDb();
    return db.all(`
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
    `, userId);
  }
}

module.exports = DatabaseModel;