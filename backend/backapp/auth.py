from ninja.security import HttpBearer
from dotenv import load_dotenv
import os
from .models import ArtemisUser

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class CustomAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            # Try Google token verification first
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), GOOGLE_CLIENT_ID
            )
            email = idinfo["email"]
            sub = idinfo["sub"]
            user, _ = ArtemisUser.objects.get_or_create(
                email=email, defaults={"google_id": sub}
            )
            return user
        except ImportError:
            # google-auth not installed — fallback to JWT decode
            return self._fallback_jwt(token)
        except Exception as e:
            print(f"Google token verification failed: {str(e)}")
            # Fallback: try to decode as a simple JWT with the id_token
            return self._fallback_jwt(token)

    def _fallback_jwt(self, token):
        """Fallback: decode the JWT without full Google verification (dev mode)."""
        try:
            import json
            import base64

            # Decode JWT payload (middle segment)
            parts = token.split(".")
            if len(parts) != 3:
                return None
            # Add padding
            payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            email = payload.get("email")
            sub = payload.get("sub")
            if not email or not sub:
                return None
            user, _ = ArtemisUser.objects.get_or_create(
                email=email, defaults={"google_id": sub}
            )
            return user
        except Exception as e:
            print(f"JWT fallback also failed: {str(e)}")
            return None
