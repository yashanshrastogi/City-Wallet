from ninja import NinjaAPI
from google.cloud import pubsub_v1
import os,json
from dotenv import load_dotenv
from .models import ArtemisUser, ArtemisMerchant
from django.shortcuts import get_object_or_404
load_dotenv()
from ninja.errors import HttpError
cred=os.getenv("cred")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=cred
publisher=pubsub_v1.PublisherClient()
INPUT_TOPIC=os.getenv("INPUT_TOPIC")
MERCHANT_TOPIC=os.getenv("MERCHANT_TOPIC")
import uuid
import redis
from .schema import InputSchema, mercSchema
from .auth import CustomAuth
from django.http import StreamingHttpResponse

redis_client=redis.Redis(host=os.getenv("REDIS_HOST"), port=os.getenv("REDIS_PORT"), decode_responses=True)
api=NinjaAPI()
@api.post("/role-decider", auth=CustomAuth())
def rolech(request, payload:RoleSchema):
    user=request.auth
    role=payload.role
    art=get_object_or_404(ArtemisUser, email=user.email)
    art.role=role
    art.save()
    return {"message": "role assigned successfully"}


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
    return {"status": f"published with id:{pu.result()}", "task_id": task_id}

@api.post("/merchant", auth=CustomAuth())
def merc(request, payload:mercSchema):
    user=request.auth
    if user.role != "merchant":
        raise HttpError(403, "You are not allowed to perform this action")
    ArtemisMerchant.objects.create(user=user, max_offer=payload.max_offer, traffic=payload.traffic, target_item=payload.target_item)
    dt= {"merchant": user.email, "max_offer": payload.max_offer, "traffic": payload.traffic, "target_item": payload.target_item}
    data=json.dumps(dt).encode("utf-8")
    pu=publisher.publish(MERCHANT_TOPIC, data)
    return {"status": f"published: {pu.result()}"}

@api.get("/response/{task_id}")
def resp(request, task_id:str):
    def event_stream():
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f"RESULT_{task_id}")
        for message in pubsub.listen():
            if message['type'] == 'message':
                yield f"data: {message['data'].decode('utf-8')}\n\n"
                break

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")



