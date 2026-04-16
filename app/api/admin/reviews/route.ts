import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function checkAdminAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

// GET /api/admin/reviews — all reviews (pending + approved)
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") ?? "all"; // all | pending | approved

    let sql = `SELECT * FROM reviews ORDER BY created_at DESC`;
    if (filter === "pending") sql = `SELECT * FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC`;
    if (filter === "approved") sql = `SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC`;

    const reviews = db.prepare(sql).all();
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[GET /api/admin/reviews]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// PATCH /api/admin/reviews — approve or reject a review
export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await req.json(); // action: "approve" | "reject"
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    const db = getDb();

    if (action === "approve") {
      db.prepare(`UPDATE reviews SET is_approved = 1 WHERE id = ?`).run(id);
      return NextResponse.json({ success: true, message: "Отзыв опубликован" });
    } else {
      db.prepare(`DELETE FROM reviews WHERE id = ?`).run(id);
      return NextResponse.json({ success: true, message: "Отзыв удалён" });
    }
  } catch (err) {
    console.error("[PATCH /api/admin/reviews]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
