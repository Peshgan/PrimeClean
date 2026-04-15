import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reviews as staticReviews } from "@/lib/data/reviews";
import { getDb } from "@/lib/db";

const ReviewSchema = z.object({
  authorName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  serviceName: z.string().optional(),
  text: z.string().min(10).max(1000),
  userTelegramId: z.string().optional(),
});

export async function GET() {
  return NextResponse.json({ reviews: staticReviews });
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
      `INSERT INTO reviews (user_telegram_id, author_name, rating, service_name, text)
       VALUES (?, ?, ?, ?, ?)`
    ).run(d.userTelegramId ?? null, d.authorName, d.rating, d.serviceName ?? null, d.text);

    return NextResponse.json({
      success: true,
      message: "Отзыв отправлен на модерацию. Спасибо!",
    });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
