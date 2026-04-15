import path from "path";
import fs from "fs";

export interface Booking {
  id: number;
  user_telegram_id: string | null;
  name: string;
  phone: string;
  service_slug: string;
  service_name: string | null;
  booking_date: string;
  booking_time: string;
  address: string | null;
  rooms: number | null;
  area: number | null;
  extras: string | null;
  price_estimate: number | null;
  comment: string | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: number;
  telegram_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  created_at: string;
}

// Lazy singleton
let _db: import("better-sqlite3").Database | null = null;

export function getDb(): import("better-sqlite3").Database {
  if (_db) return _db;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DB_PATH ?? path.join(dataDir, "primeclean.db");
  _db = new Database(dbPath) as import("better-sqlite3").Database;
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initSchema(_db);
  return _db;
}

function initSchema(db: import("better-sqlite3").Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_telegram_id TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service_slug TEXT NOT NULL,
      service_name TEXT,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      address TEXT,
      rooms INTEGER,
      area INTEGER,
      extras TEXT,
      price_estimate REAL,
      comment TEXT,
      status TEXT DEFAULT 'new',
      source TEXT DEFAULT 'website',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_telegram_id TEXT,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      service_name TEXT,
      text TEXT NOT NULL,
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
