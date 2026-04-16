import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";

const ExtrasSchema = z.record(z.string(), z.number().int().nonnegative());

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
  // Accept both legacy string[] and new { key: qty } object
  extras: z.union([z.array(z.string()), ExtrasSchema]).optional(),
  priceEstimate: z.number().nonnegative().optional(),
  comment: z.string().max(500).optional(),
  userTelegramId: z.string().optional(),
  // TG user info from initDataUnsafe
  tgUsername: z.string().optional(),
  tgUserId: z.string().optional(),
  contactPreference: z.enum(["callback", "chat"]).optional(),
  source: z.enum(["website", "telegram"]).default("website"),
});

function normalizeExtras(
  extras: string[] | Record<string, number> | undefined
): Record<string, number> | null {
  if (!extras) return null;
  if (Array.isArray(extras)) {
    // Legacy format: boolean flags → qty 1
    return extras.reduce<Record<string, number>>((acc, key) => {
      acc[key] = 1;
      return acc;
    }, {});
  }
  return extras;
}

function formatExtrasForNotification(extras: Record<string, number> | null): string {
  if (!extras || Object.keys(extras).length === 0) return "—";
  const LABELS: Record<string, string> = {
    windows: "Мойка окон",
    fridge: "Холодильник",
    oven: "Духовка",
    balcony: "Балкон",
    ironing: "Глажка",
    sofa2: "Диван 2-местный",
    sofa3: "Диван 3-местный",
    sofa_corner: "Угловой диван",
    sofa4: "Диван 4-местный",
    sofa5: "Диван 5-6 местный",
    mat1_1: "Матрас 1-сп (1ст.)",
    mat1_2: "Матрас 1-сп (2ст.)",
    mat2_1: "Матрас 2-сп (1ст.)",
    mat2_2: "Матрас 2-сп (2ст.)",
    chair: "Кресло",
    stool: "Стул",
    comp_chair: "Компьютерный стул",
    headboard: "Изголовье",
    pouf: "Пуф",
    kitchen: "Кухонный уголок",
  };
  return Object.entries(extras)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => `${LABELS[key] ?? key}${qty > 1 ? ` ×${qty}` : ""}`)
    .join(", ");
}

async function notifyAdmin(
  bookingId: number | bigint,
  data: z.infer<typeof BookingSchema>,
  extrasObj: Record<string, number> | null
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !adminChat) return;

  // Build contact link: prefer @username, fallback to tg://user?id=
  let tgContact = "—";
  if (data.tgUsername) {
    tgContact = `@${data.tgUsername}`;
  } else if (data.tgUserId) {
    tgContact = `<a href="tg://user?id=${data.tgUserId}">Открыть в Telegram</a>`;
  }

  const contactPref =
    data.contactPreference === "chat"
      ? "💬 Чат в ТГ"
      : "📞 Звонок";

  const text =
    `📋 <b>Новая заявка #${bookingId}</b>\n\n` +
    `👤 ${data.name} | <code>${data.phone}</code>\n` +
    `🧹 ${data.serviceName ?? data.serviceSlug}\n` +
    `📅 ${data.bookingDate} в ${data.bookingTime}\n` +
    `💰 ~${data.priceEstimate ?? "?"} BYN\n` +
    `📍 ${data.address ?? "не указан"}\n` +
    `➕ Доп. услуги: ${formatExtrasForNotification(extrasObj)}\n` +
    `💬 ${data.comment ?? "—"}\n` +
    `📲 Telegram: ${tgContact}\n` +
    `📡 Предпочтительный способ связи: ${contactPref}\n` +
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
    const extrasObj = normalizeExtras(d.extras);
    const db = getDb();

    // Determine TG contact info
    const tgUsername = d.tgUsername ?? null;
    const tgUserId = d.tgUserId ?? null;

    const result = db
      .prepare(
        `INSERT INTO bookings
          (user_telegram_id, tg_username, tg_user_id, name, phone, service_slug, service_name,
           booking_date, booking_time, address, rooms, area,
           extras, price_estimate, comment, contact_preference, source)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        d.userTelegramId ?? tgUserId ?? null,
        tgUsername,
        tgUserId,
        d.name,
        d.phone,
        d.serviceSlug,
        d.serviceName ?? null,
        d.bookingDate,
        d.bookingTime,
        d.address ?? null,
        d.rooms ?? null,
        d.area ?? null,
        extrasObj ? JSON.stringify(extrasObj) : null,
        d.priceEstimate ?? null,
        d.comment ?? null,
        d.contactPreference ?? "callback",
        d.source
      );

    await notifyAdmin(result.lastInsertRowid, d, extrasObj);

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
