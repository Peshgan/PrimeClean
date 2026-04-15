import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://primeclean.by";

async function sendMessage(
  chatId: number,
  text: string,
  extra: Record<string, unknown> = {}
) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...extra }),
  });
}

// Always return 200 so Telegram doesn't retry
export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ ok: true });

  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    const msg = (update.message ?? update.callback_query) as Record<string, unknown> | undefined;
    const from = (
      (update.message as Record<string, unknown>)?.from ??
      (update.callback_query as Record<string, unknown>)?.from
    ) as Record<string, unknown> | undefined;
    const chatId = (msg as Record<string, unknown> | undefined)?.chat
      ? ((msg as Record<string, unknown>).chat as Record<string, unknown>).id as number
      : undefined;

    if (!chatId || !from) return NextResponse.json({ ok: true });

    // Upsert user
    try {
      const db = getDb();
      db.prepare(
        `INSERT INTO users (telegram_id, first_name, last_name, username)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(telegram_id) DO UPDATE SET
           first_name = excluded.first_name,
           last_name = excluded.last_name,
           username = excluded.username`
      ).run(
        String(from.id),
        (from.first_name as string) ?? "",
        (from.last_name as string) ?? null,
        (from.username as string) ?? null
      );
    } catch {}

    const text = ((update.message as Record<string, unknown>)?.text as string) ?? "";
    const firstName = (from.first_name as string) ?? "друг";
    const tmaUrl = `${APP_URL}/tma`;

    if (text === "/start") {
      await sendMessage(
        chatId,
        `👋 Привет, <b>${firstName}</b>!\n\n` +
          `Я бот компании <b>PrimeClean</b> — профессиональный клининг в Минске.\n\n` +
          `Через приложение вы можете:\n` +
          `• Выбрать услугу и рассчитать стоимость\n` +
          `• Заказать уборку с удобной датой и временем\n` +
          `• Посмотреть отзывы и историю заказов\n\n` +
          `Нажмите кнопку ниже чтобы открыть приложение 🚀`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🧹 Открыть PrimeClean", web_app: { url: tmaUrl } }],
              [{ text: "📞 Позвонить нам", url: "tel:+375444789360" }],
            ],
          },
        }
      );
    } else if (text === "/help") {
      await sendMessage(
        chatId,
        `ℹ️ <b>Команды бота</b>\n\n` +
          `/start — открыть приложение\n` +
          `/status — мои заявки\n` +
          `/contacts — контакты компании\n` +
          `/help — эта справка`
      );
    } else if (text === "/contacts") {
      await sendMessage(
        chatId,
        `📞 <b>Контакты PrimeClean</b>\n\n` +
          `Телефон: <a href="tel:+375444789360">+375 (44) 478-93-60</a>\n` +
          `Email: info@primeclean.by\n` +
          `Адрес: ул. Немига, 5, Минск\n\n` +
          `⏰ Режим работы:\n` +
          `Пн–Пт: 08:00–20:00\n` +
          `Сб–Вс: 09:00–18:00`
      );
    } else if (text === "/status") {
      try {
        const db = getDb();
        const bookings = db
          .prepare(
            `SELECT id, service_name, booking_date, booking_time, status
             FROM bookings
             WHERE user_telegram_id = ?
             ORDER BY created_at DESC LIMIT 5`
          )
          .all(String(from.id)) as Array<{
          id: number;
          service_name: string;
          booking_date: string;
          booking_time: string;
          status: string;
        }>;

        if (bookings.length === 0) {
          await sendMessage(
            chatId,
            `📋 У вас пока нет заявок.\n\nОформите заказ через приложение!`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🧹 Открыть приложение", web_app: { url: tmaUrl } }],
                ],
              },
            }
          );
        } else {
          const statusEmoji: Record<string, string> = {
            new: "🆕",
            confirmed: "✅",
            in_progress: "🔄",
            done: "✔️",
            cancelled: "❌",
          };
          const list = bookings
            .map(
              (b) =>
                `#${b.id} — ${b.service_name ?? "Услуга"}\n` +
                `📅 ${b.booking_date} в ${b.booking_time}\n` +
                `${statusEmoji[b.status] ?? "📦"} ${b.status}`
            )
            .join("\n\n");
          await sendMessage(chatId, `📋 <b>Ваши заявки:</b>\n\n${list}`);
        }
      } catch {
        await sendMessage(chatId, "Ошибка при получении заявок. Попробуйте позже.");
      }
    } else {
      // Default: suggest opening app
      await sendMessage(
        chatId,
        `Используйте наше приложение для заказа клининга 👇`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🧹 Открыть PrimeClean", web_app: { url: tmaUrl } }],
            ],
          },
        }
      );
    }
  } catch (err) {
    console.error("[Telegram webhook]", err);
  }

  return NextResponse.json({ ok: true });
}
