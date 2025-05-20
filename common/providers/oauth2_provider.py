from typing import Literal
from urllib.parse import urlencode, urljoin

from httpx import Client


class Oauth2Provider:
    def __init__(
            self,
            client_secret: str,
            client_id: str,
            auth_redirect_uri: str,
            register_redirect_uri: str,
            auth_url: str,
            user_info_url: str,
            token_url: str,
            scopes: str,
    ):
        self.client_secret = client_secret
        self.client_id = client_id
        self.auth_redirect_uri = auth_redirect_uri
        self.register_redirect_uri = register_redirect_uri
        self.auth_url = auth_url
        self.user_info_url = user_info_url
        self.token_url = token_url
        self.scopes = scopes

    def retrieve_auth_uri(self, auth_type: Literal['sign-in', 'sign-up']):
        base_url = self.auth_url

        query_params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.auth_redirect_uri,
            "scope": self.scopes,
            "access_type": "offline",
            'state': auth_type
        }

        return {'url':self._prepare_uri(base_url, query_params)}

    def retrieve_user_info(self, code: str) -> dict:
        token_data = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.auth_redirect_uri,
            "grant_type": "authorization_code",
        }

        with Client() as client:
            tokens: dict = self._retrieve_user_tokens(client, token_data)
            user_info_response = client.get(
                self.user_info_url,
                headers={"Authorization": f"Bearer {tokens.get('access_token')}"},
            )
            user_info_response.raise_for_status()

        return user_info_response.json()

    def _retrieve_user_tokens(self, client: Client, token_data) -> dict:
        token_response = client.post("https://oauth2.googleapis.com/token", data=token_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token_response.raise_for_status()
        return token_response.json()

    def _prepare_uri(self, base_url: str, query_params: dict) -> str:
        encoded_params = urlencode(query_params)
        return urljoin(base_url, f"?{encoded_params}")