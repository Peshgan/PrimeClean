import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "NOT SET";
  const masked = url.replace(/:([^:@]+)@/, ":***@");
  try {
    const sql = await getDb();
    const [row] = await sql`SELECT 1 as ok, current_database() as db`;
    const [cnt] = await sql`SELECT COUNT(*) as n FROM bookings`;
    return NextResponse.json({ ok: true, db: row.db, bookings: cnt.n, url: masked });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), url: masked }, { status: 500 });
  }
}
