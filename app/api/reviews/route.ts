import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reviews as staticReviews } from "@/lib/data/reviews";
import { getDb } from "@/lib/db";

const ReviewSchema = z.object({
  authorName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  serviceName: z.string().optional(),
  text: z.string().min(10).max(1000),
  // Accept URL or base64 data URI
  photoUrl: z.string().optional(),
  userTelegramId: z.string().optional(),
});

export async function GET() {
  try {
    const db = getDb();
    const dbReviews = db
      .prepare(
        `SELECT id, author_name, rating, service_name, text, photo_url, created_at
         FROM reviews
         WHERE is_approved = 1
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .all() as Array<{
      id: number;
      author_name: string;
      rating: number;
      service_name: string | null;
      text: string;
      photo_url: string | null;
      created_at: string;
    }>;

    // Merge DB reviews with static reviews, DB first
    const formatted = dbReviews.map((r) => ({
      id: `db_${r.id}`,
      name: r.author_name,
      avatar: r.author_name.slice(0, 2).toUpperCase(),
      rating: r.rating,
      date: r.created_at.split("T")[0],
      service: r.service_name ?? "Клининг",
      text: r.text,
      photo_url: r.photo_url,
    }));

    return NextResponse.json({ reviews: [...formatted, ...staticReviews] });
  } catch {
    // Fallback to static if DB unavailable
    return NextResponse.json({ reviews: staticReviews });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const db = getDb();

    db.prepare(
      `INSERT INTO reviews (user_telegram_id, author_name, rating, service_name, text, photo_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      d.userTelegramId ?? null,
      d.authorName,
      d.rating,
      d.serviceName ?? null,
      d.text,
      d.photoUrl ?? null
    );

    // Notify admin about new review for moderation
    await notifyAdminNewReview(d.authorName, d.rating, d.text);

    return NextResponse.json({
      success: true,
      message: "Отзыв отправлен на модерацию. Спасибо!",
    });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

async function notifyAdminNewReview(authorName: string, rating: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !adminChat) return;

  const stars = "⭐".repeat(rating);
  const message =
    `📝 <b>Новый отзыв на модерации</b>\n\n` +
    `👤 ${authorName}\n` +
    `${stars}\n` +
    `💬 ${text}\n\n` +
    `Откройте панель администратора для модерации.`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: adminChat, text: message, parse_mode: "HTML" }),
  }).catch(() => {});
}
