import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter (per-process, resets on redeploy)
// Sliding window: tracks request timestamps per IP per route group
const store = new Map<string, number[]>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) return false;
  timestamps.push(now);
  store.set(key, timestamps);
  // Cleanup old keys every ~500 requests to avoid memory leak
  if (store.size > 500) {
    for (const [k, ts] of store) {
      if (ts.every((t) => now - t > windowMs)) store.delete(k);
    }
  }
  return true;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function tooMany(req: NextRequest, limit: number, windowMs: number) {
  const ip = getIp(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  if (!rateLimit(key, limit, windowMs)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(windowMs / 1000)),
          "X-RateLimit-Limit": String(limit),
        },
      }
    );
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Booking form: 5 submissions per 10 minutes per IP
  if (pathname === "/api/bookings" && method === "POST") {
    return tooMany(req, 5, 10 * 60 * 1000) ?? NextResponse.next();
  }

  // Reviews: 3 per 10 minutes per IP
  if (pathname === "/api/reviews" && method === "POST") {
    return tooMany(req, 3, 10 * 60 * 1000) ?? NextResponse.next();
  }

  // General API: 120 requests per minute per IP
  if (pathname.startsWith("/api/")) {
    return tooMany(req, 120, 60 * 1000) ?? NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
