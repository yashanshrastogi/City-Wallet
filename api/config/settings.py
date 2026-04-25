"""Application settings via pydantic-settings, reading from .env."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────
    postgres_user: str = "citywallet"
    postgres_password: str = "citywallet"
    postgres_db: str = "citywallet"
    database_url: str = (
        "postgresql+asyncpg://citywallet:citywallet@localhost:5432/citywallet"
    )

    # ── API ───────────────────────────────────────────────
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True

    # ── Anthropic ─────────────────────────────────────────
    anthropic_api_key: str = ""


settings = Settings()
