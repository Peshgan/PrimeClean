import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function makeCode(telegramId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let h = 5381;
  for (let i = 0; i < telegramId.length; i++) {
    h = ((h << 5) + h + telegramId.charCodeAt(i)) | 0;
  }
  let n = Math.abs(h);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code = chars[n % chars.length] + code;
    n = Math.floor(n / chars.length);
  }
  return "PC" + code;
}

// GET ?telegramId=X  → upsert and return referral code
// GET ?code=PCXXXXXX → validate code, return { valid, referrerTelegramId }
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");
  const code = searchParams.get("code");

  const sql = await getDb();

  if (telegramId) {
    const generated = makeCode(telegramId);
    await sql`
      UPDATE users SET referral_code = ${generated}
      WHERE telegram_id = ${telegramId} AND referral_code IS NULL
    `;
    return NextResponse.json({ code: generated });
  }

  if (code) {
    const upper = code.toUpperCase().trim();
    const [user] = await sql`SELECT telegram_id FROM users WHERE referral_code = ${upper}`;
    if (!user) return NextResponse.json({ valid: false });
    return NextResponse.json({ valid: true, referrerTelegramId: user.telegram_id, percent: 15 });
  }

  return NextResponse.json({ error: "Укажите telegramId или code" }, { status: 400 });
}

// POST { code, newUserTelegramId } → mark referred_by, confirm discount
export async function POST(req: NextRequest) {
  try {
    const { code, newUserTelegramId } = await req.json() as { code?: string; newUserTelegramId?: string };
    if (!code || !newUserTelegramId) return NextResponse.json({ error: "Нет данных" }, { status: 400 });

    const upper = code.toUpperCase().trim();
    const sql = await getDb();

    const [referrer] = await sql`SELECT telegram_id FROM users WHERE referral_code = ${upper}`;
    if (!referrer) return NextResponse.json({ valid: false, error: "Код не найден" });
    if (referrer.telegram_id === newUserTelegramId)
      return NextResponse.json({ valid: false, error: "Нельзя использовать собственный код" });

    const [existing] = await sql`SELECT referred_by FROM users WHERE telegram_id = ${newUserTelegramId}`;
    if (existing?.referred_by)
      return NextResponse.json({ valid: false, error: "Вы уже использовали реферальный код" });

    await sql`UPDATE users SET referred_by = ${upper} WHERE telegram_id = ${newUserTelegramId}`;
    return NextResponse.json({ valid: true, percent: 15 });
  } catch (err) {
    console.error("[POST /api/referral]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
