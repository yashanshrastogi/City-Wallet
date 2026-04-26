import os
import json
import redis
import threading
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from .model_engine import generate_city_offer
from google.cloud import pubsub_v1
load_dotenv()
cred=os.getenv("cred")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]= cred
app =FastAPI()
redis_client=redis.Redis(host=os.getenv("REDIS_HOST"), port=int(os.getenv("REDIS_PORT")), decode_responses=True)
class GenerateRequest(BaseModel):
    user_context: dict   # weather, activity, location
    merchant_data: dict  # name, category, traffic_level
class StatusUpdate(BaseModel):
    status: str          # accepted | declined | expired
    user_id: str
    merchant_id: str
def push_pubsub(data):
    redis_client.publish("finalOutput", json.dumps(data))
    redis_client.set("finalOutput", json.dumps(data), ex=300)
@app.post("/final")
async def fin(request: Request):
    try:
        body = await request.json()
        message= body.get("message", {})
        data= message.get("data")
        if not data:
            raise HTTPException(status_code=404, detail="data not found")
        dcd=base64.b64decode(data).decode("utf-8")
        payload=json.loads(dcd)
        merchant,max_offer=payload.get("merchant"), payload.get("max_offer")
        traffic, contex=payload.get("traffic"), payload.get("contex")
        user_context=contex
        merchant_data={"merchant": merchant, "max_offer": max_offer, "traffic": traffic}
        ans=generate_city_offer(user_context, merchant_data)
        push_pubsub(ans)
        return {"status": "completed"}
    except Exception as e:
        raise HTTPExcpetion(status_code=500, detail=f"error: {str(e)}")







