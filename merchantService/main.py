import os,json, base64
from dotenv import load_dotenv
load_dotenv()
from google.cloud import pubsub_v1
cred=os.getenv("cred")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=cred
MERCHANT_TOPIC=os.getenv("MERCHANT_TOPIC")
publisher=pubsub_v1.PublisherClient()
from fastapi import FastAPI, Request
app=FastAPI()

@app.get("/health")
def chek():
    return {"status": "OK"}

@app.post("/merchant")
async def merc(request: Request):
    try:
        body=await request.json()
        message=body.get("message", {})
        data=message.get("data")
        if not data:
            return {"status": "no data"}
        dcd=base64.b64decode(data).decode("utf-8")
        payload=json.loads(dcd)
        #Isme CRUD logic lagega
        

