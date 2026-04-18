import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reviews as staticReviews } from "@/lib/data/reviews";
import { getDb } from "@/lib/db";

const ReviewSchema = z.object({
  authorName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  serviceName: z.string().optional(),
  text: z.string().min(10).max(1000),
  photoUrl: z.string().optional(),
  extraPhotos: z.array(z.string()).optional(),
  userTelegramId: z.string().optional(),
});

export async function GET() {
  try {
    const sql = await getDb();
    const dbReviews = await sql`
      SELECT id, author_name, rating, service_name, text, photo_url, created_at
      FROM reviews WHERE is_approved = 1
      ORDER BY created_at DESC LIMIT 50
    `;

    const formatted = dbReviews.map((r) => ({
      id: `db_${r.id}`,
      name: r.author_name,
      avatar: String(r.author_name).slice(0, 2).toUpperCase(),
      rating: r.rating,
      date: String(r.created_at).split("T")[0],
      service: r.service_name ?? "Клининг",
      text: r.text,
      photo_url: r.photo_url,
    }));

    return NextResponse.json({ reviews: [...formatted, ...staticReviews] });
  } catch {
    return NextResponse.json({ reviews: staticReviews });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = ReviewSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    const d = parsed.data;
    const sql = await getDb();

    await sql`
      INSERT INTO reviews (user_telegram_id, author_name, rating, service_name, text, photo_url, extra_photos)
      VALUES (
        ${d.userTelegramId ?? null}, ${d.authorName}, ${d.rating},
        ${d.serviceName ?? null}, ${d.text},
        ${d.photoUrl ?? null},
        ${d.extraPhotos?.length ? JSON.stringify(d.extraPhotos) : null}
      )
    `;

    await notifyAdmin(d.authorName, d.rating, d.text);
    return NextResponse.json({ success: true, message: "Отзыв отправлен на модерацию. Спасибо!" });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

async function notifyAdmin(authorName: string, rating: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chat) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat, parse_mode: "HTML",
      text: `📝 <b>Новый отзыв на модерации</b>\n\n👤 ${authorName}\n${"⭐".repeat(rating)}\n💬 ${text}`,
    }),
  }).catch(() => {});
}
