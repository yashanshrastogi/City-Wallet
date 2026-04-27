import os
import json
import base64  # FIX: was missing — used in /final endpoint (ImportError at runtime)
import redis
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from .model_engine import generate_city_offer

load_dotenv()

cred = os.getenv("cred")
if cred:
    # FIX: guard for None — was crashing at startup when env var absent
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred

app = FastAPI()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True,
)


class GenerateRequest(BaseModel):
    user_context: dict   # weather, activity, location
    merchant_data: dict  # name, category, traffic_level


class StatusUpdate(BaseModel):
    status: str          # accepted | declined | expired
    user_id: str
    merchant_id: str


def push_to_redis(task_id: str, data: dict):
    """Publish final offer to Redis for frontend polling and pub/sub delivery."""
    redis_client.publish("finalOutput", json.dumps(data))
    # Store with task_id key so frontend can poll
    redis_client.set(f"offer:{task_id}", json.dumps(data), ex=300)
    # Also store generic key for backwards compatibility
    redis_client.set("finalOutput", json.dumps(data), ex=300)


@app.get("/health")
def health():
    return {"status": "OK"}


@app.post("/final")
async def fin(request: Request):
    try:
        body = await request.json()
        message = body.get("message", {})
        data = message.get("data")
        if not data:
            raise HTTPException(status_code=400, detail="data not found")

        dcd = base64.b64decode(data).decode("utf-8")
        payload = json.loads(dcd)

        merchant = payload.get("merchant")
        max_offer = payload.get("max_offer")
        traffic = payload.get("traffic")
        contex = payload.get("contex", {})
        task_id = payload.get("task_id", "unknown")

        user_context = contex
        merchant_data = {
            "merchant": merchant,
            "max_offer": max_offer,
            "traffic": traffic,
            "target_item": payload.get("target_item"),
        }

        ans = generate_city_offer(user_context, merchant_data)
        if ans:
            ans["task_id"] = task_id
            ans["merchant"] = merchant
            push_to_redis(task_id, ans)

        return {"status": "completed", "task_id": task_id}

    except HTTPException:
        raise
    except Exception as e:
        # FIX: was `HttpExcpetion` (NameError — typo in original)
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
