import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

function checkSecret(req: NextRequest): boolean {
  if (!CRON_SECRET) return true;
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  return (
    req.headers.get("x-cron-secret") === CRON_SECRET ||
    url.searchParams.get("secret") === CRON_SECRET ||
    auth?.slice(7) === CRON_SECRET
  );
}

async function sendDocument(chatId: string, filename: string, content: string, caption: string) {
  if (!BOT_TOKEN) return false;
  const blob = new Blob([content], { type: "application/json" });
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  form.append("document", blob, filename);
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: form,
  });
  return r.ok;
}

export async function GET(req: NextRequest) {
  if (!checkSecret(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!ADMIN_CHAT_ID) return NextResponse.json({ error: "TELEGRAM_ADMIN_CHAT_ID not set" }, { status: 500 });

  try {
    const sql = await getDb();

    const [bookings, reviews, users] = await Promise.all([
      sql`SELECT * FROM bookings ORDER BY created_at DESC`,
      sql`SELECT * FROM reviews ORDER BY created_at DESC`,
      sql`SELECT * FROM users ORDER BY created_at DESC`,
    ]);

    const now = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Minsk" });
    const dateTag = new Date().toISOString().slice(0, 10);

    const backup = {
      exported_at: now,
      bookings,
      reviews,
      users,
    };

    const json = JSON.stringify(backup, null, 2);

    await sendDocument(
      ADMIN_CHAT_ID,
      `primeclean_backup_${dateTag}.json`,
      json,
      `🗄 <b>Бэкап PrimeClean</b> — ${now}\n\n` +
      `📋 Заявок: <b>${bookings.length}</b>\n` +
      `⭐ Отзывов: <b>${reviews.length}</b>\n` +
      `👤 Пользователей: <b>${users.length}</b>`
    );

    return NextResponse.json({ ok: true, bookings: bookings.length, reviews: reviews.length, users: users.length });
  } catch (err) {
    console.error("[cron/backup]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return GET(req); }
