import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "wokaima.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    region TEXT,
    product TEXT,
    trade_in INTEGER DEFAULT 0,
    note TEXT,
    ref TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;