import path from "path";
import fs from "fs";

export interface Booking {
  id: number;
  user_telegram_id: string | null;
  tg_username: string | null;
  tg_user_id: string | null;
  name: string;
  phone: string;
  service_slug: string;
  service_name: string | null;
  booking_date: string;
  booking_time: string;
  address: string | null;
  rooms: number | null;
  area: number | null;
  extras: string | null; // JSON object: { "windows": 2, "balcony": 1 }
  price_estimate: number | null;
  comment: string | null;
  contact_preference: string | null; // "callback" | "chat" | null
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
  tg_username: string | null;
  tg_user_id: string | null;
  phone: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  user_telegram_id: string | null;
  author_name: string;
  rating: number;
  service_name: string | null;
  text: string;
  photo_url: string | null;
  is_approved: number;
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
  runMigrations(_db);
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
      tg_username TEXT,
      tg_user_id TEXT,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_telegram_id TEXT,
      tg_username TEXT,
      tg_user_id TEXT,
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
      contact_preference TEXT DEFAULT 'callback',
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
      photo_url TEXT,
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Non-destructive migrations for existing databases
function runMigrations(db: import("better-sqlite3").Database) {
  const migrations = [
    `ALTER TABLE reviews ADD COLUMN photo_url TEXT`,
    `ALTER TABLE bookings ADD COLUMN contact_preference TEXT DEFAULT 'callback'`,
    `ALTER TABLE bookings ADD COLUMN tg_username TEXT`,
    `ALTER TABLE bookings ADD COLUMN tg_user_id TEXT`,
    `ALTER TABLE users ADD COLUMN tg_username TEXT`,
    `ALTER TABLE users ADD COLUMN tg_user_id TEXT`,
  ];

  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists — safe to ignore
    }
  }
}
