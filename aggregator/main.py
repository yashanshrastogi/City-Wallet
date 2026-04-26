from fastapi import FastAPI, Request
from google.cloud import pubsub_v1
import os, json, base64
from dotenv import load_dotenv
import redis
load_dotenv()
cred=os.getenv("cred")
os.environ["GOOGLE_CREDENTIALS_PATH"]=cred
publisher=pubsub_v1.PublisherClient()
AGGREGATOR_TOPIC=os.getenv("AGGREGATOR_TOPIC")
redis_client=redis.Redis(host=os.getenv("REDIS_HOST"), password=int(os.getenv("REDIS_PASSWORD")), decode_responses=True)


app= FastAPI()

@app.post("/context")
async def conte(request: Request):
    try:
        body = await request.json()
        message=body.get("message", {})
        data=message.get("data")
        if not data:
            return {"status": "no data"}
        dcd=base64.b64decode(data).decode("utf-8")
        payload=json.loads(dcd)
        task_id, intent_token = payload.get("task_id"), payload.get("intent_token")
        temperature, day=payload.get("temperature"), payload.get("day")
        is_holiday, holiday_name=payload.get("is_holiday"), payload.get("holiday_name")
        redis_client.setex("context-data", 300, json.dumps(payload))
        return {"status": "processed"}
    except Exception as e:
        print(f"{str(e)}")
        return {"status": "failed"}

@app.post("/merchant")
async def merc(request: Request):
    try:
        body= await request.json()
        message=body.get("message", {})
        data=message.get("data")
        if not data:
            return {"status": "no idea"}
        dcd=base64.b64decode(data).decode("utf-8")
        payload=json.loads(dcd)
        merchant, max_offer=payload.get("merchant"), payload.get("max_offer")
        traffic, target_item=payload.get("traffic"), payload.get("target_item")
        contex=json.loads(redis_client.get("context-data"))
        task_id, intent_token=contex["task_id"], contex["intent_token"]
        temperature, day=contex["temperature"], contex["day"]
        is_holiday, holiday_name=contex["is_holiday"], contex["holiday_name"]
        dt= {"merchant": merchant, "max_offer": max_offer, "traffic": traffic, "contex": contex, "task_id": task_id, "intent_token": intent_token, "temperature": temperature, "day": day, "is_holiday": is_holiday, "holiday_name": holiday_name}
        data=json.dumps(dt).encode("utf-8")
        pu=publisher.publish(AGGREGATOR_TOPIC, data)
        return {"status": f"published: {pu.result()}"}
    except Exception as e:
        print(f"error: {str(e)}")
        return {"status": "failed"}
        


        


