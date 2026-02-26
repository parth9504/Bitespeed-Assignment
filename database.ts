//stores the schema of Contact...

import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

const db: Database = new sqlite3.Database('./contacts.db', (err) => {
  if (err) console.error('Database connection error:', err);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Contact (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phoneNumber TEXT,
      email TEXT,
      linkedId INTEGER,
      linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME
    )
  `);
});

export default db;