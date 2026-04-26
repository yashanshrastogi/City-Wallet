from fastapi import FastAPI, Request
import os, json, base64
from dotenv import load_dotenv
load_dotenv()
from utils.get_imp import get_con
import requests
from google_cloud import pubsub_v1
cred=os.getenv("cred")
os.environ["GOOGLE_CREDENTIALS_PATH"]=cred
publisher=pubsub_v1.PublisherClient()
CONTENT_TOPIC=os.getenv("CONTENT_TOPIC")

app=FastAPI()
@app.get("/health")
def chek():
    return {"status": "OK"}

@app.post("/enrich")
async def enr(request: Request):
    try:
        body = await request.json()
        message= body.get("message", {})
        data=message.get("data")
        if not data:
            return {"status": "no data"}
        dcd=base64.b64decode(data).decode("utf-8")
        payload=json.loads(dcd)
        task_id, intent_token=payload.get("task_id"), payload.get("intent_token")
        geo_zone=payload.get("geo_zone")
        timestamp=payload.get("timestamp") if payload.get("timestamp") else None
        res=requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={geo_zone}")
        lat, lon= res[0].get("latitude"), res[0].get("longitude")
        wea=requests.get(f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true")
        temp= wea.get("temperature")
        con=get_con(timestamp)
        dt= {"task_id": task_id, "intent_token": intent_token, "temperature": tmp, "day": con.get("day"), "is_holiday": con.get("is_holiday"), "holiday_name": con.get("holiday_name")}
        data=json.dumps(dt).encode("utf-8")
        pu=publisher.publish(CONTENT_TOPIC, data)
        return {"status": f"published: {pu.result()}"}
    except Exception as e:
        print(f"error: {str(e)}")
        return {"status": "failed"}




