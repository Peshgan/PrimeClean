import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function getAdminIds(): Set<string> {
  return new Set((process.env.ADMIN_TG_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean));
}
function isAdmin(tgId: string | null): boolean {
  return !!tgId && getAdminIds().has(tgId);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tgId = searchParams.get("tgId");
  const action = searchParams.get("action") ?? "check";

  if (!isAdmin(tgId)) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  if (action === "check") return NextResponse.json({ isAdmin: true });

  const sql = await getDb();

  if (action === "reviews") {
    const filter = searchParams.get("filter") ?? "pending";
    const reviews = filter === "pending"
      ? await sql`SELECT * FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC`
      : filter === "approved"
      ? await sql`SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC`
      : await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
    return NextResponse.json({ reviews });
  }

  if (action === "bookings") {
    const status = searchParams.get("status") ?? "all";
    const period = searchParams.get("period") ?? "all";

    const bookings = await sql`
      SELECT * FROM bookings
      WHERE TRUE
        ${status !== "all" ? sql`AND status = ${status}` : sql``}
        ${period === "upcoming" ? sql`AND booking_date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')` : sql``}
        ${period === "past" ? sql`AND booking_date < TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')` : sql``}
      ORDER BY booking_date DESC, booking_time DESC
      LIMIT 200
    `;
    return NextResponse.json({ bookings });
  }

  if (action === "analytics") {
    try {
      const [counts] = await sql`
        SELECT
          (SELECT COUNT(*) FROM bookings) AS total_bookings,
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM reviews WHERE is_approved = 1) AS total_reviews,
          (SELECT COUNT(*) FROM reviews WHERE is_approved = 0) AS pending_reviews,
          (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE is_approved = 1) AS avg_rating,
          (SELECT COALESCE(SUM(COALESCE(price_actual, price_estimate, 0)), 0) FROM bookings WHERE status = 'done') AS revenue_total,
          (SELECT COUNT(*) FROM bookings WHERE created_at::date = CURRENT_DATE) AS new_today,
          (SELECT COUNT(*) FROM bookings WHERE booking_date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AND status != 'cancelled') AS upcoming_count
      `;

      const byStatus = await sql`SELECT status, COUNT(*) as n FROM bookings GROUP BY status`;
      const bySource = await sql`SELECT source, COUNT(*) as n FROM bookings GROUP BY source`;
      const topServices = await sql`
        SELECT service_name, COUNT(*) as n, SUM(COALESCE(price_estimate,0)) as revenue
        FROM bookings WHERE service_name IS NOT NULL
        GROUP BY service_name ORDER BY n DESC LIMIT 5
      `;
      const last30 = await sql`
        SELECT created_at::date as day, COUNT(*) as n
        FROM bookings
        WHERE created_at::date >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY created_at::date ORDER BY day
      `;

      return NextResponse.json({
        analytics: {
          totalBookings: Number(counts.total_bookings),
          totalUsers: Number(counts.total_users),
          totalReviews: Number(counts.total_reviews),
          pendingReviews: Number(counts.pending_reviews),
          avgRating: Number(Number(counts.avg_rating).toFixed(2)),
          revenueTotal: Math.round(Number(counts.revenue_total)),
          newToday: Number(counts.new_today),
          upcomingCount: Number(counts.upcoming_count),
          byStatus,
          bySource,
          topServices,
          last30,
        },
      });
    } catch (err) {
      console.error("[admin analytics]", err);
      return NextResponse.json({ error: "Ошибка аналитики" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const tgId = new URL(req.url).searchParams.get("tgId");
  if (!isAdmin(tgId)) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  try {
    const body = await req.json();
    const { entity = "review", id, action, status } = body;
    if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });

    const sql = await getDb();

    if (entity === "review") {
      if (action === "approve") {
        await sql`UPDATE reviews SET is_approved = 1 WHERE id = ${id}`;
        return NextResponse.json({ success: true, message: "Отзыв опубликован" });
      }
      if (action === "reject" || action === "delete") {
        await sql`DELETE FROM reviews WHERE id = ${id}`;
        return NextResponse.json({ success: true, message: "Отзыв удалён" });
      }
    }

    if (entity === "booking") {
      const allowed = ["new", "confirmed", "in_progress", "done", "cancelled"];
      if (action === "delete") {
        await sql`DELETE FROM bookings WHERE id = ${id}`;
        return NextResponse.json({ success: true, message: "Заявка удалена" });
      }
      if (action === "reschedule") {
        const { booking_date, booking_time } = body as { booking_date?: string; booking_time?: string };
        if (!booking_date || !booking_time) return NextResponse.json({ error: "Нет даты/времени" }, { status: 400 });
        if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date) || !/^\d{2}:\d{2}$/.test(booking_time))
          return NextResponse.json({ error: "Неверный формат" }, { status: 400 });
        await sql`
          UPDATE bookings SET booking_date = ${booking_date}, booking_time = ${booking_time},
          reminder_sent = 0, updated_at = to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')
          WHERE id = ${id}
        `;
        return NextResponse.json({ success: true, message: `Перенесено на ${booking_date} ${booking_time}` });
      }
      if (status && allowed.includes(status)) {
        const priceActual = typeof body.price_actual === "number" ? body.price_actual : null;
        if (status === "done" && priceActual !== null) {
          await sql`
            UPDATE bookings SET status = ${status}, price_actual = ${priceActual},
            updated_at = to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')
            WHERE id = ${id}
          `;
        } else if (status === "cancelled") {
          await sql`
            UPDATE bookings SET status = ${status}, price_actual = NULL,
            updated_at = to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')
            WHERE id = ${id}
          `;
        } else {
          await sql`
            UPDATE bookings SET status = ${status},
            updated_at = to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')
            WHERE id = ${id}
          `;
        }
        const statusLabels: Record<string, string> = {
          new: "Новая", confirmed: "Подтверждена", in_progress: "В работе",
          done: "Выполнена", cancelled: "Отменена",
        };
        return NextResponse.json({ success: true, message: `Статус: ${statusLabels[status] ?? status}` });
      }
      return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
    }

    return NextResponse.json({ error: "Неизвестная сущность" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/admin/tma]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
