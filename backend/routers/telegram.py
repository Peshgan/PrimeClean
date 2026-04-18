"""Telegram webhook handler — mirrors the logic in app/api/telegram/webhook/route.ts."""

import httpx
from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

import config
from database import SessionLocal

router = APIRouter(prefix="/webhook", tags=["telegram"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_admin(telegram_id: int | str) -> bool:
    return str(telegram_id) in config.ADMIN_TG_IDS


async def _send_message(
    client: httpx.AsyncClient,
    chat_id: int,
    text: str,
    **extra: object,
) -> None:
    if not config.TELEGRAM_BOT_TOKEN:
        return
    try:
        await client.post(
            f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML", **extra},
        )
    except Exception:
        pass


async def _answer_callback_query(
    client: httpx.AsyncClient,
    callback_query_id: str,
    text: str | None = None,
) -> None:
    if not config.TELEGRAM_BOT_TOKEN:
        return
    try:
        payload: dict = {"callback_query_id": callback_query_id}
        if text:
            payload["text"] = text
        await client.post(
            f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
            json=payload,
        )
    except Exception:
        pass


def _upsert_user(db: Session, from_data: dict) -> None:
    try:
        db.execute(
            __import__("sqlalchemy").text(
                """
                INSERT INTO users (telegram_id, first_name, last_name, username, tg_username, tg_user_id)
                VALUES (:tid, :first, :last, :uname, :uname, :tid)
                ON CONFLICT (telegram_id) DO UPDATE SET
                    first_name  = EXCLUDED.first_name,
                    last_name   = EXCLUDED.last_name,
                    username    = EXCLUDED.username,
                    tg_username = EXCLUDED.tg_username,
                    tg_user_id  = EXCLUDED.tg_user_id
                """
            ),
            {
                "tid": str(from_data.get("id", "")),
                "first": from_data.get("first_name", ""),
                "last": from_data.get("last_name"),
                "uname": from_data.get("username"),
            },
        )
        db.commit()
    except Exception:
        db.rollback()


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
) -> JSONResponse:
    # Always return 200 so Telegram doesn't retry on our errors.
    ok = JSONResponse({"ok": True})

    if not config.TELEGRAM_BOT_TOKEN:
        return ok

    # Verify webhook secret when configured
    if config.TELEGRAM_WEBHOOK_SECRET:
        if x_telegram_bot_api_secret_token != config.TELEGRAM_WEBHOOK_SECRET:
            return ok

    try:
        update: dict = await request.json()
    except Exception:
        return ok

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # ----------------------------------------------------------------
            # callback_query — inline button press (review moderation)
            # ----------------------------------------------------------------
            if "callback_query" in update:
                cq: dict = update["callback_query"]
                cq_id: str = cq["id"]
                from_data: dict = cq.get("from", {})
                data: str = cq.get("data", "")
                msg: dict = cq.get("message", {})
                chat_id: int | None = msg.get("chat", {}).get("id")

                if not chat_id:
                    return ok

                if not _is_admin(from_data.get("id", "")):
                    await _answer_callback_query(client, cq_id, "⛔ Нет доступа")
                    return ok

                import re
                approve_match = re.match(r"^review_approve_(\d+)$", data)
                reject_match = re.match(r"^review_reject_(\d+)$", data)

                db: Session = SessionLocal()
                try:
                    if approve_match:
                        review_id = int(approve_match.group(1))
                        db.execute(
                            __import__("sqlalchemy").text(
                                "UPDATE reviews SET is_approved = 1 WHERE id = :id"
                            ),
                            {"id": review_id},
                        )
                        db.commit()
                        await _answer_callback_query(client, cq_id, "✅ Отзыв опубликован")
                        await _send_message(client, chat_id, f"✅ Отзыв #{review_id} опубликован.")
                    elif reject_match:
                        review_id = int(reject_match.group(1))
                        db.execute(
                            __import__("sqlalchemy").text(
                                "DELETE FROM reviews WHERE id = :id"
                            ),
                            {"id": review_id},
                        )
                        db.commit()
                        await _answer_callback_query(client, cq_id, "🗑 Отзыв удалён")
                        await _send_message(client, chat_id, f"🗑 Отзыв #{review_id} удалён.")
                finally:
                    db.close()

                return ok

            # ----------------------------------------------------------------
            # Regular message
            # ----------------------------------------------------------------
            msg = update.get("message", {})
            from_data = msg.get("from", {})
            chat_id = msg.get("chat", {}).get("id")

            if not chat_id or not from_data:
                return ok

            # Upsert user record
            db = SessionLocal()
            try:
                _upsert_user(db, from_data)
            finally:
                db.close()

            text_cmd: str = msg.get("text", "")
            first_name: str = from_data.get("first_name", "друг")
            tma_url = f"{config.APP_URL}/tma"

            if text_cmd == "/start":
                await _send_message(
                    client,
                    chat_id,
                    f"👋 Привет, <b>{first_name}</b>!\n\n"
                    "Добро пожаловать в <b>PrimeClean</b> — профессиональный клининг в Минске ✨\n\n"
                    "Что я умею:\n"
                    "🧮 Рассчитать стоимость уборки\n"
                    "📋 Оформить заказ на удобное время\n"
                    "⭐ Показать отзывы клиентов\n"
                    "📦 Отслеживать историю заказов\n\n"
                    "📞 По всем вопросам: <b>+375 (44) 478-93-60</b>\n\n"
                    "Выберите действие 👇",
                    reply_markup={
                        "inline_keyboard": [
                            [{"text": "🚀 Запустить приложение", "web_app": {"url": tma_url}}],
                            [{"text": "🌐 Перейти на сайт", "url": config.APP_URL}],
                            [{"text": "💬 Написать менеджеру", "url": "https://t.me/primeclean_manager"}],
                        ]
                    },
                )

            elif text_cmd == "/help":
                admin_commands = (
                    "\n\n🔑 <b>Команды администратора:</b>\n/pending — отзывы на модерации"
                    if _is_admin(from_data.get("id", ""))
                    else ""
                )
                await _send_message(
                    client,
                    chat_id,
                    "ℹ️ <b>Команды бота</b>\n\n"
                    "/start — открыть приложение\n"
                    "/status — мои заявки\n"
                    "/contacts — контакты компании\n"
                    "/help — эта справка"
                    + admin_commands,
                )

            elif text_cmd == "/contacts":
                await _send_message(
                    client,
                    chat_id,
                    "📞 <b>Контакты PrimeClean</b>\n\n"
                    'Телефон: <a href="tel:+375444789360">+375 (44) 478-93-60</a>\n'
                    "Email: info@primeclean.by\n\n"
                    "⏰ Режим работы:\n"
                    "Пн–Пт: 08:00–20:00\n"
                    "Сб–Вс: 09:00–18:00",
                )

            elif text_cmd == "/status":
                db = SessionLocal()
                try:
                    from sqlalchemy import text as sa_text
                    rows = db.execute(
                        sa_text(
                            """
                            SELECT id, service_name, booking_date, booking_time, status
                            FROM bookings
                            WHERE user_telegram_id = :tid
                            ORDER BY created_at DESC LIMIT 5
                            """
                        ),
                        {"tid": str(from_data["id"])},
                    ).fetchall()
                finally:
                    db.close()

                if not rows:
                    await _send_message(
                        client,
                        chat_id,
                        "📋 У вас пока нет заявок.\n\nОформите заказ через приложение!",
                        reply_markup={
                            "inline_keyboard": [
                                [{"text": "🧹 Открыть приложение", "web_app": {"url": tma_url}}]
                            ]
                        },
                    )
                else:
                    status_emoji = {
                        "new": "🆕",
                        "confirmed": "✅",
                        "in_progress": "🔄",
                        "done": "✔️",
                        "cancelled": "❌",
                    }
                    lines = "\n\n".join(
                        f"#{r.id} — {r.service_name or 'Услуга'}\n"
                        f"📅 {r.booking_date} в {r.booking_time}\n"
                        f"{status_emoji.get(r.status, '📦')} {r.status}"
                        for r in rows
                    )
                    await _send_message(client, chat_id, f"📋 <b>Ваши заявки:</b>\n\n{lines}")

            elif text_cmd == "/pending" and _is_admin(from_data.get("id", "")):
                db = SessionLocal()
                try:
                    from sqlalchemy import text as sa_text
                    rows = db.execute(
                        sa_text(
                            """
                            SELECT id, author_name, rating, text
                            FROM reviews
                            WHERE is_approved = 0
                            ORDER BY created_at DESC LIMIT 5
                            """
                        )
                    ).fetchall()
                finally:
                    db.close()

                if not rows:
                    await _send_message(client, chat_id, "📭 Нет отзывов на модерации.")
                else:
                    for review in rows:
                        stars = "⭐" * review.rating
                        await _send_message(
                            client,
                            chat_id,
                            f"📝 <b>Отзыв #{review.id}</b>\n"
                            f"👤 {review.author_name} {stars}\n\n"
                            f"{review.text}",
                            reply_markup={
                                "inline_keyboard": [
                                    [
                                        {"text": "✅ Опубликовать", "callback_data": f"review_approve_{review.id}"},
                                        {"text": "❌ Удалить", "callback_data": f"review_reject_{review.id}"},
                                    ]
                                ]
                            },
                        )

            else:
                await _send_message(
                    client,
                    chat_id,
                    "Используйте наше приложение для заказа клининга 👇",
                    reply_markup={
                        "inline_keyboard": [
                            [{"text": "🧹 Открыть PrimeClean", "web_app": {"url": tma_url}}]
                        ]
                    },
                )

    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("[Telegram webhook] %s", exc, exc_info=True)

    return ok
