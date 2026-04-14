# Руководство по подключению FastAPI + Telegram Mini App

## Обзор архитектуры

```
Next.js (сайт) ──→ FastAPI (бэкенд) ──→ PostgreSQL / Redis
                        │
                   Telegram Bot API
                        │
                   TG Mini App (этот же Next.js или отдельный React)
```

---

## 1. FastAPI — структура проекта

```
backend/
├── main.py
├── config.py
├── database.py
├── models/
│   ├── booking.py
│   └── user.py
├── routers/
│   ├── bookings.py
│   ├── webhook.py
│   └── tg_auth.py
├── services/
│   ├── telegram.py
│   └── notifications.py
└── requirements.txt
```

### requirements.txt

```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.0
sqlalchemy>=2.0
alembic
psycopg2-binary
python-telegram-bot>=21.0
redis
httpx
python-jose[cryptography]   # JWT для TG Mini App auth
python-dotenv
```

---

## 2. Переменные окружения

Создайте `.env` в корне бэкенда:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/primeclean
REDIS_URL=redis://localhost:6379/0

# Telegram
TELEGRAM_BOT_TOKEN=7xxxxxxxxx:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_BOT_SECRET=any-random-secret-string   # для проверки webhook

# JWT
JWT_SECRET=your-very-long-random-secret
JWT_ALGORITHM=HS256

# CORS — укажите домен вашего Next.js сайта
FRONTEND_URL=https://primeclean.by
```

---

## 3. Подключение бэкенда к Next.js

### 3.1 Заменить server action на API-запрос

В [lib/actions/booking.ts](lib/actions/booking.ts) замените симуляцию на реальный вызов:

```typescript
// lib/actions/booking.ts
"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  service: z.string().min(1),
  area: z.string().optional(),
  comment: z.string().optional(),
});

export async function createBooking(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Проверьте правильность заполнения формы." };
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) throw new Error("Backend error");

    return { success: true };
  } catch {
    return { success: false, error: "Не удалось отправить заявку. Попробуйте позже." };
  }
}
```

Добавьте в `.env.local` Next.js:
```env
BACKEND_URL=https://api.primeclean.by   # или http://localhost:8000 для разработки
```

### 3.2 FastAPI — роутер бронирований

```python
# routers/bookings.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.notifications import notify_manager

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

class BookingCreate(BaseModel):
    name: str
    phone: str
    service: str
    area: str | None = None
    comment: str | None = None

@router.post("/")
async def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    # 1. Сохранить в БД
    booking = Booking(**data.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 2. Уведомить менеджера в Telegram
    await notify_manager(booking)

    return {"id": booking.id, "status": "received"}
```

---

## 4. Telegram Bot + Mini App

### 4.1 Создать бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте бота: `/newbot` → введите имя → получите токен
3. Установите Mini App: `/newapp` → выберите бота → введите URL вашего сайта

### 4.2 Webhook для уведомлений менеджеру

```python
# services/notifications.py
import httpx
from config import settings

MANAGER_CHAT_ID = "ваш_chat_id"  # получите через @userinfobot

async def notify_manager(booking):
    text = (
        f"📋 *Новая заявка #{booking.id}*\n\n"
        f"👤 Имя: {booking.name}\n"
        f"📞 Телефон: {booking.phone}\n"
        f"🏠 Услуга: {booking.service}\n"
        f"📐 Площадь: {booking.area or '—'}\n"
        f"💬 Комментарий: {booking.comment or '—'}"
    )

    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={
                "chat_id": MANAGER_CHAT_ID,
                "text": text,
                "parse_mode": "Markdown",
            }
        )
```

### 4.3 Регистрация webhook

После деплоя выполните один раз:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.primeclean.by/webhook/telegram", "secret_token": "ваш_TELEGRAM_BOT_SECRET"}'
```

### 4.4 Обработка webhook в FastAPI

```python
# routers/webhook.py
from fastapi import APIRouter, Request, Header, HTTPException
from config import settings

router = APIRouter(prefix="/webhook", tags=["webhook"])

@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    if x_telegram_bot_api_secret_token != settings.TELEGRAM_BOT_SECRET:
        raise HTTPException(status_code=403)

    data = await request.json()
    # Обработайте входящие сообщения здесь
    return {"ok": True}
```

---

## 5. Telegram Mini App — аутентификация

Mini App передаёт `initData` — подписанные данные о пользователе. Нужно проверить подпись на бэкенде.

### 5.1 Проверка initData (FastAPI)

```python
# routers/tg_auth.py
import hashlib, hmac
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import settings
from urllib.parse import unquote

router = APIRouter(prefix="/api/auth", tags=["auth"])

class TgAuthRequest(BaseModel):
    init_data: str  # строка из window.Telegram.WebApp.initData

@router.post("/telegram")
async def telegram_auth(body: TgAuthRequest):
    data = body.init_data
    # Парсим и проверяем HMAC
    params = dict(p.split("=", 1) for p in data.split("&") if "=" in p)
    received_hash = params.pop("hash", "")

    data_check_string = "\n".join(
        f"{k}={unquote(v)}" for k, v in sorted(params.items())
    )
    secret_key = hmac.new(b"WebAppData", settings.TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid initData")

    # Вернуть JWT токен
    from jose import jwt
    import json
    user_data = json.loads(unquote(params.get("user", "{}")))
    token = jwt.encode(
        {"sub": str(user_data.get("id")), "name": user_data.get("first_name")},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return {"token": token, "user": user_data}
```

### 5.2 Использование в Next.js (Mini App сторона)

```typescript
// В Telegram Mini App контексте
declare global {
  interface Window {
    Telegram: { WebApp: { initData: string; expand: () => void } };
  }
}

async function authWithTelegram() {
  const initData = window.Telegram.WebApp.initData;
  const res = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ init_data: initData }),
  });
  const { token, user } = await res.json();
  localStorage.setItem("tg_token", token);
  return user;
}
```

---

## 6. Подготовка Next.js под Mini App

### 6.1 Добавить Telegram Web App SDK

В [app/layout.tsx](app/layout.tsx) добавьте в `<head>`:

```tsx
<script src="https://telegram.org/js/telegram-web-app.js" />
```

### 6.2 Определить контекст запуска

```typescript
// lib/telegram.ts
export function isTelegramMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Telegram?.WebApp?.initData);
}

export function getTelegramUser() {
  if (!isTelegramMiniApp()) return null;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const userStr = params.get("user");
  return userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
}
```

### 6.3 Адаптация UI под Mini App

Создайте провайдер, который скрывает Header/Footer в контексте Mini App:

```tsx
// components/TelegramProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TgContext = createContext(false);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);
  useEffect(() => {
    setIsMiniApp(Boolean(window.Telegram?.WebApp?.initData));
    window.Telegram?.WebApp?.expand();
  }, []);
  return <TgContext.Provider value={isMiniApp}>{children}</TgContext.Provider>;
}

export const useIsMiniApp = () => useContext(TgContext);
```

---

## 7. Деплой

### Рекомендуемый стек

| Сервис | Назначение |
|--------|-----------|
| **Vercel** | Next.js фронтенд |
| **Railway / Render** | FastAPI бэкенд |
| **Supabase / Neon** | PostgreSQL |
| **Upstash** | Redis |

### Быстрый запуск бэкенда локально

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Применить миграции
alembic upgrade head

# Запустить
uvicorn main:app --reload --port 8000
```

### CORS в FastAPI

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://primeclean.by",
        "http://localhost:3000",  # для разработки
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import bookings, webhook, tg_auth
app.include_router(bookings.router)
app.include_router(webhook.router)
app.include_router(tg_auth.router)
```

---

## 8. Что делать дальше (чеклист)

- [ ] Создать Telegram бота через @BotFather, получить токен
- [ ] Получить свой `chat_id` для уведомлений (через @userinfobot)
- [ ] Развернуть PostgreSQL (Supabase free tier подходит)
- [ ] Задеплоить FastAPI (Railway — проще всего, бесплатный старт)
- [ ] Заменить `createBooking` server action на реальный fetch к API
- [ ] Зарегистрировать webhook Telegram
- [ ] Добавить `telegram-web-app.js` в layout.tsx
- [ ] Настроить CORS с вашим доменом
- [ ] Протестировать Mini App через @BotFather → Edit Bot → Bot Menu Button

---

> Есть вопросы по интеграции? Все ключевые точки входа уже подготовлены в коде — `lib/actions/booking.ts` для форм, `app/layout.tsx` для SDK.
