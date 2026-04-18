import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://primeclean.by";

// Admin Telegram IDs (comma-separated in env: ADMIN_TG_IDS=123456,789012)
function getAdminTgIds(): Set<string> {
  const raw = process.env.ADMIN_TG_IDS ?? "";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

function isAdmin(telegramId: string | number): boolean {
  return getAdminTgIds().has(String(telegramId));
}

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

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
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
    // Handle callback_query (inline button press) — review moderation
    if (update.callback_query) {
      const cq = update.callback_query as Record<string, unknown>;
      const cqId = cq.id as string;
      const from = cq.from as Record<string, unknown>;
      const data = cq.data as string;
      const chatId = (cq.message as Record<string, unknown>)?.chat
        ? ((cq.message as Record<string, unknown>).chat as Record<string, unknown>).id as number
        : undefined;

      if (!chatId) return NextResponse.json({ ok: true });

      if (!isAdmin(from.id as number)) {
        await answerCallbackQuery(cqId, "⛔ Нет доступа");
        return NextResponse.json({ ok: true });
      }

      // data format: "review_approve_<id>" or "review_reject_<id>"
      const approveMatch = data.match(/^review_approve_(\d+)$/);
      const rejectMatch = data.match(/^review_reject_(\d+)$/);

      if (approveMatch) {
        const reviewId = approveMatch[1];
        const db = getDb();
        db.prepare(`UPDATE reviews SET is_approved = 1 WHERE id = ?`).run(reviewId);
        await answerCallbackQuery(cqId, "✅ Отзыв опубликован");
        await sendMessage(chatId, `✅ Отзыв #${reviewId} опубликован.`);
      } else if (rejectMatch) {
        const reviewId = rejectMatch[1];
        const db = getDb();
        db.prepare(`DELETE FROM reviews WHERE id = ?`).run(reviewId);
        await answerCallbackQuery(cqId, "🗑 Отзыв удалён");
        await sendMessage(chatId, `🗑 Отзыв #${reviewId} удалён.`);
      }

      return NextResponse.json({ ok: true });
    }

    // Handle regular messages
    const msg = update.message as Record<string, unknown> | undefined;
    const from = (update.message as Record<string, unknown>)?.from as
      | Record<string, unknown>
      | undefined;

    const chatId = msg?.chat
      ? (msg.chat as Record<string, unknown>).id as number
      : undefined;

    if (!chatId || !from) return NextResponse.json({ ok: true });

    // Upsert user
    try {
      const db = getDb();
      db.prepare(
        `INSERT INTO users (telegram_id, first_name, last_name, username, tg_username, tg_user_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(telegram_id) DO UPDATE SET
           first_name = excluded.first_name,
           last_name = excluded.last_name,
           username = excluded.username,
           tg_username = excluded.tg_username,
           tg_user_id = excluded.tg_user_id`
      ).run(
        String(from.id),
        (from.first_name as string) ?? "",
        (from.last_name as string) ?? null,
        (from.username as string) ?? null,
        (from.username as string) ?? null,
        String(from.id)
      );
    } catch {}

    const text = ((update.message as Record<string, unknown>)?.text as string) ?? "";
    const firstName = (from.first_name as string) ?? "друг";
    const tmaUrl = `${APP_URL}/tma`;

    if (text === "/start") {
      await sendMessage(
        chatId,
        `👋 Привет, <b>${firstName}</b>!\n\n` +
          `Добро пожаловать в <b>PrimeClean</b> — профессиональный клининг в Минске ✨\n\n` +
          `Что я умею:\n` +
          `🧮 Рассчитать стоимость уборки\n` +
          `📋 Оформить заказ на удобное время\n` +
          `⭐ Показать отзывы клиентов\n` +
          `📦 Отслеживать историю заказов\n\n` +
          `📞 По всем вопросам: <b>+375 (44) 478-93-60</b>\n\n` +
          `Выберите действие 👇`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Запустить приложение", web_app: { url: tmaUrl } }],
              [{ text: "🌐 Перейти на сайт", url: APP_URL }],
              [{ text: "💬 Написать менеджеру", url: "https://t.me/primeclean_manager" }],
            ],
          },
        }
      );
    } else if (text === "/help") {
      const adminCommands = isAdmin(from.id as number)
        ? `\n\n🔑 <b>Команды администратора:</b>\n/pending — отзывы на модерации`
        : "";
      await sendMessage(
        chatId,
        `ℹ️ <b>Команды бота</b>\n\n` +
          `/start — открыть приложение\n` +
          `/status — мои заявки\n` +
          `/contacts — контакты компании\n` +
          `/help — эта справка` +
          adminCommands
      );
    } else if (text === "/contacts") {
      await sendMessage(
        chatId,
        `📞 <b>Контакты PrimeClean</b>\n\n` +
          `Телефон: <a href="tel:+375444789360">+375 (44) 478-93-60</a>\n` +
          `Email: info@primeclean.by\n\n` +
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
    } else if (text === "/pending" && isAdmin(from.id as number)) {
      // Admin: show pending reviews with approve/reject buttons
      try {
        const db = getDb();
        const pending = db
          .prepare(
            `SELECT id, author_name, rating, text FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC LIMIT 5`
          )
          .all() as Array<{ id: number; author_name: string; rating: number; text: string }>;

        if (pending.length === 0) {
          await sendMessage(chatId, "📭 Нет отзывов на модерации.");
        } else {
          for (const review of pending) {
            const stars = "⭐".repeat(review.rating);
            await sendMessage(
              chatId,
              `📝 <b>Отзыв #${review.id}</b>\n` +
                `👤 ${review.author_name} ${stars}\n\n` +
                `${review.text}`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "✅ Опубликовать", callback_data: `review_approve_${review.id}` },
                      { text: "❌ Удалить", callback_data: `review_reject_${review.id}` },
                    ],
                  ],
                },
              }
            );
          }
        }
      } catch {
        await sendMessage(chatId, "Ошибка при получении отзывов.");
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
