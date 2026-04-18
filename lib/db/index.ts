import postgres from "postgres";

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
  extras: string | null;
  price_estimate: number | null;
  comment: string | null;
  contact_preference: string | null;
  status: string;
  source: string;
  reminder_sent: number;
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
  extra_photos: string | null;
  is_approved: number;
  created_at: string;
}

let _sql: ReturnType<typeof postgres> | null = null;
let _initialized = false;

export async function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const isInternal = url.includes(".railway.internal");
    _sql = postgres(url, {
      ssl: isInternal ? false : { rejectUnauthorized: false },
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  if (!_initialized) {
    await initSchema(_sql);
    _initialized = true;
  }
  return _sql;
}

async function initSchema(sql: ReturnType<typeof postgres>) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      telegram_id TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      tg_username TEXT,
      tg_user_id TEXT,
      phone TEXT,
      created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
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
      reminder_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')),
      updated_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_telegram_id TEXT,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      service_name TEXT,
      text TEXT NOT NULL,
      photo_url TEXT,
      extra_photos TEXT,
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS'))
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_telegram_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_reminder ON bookings(reminder_sent, status);
    CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved, created_at);
  `);

  // Non-destructive migrations
  const migrations = [
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS extra_photos TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent INTEGER DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tg_username TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tg_user_id TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS tg_username TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS tg_user_id TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'callback'`,
  ];

  for (const m of migrations) {
    try { await sql.unsafe(m); } catch { /* already exists */ }
  }
}
