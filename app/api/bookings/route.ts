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
  extras: z.union([z.array(z.string()), ExtrasSchema]).optional(),
  priceEstimate: z.number().nonnegative().optional(),
  comment: z.string().max(500).optional(),
  userTelegramId: z.string().optional(),
  tgUsername: z.string().optional(),
  tgUserId: z.string().optional(),
  contactPreference: z.enum(["callback", "chat"]).optional(),
  source: z.enum(["website", "telegram"]).default("website"),
});

function normalizeExtras(extras: string[] | Record<string, number> | undefined): Record<string, number> | null {
  if (!extras) return null;
  if (Array.isArray(extras)) return extras.reduce<Record<string, number>>((a, k) => { a[k] = 1; return a; }, {});
  return extras;
}

function formatExtras(extras: Record<string, number> | null): string {
  if (!extras || !Object.keys(extras).length) return "—";
  const L: Record<string, string> = {
    windows: "Мойка окон", fridge: "Холодильник", oven: "Духовка",
    balcony: "Балкон", ironing: "Глажка", sofa2: "Диван 2-мест.",
    sofa3: "Диван 3-мест.", sofa_corner: "Угловой диван",
    mat1_1: "Матрас 1-сп", mat2_1: "Матрас 2-сп", chair: "Кресло", stool: "Стул",
  };
  return Object.entries(extras).filter(([, q]) => q > 0)
    .map(([k, q]) => `${L[k] ?? k}${q > 1 ? ` ×${q}` : ""}`).join(", ");
}

async function notifyAdmin(id: number, d: z.infer<typeof BookingSchema>, extras: Record<string, number> | null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chat) return;
  const tg = d.tgUsername ? `@${d.tgUsername}` : d.tgUserId ? `<a href="tg://user?id=${d.tgUserId}">Telegram</a>` : "—";
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat, parse_mode: "HTML",
      text: `📋 <b>Новая заявка #${id}</b>\n\n👤 ${d.name} | <code>${d.phone}</code>\n🧹 ${d.serviceName ?? d.serviceSlug}\n📅 ${d.bookingDate} в ${d.bookingTime}\n💰 ~${d.priceEstimate ?? "?"} BYN\n📍 ${d.address ?? "не указан"}\n➕ ${formatExtras(extras)}\n💬 ${d.comment ?? "—"}\n📲 ${tg}\n🔌 ${d.source}`,
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const parsed = BookingSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    const d = parsed.data;
    const extras = normalizeExtras(d.extras);
    const sql = await getDb();

    const [row] = await sql`
      INSERT INTO bookings
        (user_telegram_id, tg_username, tg_user_id, name, phone, service_slug, service_name,
         booking_date, booking_time, address, rooms, area, extras, price_estimate,
         comment, contact_preference, source)
      VALUES (
        ${d.userTelegramId ?? d.tgUserId ?? null}, ${d.tgUsername ?? null}, ${d.tgUserId ?? null},
        ${d.name}, ${d.phone}, ${d.serviceSlug}, ${d.serviceName ?? null},
        ${d.bookingDate}, ${d.bookingTime}, ${d.address ?? null}, ${d.rooms ?? null}, ${d.area ?? null},
        ${extras ? JSON.stringify(extras) : null}, ${d.priceEstimate ?? null},
        ${d.comment ?? null}, ${d.contactPreference ?? "callback"}, ${d.source}
      )
      RETURNING id
    `;

    await notifyAdmin(row.id, d, extras);
    return NextResponse.json({ success: true, bookingId: row.id, message: "Заявка принята! Перезвоним в течение 15 минут." });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const telegramId = new URL(req.url).searchParams.get("telegramId");
  if (!telegramId) return NextResponse.json({ error: "telegramId required" }, { status: 400 });
  try {
    const sql = await getDb();
    const bookings = await sql`
      SELECT id, service_name, service_slug, booking_date, booking_time, price_estimate, status, created_at
      FROM bookings WHERE user_telegram_id = ${telegramId}
      ORDER BY created_at DESC LIMIT 20
    `;
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
