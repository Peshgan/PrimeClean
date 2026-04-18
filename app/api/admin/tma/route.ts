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

// GET /api/admin/tma?tgId=XXX&action=check|reviews|bookings|analytics
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

  const db = getDb();

  if (action === "reviews") {
    const filter = searchParams.get("filter") ?? "pending";
    let sql = `SELECT * FROM reviews ORDER BY created_at DESC`;
    if (filter === "pending") sql = `SELECT * FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC`;
    if (filter === "approved") sql = `SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC`;
    const reviews = db.prepare(sql).all();
    return NextResponse.json({ reviews });
  }

  if (action === "bookings") {
    const status = searchParams.get("status") ?? "all";
    const period = searchParams.get("period") ?? "all"; // upcoming | past | all
    let sql = `SELECT * FROM bookings`;
    const clauses: string[] = [];
    if (status !== "all") clauses.push(`status = '${status.replace(/[^a-z_]/g, "")}'`);
    if (period === "upcoming") clauses.push(`booking_date >= date('now')`);
    if (period === "past") clauses.push(`booking_date < date('now')`);
    if (clauses.length) sql += ` WHERE ${clauses.join(" AND ")}`;
    sql += ` ORDER BY booking_date DESC, booking_time DESC LIMIT 200`;
    const bookings = db.prepare(sql).all();
    return NextResponse.json({ bookings });
  }

  if (action === "analytics") {
    try {
      const totalBookings = (db.prepare(`SELECT COUNT(*) as n FROM bookings`).get() as { n: number }).n;
      const totalUsers = (db.prepare(`SELECT COUNT(*) as n FROM users`).get() as { n: number }).n;
      const totalReviews = (db.prepare(`SELECT COUNT(*) as n FROM reviews WHERE is_approved = 1`).get() as { n: number }).n;
      const pendingReviews = (db.prepare(`SELECT COUNT(*) as n FROM reviews WHERE is_approved = 0`).get() as { n: number }).n;

      const avgRating =
        (db.prepare(`SELECT AVG(rating) as v FROM reviews WHERE is_approved = 1`).get() as { v: number | null }).v ?? 0;

      const byStatus = db
        .prepare(`SELECT status, COUNT(*) as n FROM bookings GROUP BY status`)
        .all() as Array<{ status: string; n: number }>;

      const bySource = db
        .prepare(`SELECT source, COUNT(*) as n FROM bookings GROUP BY source`)
        .all() as Array<{ source: string; n: number }>;

      const topServices = db
        .prepare(
          `SELECT service_name, COUNT(*) as n, SUM(COALESCE(price_estimate,0)) as revenue
           FROM bookings
           WHERE service_name IS NOT NULL
           GROUP BY service_name
           ORDER BY n DESC LIMIT 5`
        )
        .all() as Array<{ service_name: string; n: number; revenue: number }>;

      const last30 = db
        .prepare(
          `SELECT date(created_at) as day, COUNT(*) as n
           FROM bookings
           WHERE date(created_at) >= date('now','-29 days')
           GROUP BY day ORDER BY day`
        )
        .all() as Array<{ day: string; n: number }>;

      const revenueTotal =
        (db.prepare(`SELECT SUM(COALESCE(price_estimate,0)) as v FROM bookings WHERE status IN ('done','confirmed','in_progress')`).get() as { v: number | null }).v ?? 0;

      const newToday = (db
        .prepare(`SELECT COUNT(*) as n FROM bookings WHERE date(created_at) = date('now')`)
        .get() as { n: number }).n;

      const upcomingCount = (db
        .prepare(`SELECT COUNT(*) as n FROM bookings WHERE booking_date >= date('now') AND status != 'cancelled'`)
        .get() as { n: number }).n;

      return NextResponse.json({
        analytics: {
          totalBookings,
          totalUsers,
          totalReviews,
          pendingReviews,
          avgRating: Number(avgRating?.toFixed?.(2) ?? 0),
          byStatus,
          bySource,
          topServices,
          last30,
          revenueTotal: Math.round(revenueTotal),
          newToday,
          upcomingCount,
        },
      });
    } catch (err) {
      console.error("[admin analytics]", err);
      return NextResponse.json({ error: "Ошибка аналитики" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}

// PATCH — update review (approve) or booking (status)
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tgId = searchParams.get("tgId");

  if (!isAdmin(tgId)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity = "review", id, action, status } = body;
    if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

    const db = getDb();

    if (entity === "review") {
      if (action === "approve") {
        db.prepare(`UPDATE reviews SET is_approved = 1 WHERE id = ?`).run(id);
        return NextResponse.json({ success: true, message: "Отзыв опубликован" });
      }
      if (action === "reject" || action === "delete") {
        db.prepare(`DELETE FROM reviews WHERE id = ?`).run(id);
        return NextResponse.json({ success: true, message: "Отзыв удалён" });
      }
      return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    }

    if (entity === "booking") {
      const allowed = ["new", "confirmed", "in_progress", "done", "cancelled"];
      if (action === "delete") {
        db.prepare(`DELETE FROM bookings WHERE id = ?`).run(id);
        return NextResponse.json({ success: true, message: "Заявка удалена" });
      }
      if (action === "reschedule") {
        const { booking_date, booking_time } = body as { booking_date?: string; booking_time?: string };
        if (!booking_date || !booking_time) return NextResponse.json({ error: "Нет даты/времени" }, { status: 400 });
        if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date) || !/^\d{2}:\d{2}$/.test(booking_time))
          return NextResponse.json({ error: "Неверный формат" }, { status: 400 });
        db.prepare(`UPDATE bookings SET booking_date = ?, booking_time = ?, reminder_sent = 0, updated_at = datetime('now') WHERE id = ?`)
          .run(booking_date, booking_time, id);
        return NextResponse.json({ success: true, message: `Перенесено на ${booking_date} ${booking_time}` });
      }
      if (status && allowed.includes(status)) {
        db.prepare(`UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
        return NextResponse.json({ success: true, message: `Статус: ${status}` });
      }
      return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
    }

    return NextResponse.json({ error: "Неизвестная сущность" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/admin/tma]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
