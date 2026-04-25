"""Seed script – populates the database with Café Mitte + sample offers.

Usage:
    cd api
    python -m db.seed
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from db.database import AsyncSessionLocal, engine, Base
from db.models import Merchant, Offer, Redemption


# ── Helpers ───────────────────────────────────────────────
CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "merchant_config.json"

NOW = datetime.now(timezone.utc)


def _load_merchant_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


# ── Seed data ─────────────────────────────────────────────
SAMPLE_OFFERS = [
    {
        "user_profile": "mia",
        "headline": "Warm up your afternoon, Mia ☕",
        "body_copy": (
            "It's drizzly and 11°C outside — the perfect excuse for a "
            "cozy latte. Show this offer for 15% off any hot drink today "
            "between 14:00 and 16:00."
        ),
        "discount_pct": 15,
        "visual_tone": "warm_cozy",
        "context_snapshot": {
            "weather": "drizzle",
            "temp": 11,
            "time_slot": "14:00-16:00",
            "demand_level": "low",
            "trigger_score": 0.82,
        },
        "status": "accepted",
        "expires_at": NOW + timedelta(hours=3),
    },
    {
        "user_profile": "thomas",
        "headline": "Beat the afternoon slump, Thomas 🍵",
        "body_copy": (
            "Cloudy skies and 13°C — a matcha latte is calling your name. "
            "Enjoy 10% off any specialty drink this afternoon."
        ),
        "discount_pct": 10,
        "visual_tone": "calm",
        "context_snapshot": {
            "weather": "cloudy",
            "temp": 13,
            "time_slot": "15:00-17:00",
            "demand_level": "low",
            "trigger_score": 0.68,
        },
        "status": "declined",
        "expires_at": NOW + timedelta(hours=2),
    },
    {
        "user_profile": "lena",
        "headline": "Sunny morning treat, Lena ☀️",
        "body_copy": (
            "Stuttgart is gorgeous at 18°C today! Grab an iced oat-milk "
            "latte and a pastry with 20% off before the lunch rush."
        ),
        "discount_pct": 20,
        "visual_tone": "refreshing",
        "context_snapshot": {
            "weather": "sunny",
            "temp": 18,
            "time_slot": "09:00-11:00",
            "demand_level": "low",
            "trigger_score": 0.91,
        },
        "status": "accepted",
        "expires_at": NOW - timedelta(hours=1),  # already expired in real time
    },
    {
        "user_profile": "mia",
        "headline": "Rainy-day comfort, Mia 🌧️",
        "body_copy": (
            "Heavy rain and 8°C — curl up with a chai latte and a "
            "slice of carrot cake. 15% off the combo until 18:00."
        ),
        "discount_pct": 15,
        "visual_tone": "warm_cozy",
        "context_snapshot": {
            "weather": "rain",
            "temp": 8,
            "time_slot": "14:00-18:00",
            "demand_level": "low",
            "trigger_score": 0.88,
        },
        "status": "expired",
        "expires_at": NOW - timedelta(days=1),
    },
    {
        "user_profile": "thomas",
        "headline": "Midweek energy boost, Thomas ⚡",
        "body_copy": (
            "Partly cloudy and a mild 15°C — perfect for a double "
            "espresso on the house patio. 12% off until 11:00."
        ),
        "discount_pct": 12,
        "visual_tone": "energetic",
        "context_snapshot": {
            "weather": "partly_cloudy",
            "temp": 15,
            "time_slot": "09:00-11:00",
            "demand_level": "normal",
            "trigger_score": 0.55,
        },
        "status": "accepted",
        "expires_at": NOW + timedelta(hours=5),
    },
]


# ── Main seed routine ────────────────────────────────────
async def seed() -> None:
    """Create tables and insert seed data."""
    # Ensure tables exist (dev convenience – production uses migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    config = _load_merchant_config()

    async with AsyncSessionLocal() as session:
        session: AsyncSession

        # ── Merchant ──────────────────────────────────────
        merchant = Merchant(
            external_id=config["merchant_id"],
            name=config["name"],
            rules=config,
        )
        session.add(merchant)
        await session.flush()  # populate merchant.id

        print(f"✓ Merchant created: {merchant.external_id} ({merchant.id})")

        # ── Offers ────────────────────────────────────────
        for i, offer_data in enumerate(SAMPLE_OFFERS, start=1):
            offer = Offer(
                merchant_id=merchant.id,
                **offer_data,
            )
            session.add(offer)
            await session.flush()

            # Create a redemption for every accepted offer
            if offer.status == "accepted":
                token = f"CW-{uuid.uuid4().hex[:12].upper()}"
                redemption = Redemption(
                    offer_id=offer.id,
                    token=token,
                    cashback_eur=round(offer.discount_pct * 0.15, 2),
                )
                session.add(redemption)
                print(f"  ✓ Offer #{i} ({offer.status}) + redemption {token}")
            else:
                print(f"  ✓ Offer #{i} ({offer.status})")

        await session.commit()

    print("\n🌱 Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
