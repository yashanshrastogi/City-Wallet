from ninja import NinjaAPI
from google.cloud import pubsub_v1
import os,json
from dotenv import load_dotenv
load_dotenv()
cred=os.getenv("cred")
os.environ["GOOGLE_CREDENTIALS_PATH"]=cred
publisher=pubsub_v1.PublisherClient()
INPUT_TOPIC=os.getenv("INPUT_TOPIC")
import uuid
from .auth import CustomAuth

api=NinjaAPI()

@api.get("/health")
def chek(request):
    return {"status": "OK"}

@api.post("/trigger", auth=CustomAuth())
def trig(request, payload: InputSchema):
    task_id=str(uuid.uuid4())
    intent_token=payload.intent_token
    geo_zone=payload.geo_zone
    timestamp=payload.timestamp
    dt= {"task_id": task_id, "intent_token": intent_token, "geo_zone": geo_zone, "timestamp": timestamp}
    data=json.dumps(dt).encode("utf-8")
    pu=publisher.publish(INPUT_TOPIC, data)
    return {"status": f"published with id:{pu.result()}"}

