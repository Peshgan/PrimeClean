import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function checkAuth(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = await getDb();
    const filter = new URL(req.url).searchParams.get("filter") ?? "all";
    const reviews = filter === "pending"
      ? await sql`SELECT * FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC`
      : filter === "approved"
      ? await sql`SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC`
      : await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[GET /api/admin/reviews]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, action } = await req.json();
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }
    const sql = await getDb();
    if (action === "approve") {
      await sql`UPDATE reviews SET is_approved = 1 WHERE id = ${id}`;
      return NextResponse.json({ success: true, message: "Отзыв опубликован" });
    } else {
      await sql`DELETE FROM reviews WHERE id = ${id}`;
      return NextResponse.json({ success: true, message: "Отзыв удалён" });
    }
  } catch (err) {
    console.error("[PATCH /api/admin/reviews]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
