import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/bookings/slots?date=YYYY-MM-DD
// Returns occupied time slots for that date (excluding cancelled bookings).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT booking_time
         FROM bookings
         WHERE booking_date = ? AND status != 'cancelled'`
      )
      .all(date) as Array<{ booking_time: string }>;

    const taken = Array.from(new Set(rows.map((r) => r.booking_time).filter(Boolean)));

    return NextResponse.json({ date, taken });
  } catch (err) {
    console.error("[GET /api/bookings/slots]", err);
    return NextResponse.json({ taken: [] });
  }
}
