import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const telegramId = new URL(req.url).searchParams.get("telegramId");
  if (!telegramId) return NextResponse.json({ error: "telegramId required" }, { status: 400 });

  try {
    const sql = await getDb();
    const [row] = await sql`
      SELECT COUNT(*) AS cnt FROM bookings
      WHERE user_telegram_id = ${telegramId} AND status != 'cancelled'
    `;
    return NextResponse.json({ firstOrder: Number(row.cnt) === 0 });
  } catch (err) {
    console.error("[GET /api/discounts]", err);
    return NextResponse.json({ firstOrder: false });
  }
}
