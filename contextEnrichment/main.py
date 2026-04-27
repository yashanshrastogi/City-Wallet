from fastapi import FastAPI, Request
import os
import json
import base64
from dotenv import load_dotenv

load_dotenv()

cred = os.getenv("cred")
if cred:
    # FIX: was GOOGLE_CREDENTIALS_PATH (wrong var name — GCP ignores it)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred

from utils.get_imp import get_con
import requests
from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient()
CONTENT_TOPIC = os.getenv("CONTENT_TOPIC")

app = FastAPI()


@app.get("/health")
def check():
    return {"status": "OK"}


@app.post("/enrich")
async def enrich(request: Request):
    try:
        body = await request.json()
        message = body.get("message", {})
        data = message.get("data")
        if not data:
            return {"status": "no data"}

        dcd = base64.b64decode(data).decode("utf-8")
        payload = json.loads(dcd)

        task_id = payload.get("task_id")
        intent_token = payload.get("intent_token")
        geo_zone = payload.get("geo_zone")
        timestamp = payload.get("timestamp") or None

        # FIX: was res[0].get(...) directly on requests.Response (AttributeError)
        geo_res = requests.get(
            f"https://geocoding-api.open-meteo.com/v1/search?name={geo_zone}&count=1"
        )
        geo_data = geo_res.json()
        results = geo_data.get("results")
        if not results:
            return {"status": f"no geocoding results for: {geo_zone}"}

        lat = results[0].get("latitude")
        lon = results[0].get("longitude")

        # FIX: was wea.get("temperature") directly on requests.Response (AttributeError)
        wea_res = requests.get(
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}&current_weather=true"
        )
        wea_data = wea_res.json()
        # FIX: was `tmp` (NameError — undefined variable) instead of `temp`
        temp = wea_data.get("current_weather", {}).get("temperature")

        con = get_con(timestamp)

        dt = {
            "task_id": task_id,
            "intent_token": intent_token,
            "temperature": temp,
            "day": con.get("day"),
            "is_holiday": con.get("is_holiday"),
            "holiday_name": con.get("holiday_name"),
            "geo_zone": geo_zone,
        }
        encoded = json.dumps(dt).encode("utf-8")
        pu = publisher.publish(CONTENT_TOPIC, encoded)
        return {"status": f"published: {pu.result()}"}

    except Exception as e:
        print(f"contextEnrichment error: {str(e)}")
        return {"status": "failed", "detail": str(e)}
