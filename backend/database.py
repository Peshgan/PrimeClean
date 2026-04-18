from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

import config

# Railway internal URLs use plain TCP — disable SSL for those.
_raw_url = config.DATABASE_URL
if ".railway.internal" in _raw_url:
    # Strip any existing sslmode param and force disable
    import re
    _raw_url = re.sub(r"[?&]sslmode=[^&]*", "", _raw_url)
    sep = "&" if "?" in _raw_url else "?"
    _raw_url = f"{_raw_url}{sep}sslmode=disable"
    _connect_args: dict = {}
else:
    _connect_args = {"sslmode": "require"}

engine = create_engine(
    _raw_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_connection() -> None:
    """Smoke-test the database connection at startup."""
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
