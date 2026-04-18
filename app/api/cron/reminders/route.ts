import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Runs every few minutes via external cron (Vercel Cron / cron-job.org / Railway cron).
// Finds bookings ~1h out that haven't been reminded yet, sends a TG message,
// and marks reminder_sent = 1 so the same booking is never reminded twice.
//
// Security: optionally gated by CRON_SECRET — passed either as header
// `x-cron-secret: <value>` or query `?secret=<value>`.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;

interface PendingBooking {
  id: number;
  user_telegram_id: string;
  service_name: string | null;
  booking_date: string;
  booking_time: string;
  address: string | null;
  name: string;
}

async function sendTg(chatId: string, text: string) {
  if (!BOT_TOKEN) return { ok: false, reason: "no_token" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, data };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
}

function checkSecret(req: NextRequest): boolean {
  if (!CRON_SECRET) return true; // No secret configured — allow
  const header = req.headers.get("x-cron-secret");
  const url = new URL(req.url);
  const query = url.searchParams.get("secret");
  const auth = req.headers.get("authorization");
  // Vercel Cron sets Authorization: Bearer <CRON_SECRET>
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return header === CRON_SECRET || query === CRON_SECRET || bearer === CRON_SECRET;
}

async function runReminders() {
  const db = getDb();

  // booking_date + booking_time are local strings. SQLite datetime('now') is UTC.
  // Use datetime(..., 'localtime') to compare safely, OR pass through our own clock.
  // Window: 55–65 minutes from now in local time.
  const rows = db
    .prepare(
      `SELECT id, user_telegram_id, service_name, booking_date, booking_time, address, name
       FROM bookings
       WHERE reminder_sent = 0
         AND status IN ('new','confirmed')
         AND user_telegram_id IS NOT NULL AND user_telegram_id != ''
         AND datetime(booking_date || ' ' || booking_time)
             BETWEEN datetime('now', 'localtime', '+55 minutes')
                 AND datetime('now', 'localtime', '+65 minutes')`
    )
    .all() as PendingBooking[];

  const results: Array<{ id: number; ok: boolean }> = [];
  const markSent = db.prepare(
    `UPDATE bookings SET reminder_sent = 1, updated_at = datetime('now') WHERE id = ?`
  );

  for (const b of rows) {
    const service = b.service_name ?? "уборка";
    const address = b.address ? `\n📍 ${b.address}` : "";
    const text =
      `🔔 <b>Напоминание</b>\n\n` +
      `Здравствуйте, ${b.name}!\n` +
      `Через час у вас запланирована услуга:\n\n` +
      `🧹 <b>${service}</b>\n` +
      `📅 ${b.booking_date} в ${b.booking_time}${address}\n\n` +
      `Клинер скоро будет у вас 🚗\n` +
      `Спасибо, что выбрали PrimeClean ✨`;

    const res = await sendTg(b.user_telegram_id, text);
    if (res.ok) markSent.run(b.id);
    results.push({ id: b.id, ok: !!res.ok });
  }

  return { checked: rows.length, sent: results.filter((r) => r.ok).length, results };
}

export async function GET(req: NextRequest) {
  if (!checkSecret(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const out = await runReminders();
    return NextResponse.json({ ok: true, ...out });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
