import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function getAdminIds(): Set<string> {
  const raw = process.env.ADMIN_TG_IDS ?? "";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

function isAdmin(tgId: string | null): boolean {
  if (!tgId) return false;
  return getAdminIds().has(tgId);
}

// GET /api/admin/tma?tgId=XXX&action=check|reviews&filter=pending|approved|all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tgId = searchParams.get("tgId");
  const action = searchParams.get("action") ?? "check";

  if (!isAdmin(tgId)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  if (action === "check") {
    return NextResponse.json({ isAdmin: true });
  }

  if (action === "reviews") {
    const filter = searchParams.get("filter") ?? "pending";
    const db = getDb();
    let sql = `SELECT * FROM reviews ORDER BY created_at DESC`;
    if (filter === "pending") sql = `SELECT * FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC`;
    if (filter === "approved") sql = `SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC`;
    const reviews = db.prepare(sql).all();
    return NextResponse.json({ reviews });
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}

// PATCH /api/admin/tma — approve or reject review
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tgId = searchParams.get("tgId");

  if (!isAdmin(tgId)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const { id, action } = await req.json();
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
    console.error("[PATCH /api/admin/tma]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
