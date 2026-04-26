import os
import json
import redis
import threading
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from .model_engine import generate_city_offer

load_dotenv()

app = FastAPI(title="City Wallet — LLM Service")

r = redis.Redis(
    host=os.environ.get("REDIS_HOST", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6379)),
    decode_responses=True,
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    user_context: dict   # weather, activity, location
    merchant_data: dict  # name, category, traffic_level


class StatusUpdate(BaseModel):
    status: str          # accepted | declined | expired
    user_id: str
    merchant_id: str


# ---------------------------------------------------------------------------
# Redis pub/sub listener — runs in background thread
# subscribes to "context:enriched" published by contextEnrichment
# ---------------------------------------------------------------------------

def redis_listener():
    pubsub = r.pubsub()
    pubsub.subscribe("context:enriched")
    for message in pubsub.listen():
        if message["type"] != "message":
            continue
        try:
            payload = json.loads(message["data"])
            user_context = payload.get("user_context", {})
            merchant_data = payload.get("merchant_data", {})
            user_id = payload.get("user_id", "unknown")

            offer = generate_city_offer(user_context, merchant_data)
            if offer is None:
                continue

            offer["user_id"] = user_id
            offer["merchant_id"] = merchant_data.get("merchant_id", "unknown")

            ttl = 900  # 15 minutes default
            r.setex(f"offer:{user_id}", ttl, json.dumps(offer))
            r.publish("offer:generated", json.dumps(offer))

        except Exception as e:
            print(f"[redis_listener] Error: {e}")


@app.on_event("startup")
def startup():
    t = threading.Thread(target=redis_listener, daemon=True)
    t.start()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate(req: GenerateRequest):
    offer = generate_city_offer(req.user_context, req.merchant_data)
    if offer is None:
        raise HTTPException(status_code=500, detail="Offer generation failed")

    user_id = req.user_context.get("user_id", "anonymous")
    offer["user_id"] = user_id
    r.setex(f"offer:{user_id}", 900, json.dumps(offer))
    r.publish("offer:generated", json.dumps(offer))
    return offer


@app.get("/offer/{user_id}")
def get_offer(user_id: str):
    raw = r.get(f"offer:{user_id}")
    if not raw:
        raise HTTPException(status_code=404, detail="No active offer")
    return json.loads(raw)


@app.post("/offer/{offer_id}/status")
def update_status(offer_id: str, body: StatusUpdate):
    if body.status not in ("accepted", "declined", "expired"):
        raise HTTPException(status_code=400, detail="Invalid status")
    r.publish("offer:status", json.dumps({
        "offer_id": offer_id,
        "status": body.status,
        "user_id": body.user_id,
        "merchant_id": body.merchant_id,
    }))
    return {"ok": True}
