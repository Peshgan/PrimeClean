"""create bookings table

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users table (referenced by bookings via user_telegram_id)
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL PRIMARY KEY,
            telegram_id TEXT UNIQUE NOT NULL,
            first_name  TEXT,
            last_name   TEXT,
            username    TEXT,
            tg_username TEXT,
            tg_user_id  TEXT,
            phone       TEXT,
            created_at  TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS'))
        )
        """
    )

    # bookings table
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS bookings (
            id                 SERIAL PRIMARY KEY,
            user_telegram_id   TEXT,
            tg_username        TEXT,
            tg_user_id         TEXT,
            name               TEXT NOT NULL,
            phone              TEXT NOT NULL,
            service_slug       TEXT NOT NULL,
            service_name       TEXT,
            booking_date       TEXT NOT NULL,
            booking_time       TEXT NOT NULL,
            address            TEXT,
            rooms              INTEGER,
            area               REAL,
            extras             TEXT,
            price_estimate     REAL,
            comment            TEXT,
            contact_preference TEXT DEFAULT 'callback',
            status             TEXT DEFAULT 'new',
            source             TEXT DEFAULT 'website',
            reminder_sent      INTEGER DEFAULT 0,
            created_at         TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS')),
            updated_at         TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS'))
        )
        """
    )

    # reviews table
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS reviews (
            id               SERIAL PRIMARY KEY,
            user_telegram_id TEXT,
            author_name      TEXT NOT NULL,
            rating           INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            service_name     TEXT,
            text             TEXT NOT NULL,
            photo_url        TEXT,
            extra_photos     TEXT,
            is_approved      INTEGER DEFAULT 0,
            created_at       TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS'))
        )
        """
    )

    # Indexes
    op.execute("CREATE INDEX IF NOT EXISTS idx_bookings_date     ON bookings (booking_date)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_bookings_user     ON bookings (user_telegram_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_bookings_reminder ON bookings (reminder_sent, status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_reviews_approved  ON reviews  (is_approved, created_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS reviews")
    op.execute("DROP TABLE IF EXISTS bookings")
    op.execute("DROP TABLE IF EXISTS users")
