"""SQLAlchemy ORM models for City Wallet."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


# ── Merchants ─────────────────────────────────────────────
class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    external_id: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # relationships
    offers: Mapped[list["Offer"]] = relationship(
        back_populates="merchant",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Merchant {self.external_id!r}>"


# ── Offers ────────────────────────────────────────────────
class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("merchants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_profile: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )
    headline: Mapped[str] = mapped_column(String(256), nullable=False)
    body_copy: Mapped[str] = mapped_column(Text, nullable=False)
    discount_pct: Mapped[int] = mapped_column(Integer, nullable=False)
    visual_tone: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        comment="warm_cozy | refreshing | energetic | calm",
    )
    context_snapshot: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        comment="weather, temp, time_slot, demand_level, trigger_score",
    )
    status: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        default="pending",
        index=True,
        comment="pending | accepted | declined | expired",
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # relationships
    merchant: Mapped["Merchant"] = relationship(back_populates="offers")
    redemptions: Mapped[list["Redemption"]] = relationship(
        back_populates="offer",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Offer {self.headline!r} [{self.status}]>"


# ── Redemptions ───────────────────────────────────────────
class Redemption(Base):
    __tablename__ = "redemptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    offer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("offers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )
    cashback_eur: Mapped[float] = mapped_column(Float, nullable=False)
    redeemed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # relationships
    offer: Mapped["Offer"] = relationship(back_populates="redemptions")

    def __repr__(self) -> str:
        return f"<Redemption {self.token!r} €{self.cashback_eur}>"
