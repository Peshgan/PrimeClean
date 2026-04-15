import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";

const BookingSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  serviceSlug: z.string().min(1),
  serviceName: z.string().optional(),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
  address: z.string().optional(),
  rooms: z.number().int().positive().optional(),
  area: z.number().positive().optional(),
  extras: z.array(z.string()).optional(),
  priceEstimate: z.number().nonnegative().optional(),
  comment: z.string().max(500).optional(),
  userTelegramId: z.string().optional(),
  source: z.enum(["website", "telegram"]).default("website"),
});

async function notifyAdmin(bookingId: number | bigint, data: z.infer<typeof BookingSchema>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !adminChat) return;

  const text =
    `📋 <b>Новая заявка #${bookingId}</b>\n\n` +
    `👤 ${data.name} | <code>${data.phone}</code>\n` +
    `🧹 ${data.serviceName ?? data.serviceSlug}\n` +
    `📅 ${data.bookingDate} в ${data.bookingTime}\n` +
    `💰 ~${data.priceEstimate ?? "?"} BYN\n` +
    `📍 ${data.address ?? "не указан"}\n` +
    `💬 ${data.comment ?? "—"}\n` +
    `🔌 Источник: ${data.source}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: adminChat, text, parse_mode: "HTML" }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const db = getDb();

    const result = db
      .prepare(
        `INSERT INTO bookings
          (user_telegram_id, name, phone, service_slug, service_name,
           booking_date, booking_time, address, rooms, area,
           extras, price_estimate, comment, source)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        d.userTelegramId ?? null,
        d.name,
        d.phone,
        d.serviceSlug,
        d.serviceName ?? null,
        d.bookingDate,
        d.bookingTime,
        d.address ?? null,
        d.rooms ?? null,
        d.area ?? null,
        d.extras ? JSON.stringify(d.extras) : null,
        d.priceEstimate ?? null,
        d.comment ?? null,
        d.source
      );

    await notifyAdmin(result.lastInsertRowid, d);

    return NextResponse.json({
      success: true,
      bookingId: result.lastInsertRowid,
      message: "Заявка принята! Перезвоним в течение 15 минут.",
    });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");

  try {
    const db = getDb();

    if (telegramId) {
      const bookings = db
        .prepare(
          `SELECT id, service_name, service_slug, booking_date, booking_time,
                  price_estimate, status, created_at
           FROM bookings
           WHERE user_telegram_id = ?
           ORDER BY created_at DESC
           LIMIT 20`
        )
        .all(telegramId);
      return NextResponse.json({ bookings });
    }

    return NextResponse.json({ error: "telegramId required" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
