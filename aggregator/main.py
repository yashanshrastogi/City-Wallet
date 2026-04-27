from fastapi import FastAPI, Request
from google.cloud import pubsub_v1
import os
import json
import base64
from dotenv import load_dotenv
import redis as redis_lib

load_dotenv()

cred = os.getenv("cred")
if cred:
    # FIX: was GOOGLE_CREDENTIALS_PATH (wrong var name, GCP ignores it)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred

publisher = pubsub_v1.PublisherClient()
AGGREGATOR_TOPIC = os.getenv("AGGREGATOR_TOPIC")

# FIX: password= should be a string, not int()-cast; added port=; guard for missing password
redis_password = os.getenv("REDIS_PASSWORD") or None
redis_client = redis_lib.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=redis_password,  # FIX: was int(os.getenv("REDIS_PASSWORD")) — crashes on None + wrong type
    decode_responses=True,
)

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "OK"}


@app.post("/context")
async def context(request: Request):
    try:
        body = await request.json()
        message = body.get("message", {})
        data = message.get("data")
        if not data:
            return {"status": "no data"}

        dcd = base64.b64decode(data).decode("utf-8")
        payload = json.loads(dcd)

        # Cache enriched context in Redis (TTL: 5 minutes)
        redis_client.setex("context-data", 300, json.dumps(payload))
        return {"status": "processed"}

    except Exception as e:
        print(f"aggregator /context error: {str(e)}")
        return {"status": "failed", "detail": str(e)}


@app.post("/merchant")
async def merchant(request: Request):
    try:
        body = await request.json()
        message = body.get("message", {})
        data = message.get("data")
        if not data:
            return {"status": "no data"}

        dcd = base64.b64decode(data).decode("utf-8")
        payload = json.loads(dcd)

        merchant_email = payload.get("merchant")
        max_offer = payload.get("max_offer")
        traffic = payload.get("traffic")
        target_item = payload.get("target_item")

        # Fetch cached context
        raw_context = redis_client.get("context-data")
        if not raw_context:
            return {"status": "context not found — user must trigger first"}

        contex = json.loads(raw_context)

        dt = {
            "merchant": merchant_email,
            "max_offer": max_offer,
            "traffic": traffic,
            "target_item": target_item,
            "contex": contex,
            "task_id": contex.get("task_id"),
            "intent_token": contex.get("intent_token"),
            "temperature": contex.get("temperature"),
            "day": contex.get("day"),
            "is_holiday": contex.get("is_holiday"),
            "holiday_name": contex.get("holiday_name"),
            "geo_zone": contex.get("geo_zone"),
        }
        encoded = json.dumps(dt).encode("utf-8")
        pu = publisher.publish(AGGREGATOR_TOPIC, encoded)
        return {"status": f"published: {pu.result()}"}

    except Exception as e:
        print(f"aggregator /merchant error: {str(e)}")
        return {"status": "failed", "detail": str(e)}
