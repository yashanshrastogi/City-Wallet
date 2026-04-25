from ninja import Schema
from typing import Optional
class InputSchema(Schema):
    intent_token:str
    geo_zone:str
    timestamp: Optional[str]=None


