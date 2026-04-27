from .models import ArtemisUser, ArtemisMerchant
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
import uuid
import json
from google.cloud import pubsub_v1
import os

from .schema import InputSchema, mercSchema, RoleSchema
from .auth import CustomAuth

cred=os.getenv("cred")
if cred:
    os.environ["GOOGLE_CREDENTIALS_PATH"]=cred

publisher=pubsub_v1.PublisherClient()
INPUT_TOPIC=os.getenv("INPUT_TOPIC")
MERCHANT_TOPIC=os.getenv("MERCHANT_TOPIC")

api=NinjaAPI()

@api.get("/me", auth=CustomAuth())
def get_me(request):
    user = request.auth
    return {
        "email": user.email,
        "role": user.role,
        "google_id": user.google_id
    }

@api.get("/health")
def health_check(request):
    return {"status": "OK"}

@api.post("/role-decider", auth=CustomAuth())
def role_choose(request, payload: RoleSchema):
    user = request.auth
    role = payload.role
    if role not in ["user", "merchant"]:
        raise HttpError(400, "Invalid role")
    art = get_object_or_404(ArtemisUser, email=user.email)
    if art.role:
        raise HttpError(400, "Role already assigned")
    art.role = role
    art.save()
    return {"message": "role assigned successfully", "role": role}


@api.post("/trigger", auth=CustomAuth())
def trig(request, payload: InputSchema):
    user = request.auth
    if user.role != "user":
        raise HttpError(403, "Only users can trigger offers")
    task_id=str(uuid.uuid4())
    intent_token=payload.intent_token
    geo_zone=payload.geo_zone
    timestamp=payload.timestamp
    dt= {"task_id": task_id, "intent_token": intent_token, "geo_zone": geo_zone, "timestamp": timestamp}
    data=json.dumps(dt).encode("utf-8")
    pu=publisher.publish(INPUT_TOPIC, data)
    return {"status": f"published with id:{pu.result()}"}

@api.post("/merchant", auth=CustomAuth())
def merchant_config(request, payload: mercSchema):
    user = request.auth
    if user.role != "merchant":
        raise HttpError(403, "You are not allowed to perform this action")
    ArtemisMerchant.objects.create(user=user, max_offer=payload.max_offer, traffic=payload.traffic, target_item=payload.target_item)
    dt= {"merchant": user.email, "max_offer": payload.max_offer, "traffic": payload.traffic, "target_item": payload.target_item}
    data=json.dumps(dt).encode("utf-8")
    pu=publisher.publish(MERCHANT_TOPIC, data)
    return {"status": f"published: {pu.result()}"}




