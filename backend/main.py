"""PrimeClean FastAPI backend."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from database import verify_connection
from routers.bookings import router as bookings_router
from routers.telegram import router as telegram_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PrimeClean API",
    version="1.0.0",
    description="Backend API for PrimeClean cleaning service",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js frontend (and local dev) to call this API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(bookings_router)
app.include_router(telegram_router)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup() -> None:
    try:
        verify_connection()
        logger.info("Database connection verified ✓")
    except Exception as exc:
        logger.error("Database connection failed: %s", exc)
        raise


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "service": "primeclean-api"}
