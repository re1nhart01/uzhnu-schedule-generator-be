import os
from common.providers import Oauth2Provider
from dotenv import load_dotenv

load_dotenv()

SCOPES = "openid profile email"

class GoogleService(Oauth2Provider):

    def __init__(self):
        super().__init__(
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            auth_redirect_uri="http://localhost:8000/api/auth/google/callback",
            register_redirect_uri="http://localhost:8000/api/auth/google/callback",
            auth_url="https://accounts.google.com/o/oauth2/auth",
            user_info_url="https://www.googleapis.com/oauth2/v1/userinfo",
            token_url="https://accounts.google.com/o/oauth2/token",
            scopes=SCOPES
        )

    def retrieve_user_info(self, code: str) -> dict:
        user_info = super().retrieve_user_info(code)
        return user_info
