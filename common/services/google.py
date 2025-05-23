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
            auth_redirect_uri=os.getenv("AUTH_REDIRECT_URI"),
            register_redirect_uri=os.getenv("REGISTER_REDIRECT_URI"),
            auth_url=os.getenv("AUTH_URI"),
            user_info_url=os.getenv("USER_INFO_URI"),
            token_url=os.getenv("TOKEN_URI"),
            scopes=SCOPES
        )

    def retrieve_user_info(self, code: str) -> dict:
        user_info = super().retrieve_user_info(code)
        return user_info
