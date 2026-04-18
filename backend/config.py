import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.environ["DATABASE_URL"]
TELEGRAM_BOT_TOKEN: str | None = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_WEBHOOK_SECRET: str | None = os.environ.get("TELEGRAM_WEBHOOK_SECRET")
TELEGRAM_ADMIN_CHAT_ID: str | None = os.environ.get("TELEGRAM_ADMIN_CHAT_ID")
ADMIN_TG_IDS: set[str] = set(
    s.strip()
    for s in os.environ.get("ADMIN_TG_IDS", "").split(",")
    if s.strip()
)
APP_URL: str = os.environ.get("NEXT_PUBLIC_APP_URL", "https://primeclean.by")
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://primeclean.by,http://localhost:3000",
    ).split(",")
    if origin.strip()
]
