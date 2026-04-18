import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://primeclean.by";
const SETUP_SECRET = process.env.CRON_SECRET ?? "";

async function botApi(method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// GET /api/telegram/setup?secret=YOUR_CRON_SECRET
export async function GET(req: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ error: "BOT_TOKEN не задан" }, { status: 500 });

  const secret = req.nextUrl.searchParams.get("secret");
  if (SETUP_SECRET && secret !== SETUP_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhookUrl = `${APP_URL}/api/telegram/webhook`;
  const tmaUrl = `${APP_URL}/tma`;

  const results: Record<string, unknown> = {};

  // 1. Register webhook
  results.setWebhook = await botApi("setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
  });

  // 2. Set bot commands list (shown in menu and hints)
  results.setMyCommands = await botApi("setMyCommands", {
    commands: [
      { command: "start", description: "Запустить приложение" },
      { command: "status", description: "Мои заявки" },
      { command: "contacts", description: "Контакты компании" },
      { command: "help", description: "Справка по командам" },
    ],
  });

  // 3. Set menu button — opens Mini App directly from chat input bar
  results.setChatMenuButton = await botApi("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Открыть приложение",
      web_app: { url: tmaUrl },
    },
  });

  // 4. Set bot description (shown before /start)
  results.setMyDescription = await botApi("setMyDescription", {
    description:
      "PrimeClean — профессиональный клининг в Минске. Заказывайте уборку, следите за статусом и оставляйте отзывы прямо здесь.",
  });

  // 5. Set short description (shown in search results)
  results.setMyShortDescription = await botApi("setMyShortDescription", {
    short_description: "Клининг в Минске — заказ уборки онлайн 🧹",
  });

  return NextResponse.json({ ok: true, results });
}
