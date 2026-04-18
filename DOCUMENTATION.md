# PrimeClean — Документация проекта

Последнее обновление: 2026-04-18

Проект состоит из **двух продуктов на одном Next.js-приложении**:

1. **Сайт** `primeclean.by` — маркетинговый сайт и публичный калькулятор заказа.
2. **Telegram Mini App (TMA)** `/tma` — приложение внутри Telegram-бота (`@primeclean_bybot`).

База данных — **SQLite** (`better-sqlite3`), файл `data/primeclean.db`.
Хостинг — **Railway** (основной) и опционально Vercel.

---

## 1. Стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 16.2.3 (App Router, Turbopack) |
| UI | React 19.2 + Tailwind-подобные утилиты |
| БД | SQLite (better-sqlite3 12.9) |
| Валидация | Zod 4 |
| TMA SDK | `telegram-web-app.js` (CDN) |
| Деплой | Railway (nixpacks), поддержка Vercel |

---

## 2. Структура репозитория

```
primeclean/
├── app/
│   ├── (сайт)                  # / , /services, /contacts, /blog, ...
│   ├── tma/                    # Telegram Mini App
│   │   ├── layout.tsx          # viewport lock, CSS reset, TG WebApp script
│   │   └── page.tsx            # splash → onboarding → 5 tabs
│   └── api/
│       ├── bookings/           # POST создание, GET/slots занятые слоты
│       ├── reviews/            # GET одобренные, POST создание на модерацию
│       ├── services/           # каталог услуг
│       ├── admin/tma/          # админ-API (check, reviews, bookings, analytics)
│       ├── telegram/webhook/   # обработчик сообщений от Telegram
│       └── cron/reminders/     # напоминания за 1 час до уборки
├── components/
│   ├── tma/                    # компоненты приложения
│   │   ├── BottomNav.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Skeleton.tsx
│   │   ├── SupportFAB.tsx
│   │   ├── AddressPicker.tsx
│   │   ├── HomeStories.tsx
│   │   └── tabs/               # HomeTab, ServicesTab, OrderTab, ReviewsTab, ProfileTab, AdminTab
│   └── ...                     # компоненты сайта
├── lib/
│   ├── db/index.ts             # lazy singleton + initSchema + runMigrations
│   ├── services.ts             # каталог услуг (источник истины)
│   └── tma/useTelegramWebApp.ts
├── data/primeclean.db          # SQLite файл (создаётся автоматически)
├── railway.toml                # Railway конфиг
├── vercel.json                 # Vercel cron config
└── nixpacks.toml               # build-окружение (Node 20 + python3 + gcc)
```

---

## 3. Переменные окружения

Все задаются в панели Railway (Settings → Variables) или локально в `.env.local`.

| Переменная | Обязательно | Описание |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | да | Токен бота, полученный от @BotFather |
| `NEXT_PUBLIC_APP_URL` | да | Полный URL, например `https://primeclean.by` |
| `ADMIN_TG_IDS` | да | ID админов через запятую (например `123456789,987654321`) |
| `CRON_SECRET` | нет | Секрет для защиты `/api/cron/reminders` |
| `DB_PATH` | нет | Альт. путь к SQLite (по умолчанию `data/primeclean.db`) |

Получить свой Telegram ID можно у @userinfobot.

---

## 4. База данных

SQLite-файл лежит в `data/primeclean.db`. Первый запуск автоматически создаёт схему и применяет миграции из `lib/db/index.ts` (функция `runMigrations`).

### 4.1 Таблицы

#### `users`
Telegram-пользователи, которые запускали бота или TMA.

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PK | |
| `telegram_id` | TEXT UNIQUE | ID из Telegram |
| `first_name`, `last_name`, `username` | TEXT | |
| `tg_username`, `tg_user_id` | TEXT | Дубликаты для удобства JOIN |
| `phone` | TEXT | Сохраняется после `requestContact` |
| `created_at` | TEXT | |

#### `bookings`
Заявки на уборку.

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PK | |
| `user_telegram_id` | TEXT | Кто заказал (может быть null для анонимных с сайта) |
| `name`, `phone` | TEXT | Контактные данные |
| `service_slug`, `service_name` | TEXT | Услуга |
| `booking_date` (YYYY-MM-DD), `booking_time` (HH:MM) | TEXT | |
| `address`, `rooms`, `area` | | |
| `extras` | TEXT (JSON) | `{"windows": 2, "balcony": 1}` |
| `price_estimate` | REAL | Расчётная сумма в BYN |
| `comment` | TEXT | |
| `contact_preference` | TEXT | `callback` / `chat` |
| `status` | TEXT | `new` → `confirmed` → `in_progress` → `done` / `cancelled` |
| `source` | TEXT | `website` / `tma` |
| `reminder_sent` | INTEGER | 0/1 — отправлено ли напоминание за час |
| `created_at`, `updated_at` | TEXT | |

#### `reviews`
Отзывы клиентов.

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PK | |
| `user_telegram_id` | TEXT | |
| `author_name`, `rating` (1..5), `service_name`, `text` | | |
| `photo_url` | TEXT | Относительный путь к загруженной фотографии |
| `is_approved` | INTEGER | 0 — на модерации, 1 — опубликован |
| `created_at` | TEXT | |

### 4.2 Индексы

Созданы автоматически миграциями:

- `idx_bookings_date` — по дате
- `idx_bookings_user` — по telegram_id
- `idx_bookings_reminder` — для быстрого поиска не отправленных напоминаний
- `idx_reviews_approved` — для ленты отзывов

### 4.3 Как делать миграции

**Никогда не удаляй колонки и не переименовывай их в существующих таблицах.**
Добавь новую миграцию в массив `migrations` внутри `runMigrations()`:

```ts
const migrations = [
  // ...уже существующие...
  `ALTER TABLE bookings ADD COLUMN new_field TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_new ON bookings(new_field)`,
];
```

Все операторы обёрнуты в `try/catch` — повторный запуск безопасен (если колонка уже есть, ошибка игнорируется).

### 4.4 Бэкапы

Railway volume хранит `data/` между деплоями, но **реплицировать БД нужно вручную**. Рекомендуемая схема:

1. Подключение по Railway CLI: `railway run bash`, затем `cp data/primeclean.db /tmp/backup.db`.
2. Скачивание: `railway run cat data/primeclean.db > backup.db` (локально).
3. Автобэкап: cron, который раз в день копирует БД в S3/Backblaze/Яндекс.Облако. См. `RECOMMENDATIONS.md`.

---

## 5. Публичные API-маршруты

### `POST /api/bookings`
Создаёт заявку. Тело — JSON с полями brief заказа. Возвращает `{ id }`. Дубликаты по `user_telegram_id + booking_date + booking_time` предотвращаются клиентом.

### `GET /api/bookings/slots?date=YYYY-MM-DD`
Возвращает `{ date, taken: ["10:00", "14:00"] }` — занятые слоты (кроме отменённых). Используется в `OrderTab` для скрытия недоступного времени.

### `GET /api/reviews`
Возвращает одобренные отзывы. Параметр `?limit=n`.

### `POST /api/reviews`
Создаёт отзыв со статусом `is_approved = 0`. Одновременно шлёт админу в Telegram с кнопками «Опубликовать / Удалить».

### `GET /api/services`
Каталог услуг (источник — `lib/services.ts`).

---

## 6. Админ-API (`/api/admin/tma`)

Проверка прав: `tgId` должен быть в `ADMIN_TG_IDS`.

| Action | Метод | Описание |
|---|---|---|
| `check` | GET | `{ isAdmin: bool }` |
| `reviews` | GET | список отзывов (с фильтром `status=pending/approved/all`) |
| `bookings` | GET | список заявок (фильтры: `status`, `period=today/week/month/all`) |
| `analytics` | GET | агрегированная статистика (см. ниже) |
| `review` | PATCH | `{ id, status: "approve"/"delete" }` |
| `booking` | PATCH | `{ id, status }` или `{ id, action: "delete" }` |

`analytics` возвращает:
- `totalBookings`, `totalUsers`, `avgRating`
- `byStatus`, `bySource`, `topServices`
- `last30` — массив точек для sparkline
- `revenueTotal`, `newToday`, `upcomingCount`

---

## 7. Telegram-бот

### 7.1 Настройка

1. Создать бота у @BotFather, получить токен → `TELEGRAM_BOT_TOKEN`.
2. Установить webhook:

   ```bash
   curl -X POST "https://api.telegram.org/bot$TOKEN/setWebhook" \
     -d "url=https://primeclean.by/api/telegram/webhook"
   ```

3. В @BotFather → `/mybots` → Bot Settings → Menu Button → задать URL `https://primeclean.by/tma` и текст «🧹 Открыть PrimeClean».
4. В @BotFather → Mini Apps → привязать к боту (для функций Mini App).

### 7.2 Команды

| Команда | Для | Действие |
|---|---|---|
| `/start` | все | Приветствие + кнопки: запустить приложение, открыть сайт, позвонить, написать |
| `/help` | все | Список команд (админу показывает `/pending`) |
| `/status` | все | Последние 5 заявок пользователя |
| `/contacts` | все | Контакты компании |
| `/pending` | админ | Отзывы на модерации с кнопками ✅/❌ |

### 7.3 Напоминания (`/api/cron/reminders`)

Находит заявки с `reminder_sent = 0`, `status in (new, confirmed)` и временем в интервале «сейчас + 55…65 минут», шлёт сообщение клиенту и ставит `reminder_sent = 1`.

Нужен внешний планировщик (Vercel Hobby-план не даёт cron чаще раза в сутки, встроенного cron у Railway тоже нет):

- **Вариант 1 (рекомендуемый) — cron-job.org.** Бесплатно, до минуты. Создай задачу: URL `https://primeclean.by/api/cron/reminders?secret=<CRON_SECRET>`, расписание `*/5 * * * *`.
- **Вариант 2 — Railway Schedules.** В проекте Railway добавь сервис типа «cron» с командой `curl -H "x-cron-secret: $CRON_SECRET" https://primeclean.by/api/cron/reminders` и расписанием `*/5 * * * *`.
- **Вариант 3 — Vercel Pro.** Только на платном тарифе, т.к. Hobby ограничен 1 запуском в сутки. Файл `vercel.json` с блоком `crons` нужно добавить вручную при апгрейде.
- **Вариант 4 — UptimeRobot (костыль).** Бесплатный HTTP-мониторинг пингует URL каждые 5 минут — можно натравить на тот же эндпоинт с query-секретом.

---

## 8. TMA (Telegram Mini App)

Маршрут `/tma`. Компоненты — в `components/tma/`.

### 8.1 Жизненный цикл

```
SplashScreen (логотип, 1.5 сек) → Onboarding (если не показан) → main (вкладки)
```

Флаг «онбординг показан» хранится в `localStorage` под ключом `pc_tma_onboarded`.

### 8.2 Вкладки

| Вкладка | Компонент | Что делает |
|---|---|---|
| Главная | `HomeTab` | Stories, топ-услуги, контакты (tel/mailto через bottom-sheet) |
| Услуги | `ServicesTab` | Каталог с ценами |
| Заказать | `OrderTab` | Мульти-шаговая форма: услуга → параметры → дата/время → контакты |
| Отзывы | `ReviewsTab` | Лента одобренных + форма создания (до 10 МБ фото) |
| Профиль | `ProfileTab` | Данные пользователя, история заказов, статистика |
| Админ | `AdminTab` | Виден только `ADMIN_TG_IDS` — дашборд, заявки, модерация |

### 8.3 Блокировка зума и жестов

Защита настроена в `app/tma/page.tsx`:

- `viewport: maximumScale=1, userScalable=false`
- `webApp.disableVerticalSwipes()`, `requestFullscreen()`, `lockOrientation()`
- Блокировка `gesturestart/change/end`, двойного тапа (<350 мс), мульти-тач `touchmove`
- Глобальный CSS: `touch-action: manipulation`, `overscroll-behavior: none`

### 8.4 Haptic feedback

Смена вкладок → `webApp.hapticFeedback.selectionChanged()`.

---

## 9. Локальная разработка

```bash
npm install
npm run dev          # http://localhost:3000
```

Для теста TMA локально:
- Используй `ngrok http 3000` для публичного URL.
- В @BotFather подставь URL ngrok в Menu Button.
- В `.env.local` выставь `NEXT_PUBLIC_APP_URL=https://<your-ngrok>.ngrok.io`.

### Полезные команды

```bash
npm run build        # продакшен сборка
npm run lint         # проверка ESLint
npx next build       # альтернативный способ
npx tsc --noEmit     # type-check без эмита
```

---

## 10. Деплой

### Railway

1. Подключи репозиторий к Railway-проекту.
2. Добавь переменные окружения (раздел 3).
3. Подключи persistent volume к пути `/app/data` (иначе БД стирается между деплоями!).
4. Добавь кастомный домен `primeclean.by`.
5. Деплой происходит автоматически при push в `master`.

### Vercel (опционально)

1. Импортируй репозиторий.
2. Переменные окружения те же.
3. SQLite на Vercel требует serverless-friendly БД — **не рекомендуется для production**. Используй только для препродакшена или вынеси БД на Turso/Neon.

---

## 11. Типичные задачи

### Добавить новую услугу

Отредактируй `lib/services.ts` — это единственный источник истины. Каталог подтянется и в TMA, и в сайт-формы.

### Выдать человеку права админа

Узнай его Telegram ID (@userinfobot), добавь в `ADMIN_TG_IDS` (через запятую), передеплой.

### Посмотреть свежие заявки

Через бота: `/status` (свои) или `/pending` (админу — отзывы).
Через TMA: вкладка «Админ» → «Заявки».
Через БД напрямую: `sqlite3 data/primeclean.db "SELECT * FROM bookings ORDER BY id DESC LIMIT 20"`.

### Восстановить «потерянного» клиента

Если TMA не отправил заявку, но клиент начал писать боту — в таблице `users` уже есть запись. Скопируй `telegram_id` и создай заявку вручную через админку или через `POST /api/bookings`.
