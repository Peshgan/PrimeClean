import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;

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

async function sendTg(chatId: string, text: string) {
  if (!BOT_TOKEN) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return r.ok;
  } catch { return false; }
}

async function runReminders() {
  const sql = await getDb();

  // Minsk is UTC+3. bookings stored as local time TEXT.
  // Find bookings 55-65 min from now in Minsk time.
  const rows = await sql`
    SELECT id, user_telegram_id, service_name, booking_date, booking_time, address, name
    FROM bookings
    WHERE reminder_sent = 0
      AND status IN ('new', 'confirmed')
      AND user_telegram_id IS NOT NULL AND user_telegram_id != ''
      AND (booking_date || ' ' || booking_time)::timestamp
          BETWEEN (NOW() AT TIME ZONE 'Europe/Minsk') + INTERVAL '55 minutes'
              AND (NOW() AT TIME ZONE 'Europe/Minsk') + INTERVAL '65 minutes'
  `;

  let sent = 0;
  for (const b of rows) {
    const text =
      `🔔 <b>Напоминание</b>\n\nЗдравствуйте, ${b.name}!\n` +
      `Через час у вас запланирована:\n\n` +
      `🧹 <b>${b.service_name ?? "уборка"}</b>\n` +
      `📅 ${b.booking_date} в ${b.booking_time}` +
      (b.address ? `\n📍 ${b.address}` : "") +
      `\n\nКлинер скоро будет у вас 🚗\nСпасибо, что выбрали PrimeClean ✨`;

    const ok = await sendTg(b.user_telegram_id, text);
    if (ok) {
      await sql`
        UPDATE bookings SET reminder_sent = 1,
        updated_at = to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')
        WHERE id = ${b.id}
      `;
      sent++;
    }
  }

  return { checked: rows.length, sent };
}

export async function GET(req: NextRequest) {
  if (!checkSecret(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const out = await runReminders();
    return NextResponse.json({ ok: true, ...out });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return GET(req); }
