from datetime import datetime

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_telegram_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    tg_username: Mapped[str | None] = mapped_column(Text, nullable=True)
    tg_user_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(Text, nullable=False)
    service_slug: Mapped[str] = mapped_column(Text, nullable=False)
    service_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    booking_date: Mapped[str] = mapped_column(Text, nullable=False)
    booking_time: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    rooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    area: Mapped[float | None] = mapped_column(Float, nullable=True)
    extras: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    price_estimate: Mapped[float | None] = mapped_column(Float, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_preference: Mapped[str] = mapped_column(
        String(20), nullable=False, default="callback"
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="new")
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="website")
    reminder_sent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default=lambda: datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S"),
    )
    updated_at: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default=lambda: datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S"),
    )
