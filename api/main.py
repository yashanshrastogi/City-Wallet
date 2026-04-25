"""City Wallet – FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings

app = FastAPI(
    title="City Wallet API",
    version="0.1.0",
    debug=settings.debug,
)

# ── CORS – wide open for hackathon mode ───────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "city-wallet-api", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
