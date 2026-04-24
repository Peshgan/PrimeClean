import { NextRequest, NextResponse } from "next/server";

function parseCodes(): Map<string, number> {
  const map = new Map<string, number>();
  for (const pair of (process.env.PROMO_CODES ?? "").split(",")) {
    const idx = pair.trim().lastIndexOf(":");
    if (idx > 0) {
      const code = pair.slice(0, idx).trim().toUpperCase();
      const pct = Number(pair.slice(idx + 1).trim());
      if (code && !isNaN(pct) && pct > 0 && pct < 100) map.set(code, pct);
    }
  }
  return map;
}

export function getPromoCodes(): { code: string; percent: number }[] {
  return Array.from(parseCodes().entries()).map(([code, percent]) => ({ code, percent }));
}

export async function GET(req: NextRequest) {
  const code = (new URL(req.url).searchParams.get("code") ?? "").toUpperCase().trim();
  if (!code) return NextResponse.json({ valid: false, error: "Промокод не указан" });
  const percent = parseCodes().get(code);
  if (!percent) return NextResponse.json({ valid: false, error: "Промокод не найден или истёк" });
  return NextResponse.json({ valid: true, percent, label: `Скидка ${percent}%` });
}
