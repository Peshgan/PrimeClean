import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const sql = await getDb();
    const rows = await sql`
      SELECT booking_time FROM bookings
      WHERE booking_date = ${date} AND status != 'cancelled'
    `;
    const taken = [...new Set(rows.map((r) => r.booking_time).filter(Boolean))];
    return NextResponse.json({ date, taken });
  } catch (err) {
    console.error("[GET /api/bookings/slots]", err);
    return NextResponse.json({ taken: [] });
  }
}
