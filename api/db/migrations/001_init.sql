-- City Wallet – initial schema
-- Requires: PostgreSQL 13+ (for gen_random_uuid())

BEGIN;

-- ── Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Merchants ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     VARCHAR(128) NOT NULL UNIQUE,
    name            VARCHAR(256) NOT NULL,
    rules           JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_merchants_external_id ON merchants (external_id);

-- ── Offers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id       UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    user_profile      VARCHAR(64) NOT NULL,
    headline          VARCHAR(256) NOT NULL,
    body_copy         TEXT        NOT NULL,
    discount_pct      INTEGER     NOT NULL,
    visual_tone       VARCHAR(32) NOT NULL,    -- warm_cozy | refreshing | energetic | calm
    context_snapshot  JSONB       NOT NULL DEFAULT '{}',
    status            VARCHAR(16) NOT NULL DEFAULT 'pending',  -- pending | accepted | declined | expired
    expires_at        TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_merchant_id   ON offers (merchant_id);
CREATE INDEX IF NOT EXISTS idx_offers_user_profile  ON offers (user_profile);
CREATE INDEX IF NOT EXISTS idx_offers_status        ON offers (status);

-- ── Redemptions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redemptions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id        UUID          NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    token           VARCHAR(128)  NOT NULL UNIQUE,
    cashback_eur    DOUBLE PRECISION NOT NULL,
    redeemed_at     TIMESTAMPTZ,             -- NULL until scanned
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_offer_id ON redemptions (offer_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_token    ON redemptions (token);

COMMIT;
