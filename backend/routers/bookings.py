import json
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

import config
from database import get_db
from models.booking import Booking

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class BookingCreate(BaseModel):
    name: str
    phone: str
    serviceSlug: str
    serviceName: str | None = None
    bookingDate: str
    bookingTime: str
    address: str | None = None
    rooms: int | None = None
    area: float | None = None
    extras: list[str] | dict[str, int] | None = None
    priceEstimate: float | None = None
    comment: str | None = None
    userTelegramId: str | None = None
    tgUsername: str | None = None
    tgUserId: str | None = None
    contactPreference: str = "callback"
    source: str = "website"

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str) -> str:
        if len(v) < 2 or len(v) > 100:
            raise ValueError("name must be between 2 and 100 characters")
        return v

    @field_validator("phone")
    @classmethod
    def phone_length(cls, v: str) -> str:
        if len(v) < 7 or len(v) > 20:
            raise ValueError("phone must be between 7 and 20 characters")
        return v

    @field_validator("comment")
    @classmethod
    def comment_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("comment must not exceed 500 characters")
        return v

    @field_validator("contactPreference")
    @classmethod
    def contact_pref_enum(cls, v: str) -> str:
        if v not in ("callback", "chat"):
            raise ValueError("contactPreference must be 'callback' or 'chat'")
        return v

    @field_validator("source")
    @classmethod
    def source_enum(cls, v: str) -> str:
        if v not in ("website", "telegram"):
            raise ValueError("source must be 'website' or 'telegram'")
        return v


class BookingResponse(BaseModel):
    success: bool
    bookingId: int
    message: str


class BookingListItem(BaseModel):
    id: int
    service_name: str | None
    service_slug: str
    booking_date: str
    booking_time: str
    price_estimate: float | None
    status: str
    created_at: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_EXTRAS_LABELS: dict[str, str] = {
    "windows": "Мойка окон",
    "fridge": "Холодильник",
    "oven": "Духовка",
    "balcony": "Балкон",
    "ironing": "Глажка",
    "sofa2": "Диван 2-мест.",
    "sofa3": "Диван 3-мест.",
    "sofa_corner": "Угловой диван",
    "mat1_1": "Матрас 1-сп",
    "mat2_1": "Матрас 2-сп",
    "chair": "Кресло",
    "stool": "Стул",
}


def _normalize_extras(
    extras: list[str] | dict[str, int] | None,
) -> dict[str, int] | None:
    if extras is None:
        return None
    if isinstance(extras, list):
        return {k: 1 for k in extras}
    return extras


def _format_extras(extras: dict[str, int] | None) -> str:
    if not extras:
        return "—"
    parts = [
        f"{_EXTRAS_LABELS.get(k, k)}{f' ×{q}' if q > 1 else ''}"
        for k, q in extras.items()
        if q > 0
    ]
    return ", ".join(parts) if parts else "—"


async def _notify_admin(booking_id: int, data: BookingCreate, extras: dict[str, int] | None) -> None:
    token = config.TELEGRAM_BOT_TOKEN
    chat = config.TELEGRAM_ADMIN_CHAT_ID
    if not token or not chat:
        return

    tg_part: str
    if data.tgUsername:
        tg_part = f"@{data.tgUsername}"
    elif data.tgUserId:
        tg_part = f'<a href="tg://user?id={data.tgUserId}">Telegram</a>'
    else:
        tg_part = "—"

    text = (
        f"📋 <b>Новая заявка #{booking_id}</b>\n\n"
        f"👤 {data.name} | <code>{data.phone}</code>\n"
        f"🧹 {data.serviceName or data.serviceSlug}\n"
        f"📅 {data.bookingDate} в {data.bookingTime}\n"
        f"💰 ~{data.priceEstimate or '?'} BYN\n"
        f"📍 {data.address or 'не указан'}\n"
        f"➕ {_format_extras(extras)}\n"
        f"💬 {data.comment or '—'}\n"
        f"📲 {tg_part}\n"
        f"🔌 {data.source}"
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat, "text": text, "parse_mode": "HTML"},
            )
    except Exception:
        pass  # Never let notification failure break the booking flow


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
) -> BookingResponse:
    extras = _normalize_extras(payload.extras)
    extras_json = json.dumps(extras, ensure_ascii=False) if extras else None

    booking = Booking(
        user_telegram_id=payload.userTelegramId or payload.tgUserId,
        tg_username=payload.tgUsername,
        tg_user_id=payload.tgUserId,
        name=payload.name,
        phone=payload.phone,
        service_slug=payload.serviceSlug,
        service_name=payload.serviceName,
        booking_date=payload.bookingDate,
        booking_time=payload.bookingTime,
        address=payload.address,
        rooms=payload.rooms,
        area=payload.area,
        extras=extras_json,
        price_estimate=payload.priceEstimate,
        comment=payload.comment,
        contact_preference=payload.contactPreference,
        source=payload.source,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    await _notify_admin(booking.id, payload, extras)

    return BookingResponse(
        success=True,
        bookingId=booking.id,
        message="Заявка принята! Перезвоним в течение 15 минут.",
    )


@router.get("", response_model=list[BookingListItem])
def list_bookings(
    telegramId: str = Query(..., description="Telegram user ID"),
    db: Session = Depends(get_db),
) -> list[Any]:
    bookings = (
        db.query(Booking)
        .filter(Booking.user_telegram_id == telegramId)
        .order_by(Booking.created_at.desc())
        .limit(20)
        .all()
    )
    return bookings
