from ninja import Schema
from typing import Optional
class InputSchema(Schema):
    intent_token:str
    geo_zone:str
    timestamp: Optional[str]=None

class mercSchema(Schema):
    max_offer:int
    traffic:float
    target_item:Optional[str]=None
