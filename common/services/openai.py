from dataclasses import dataclass
from functools import cached_property
import os
import logging
from typing import TypeVar

from dotenv import load_dotenv
import openai
from openai import Client

SCHEMA = TypeVar("SCHEMA", bound="BaseModel")

logger = logging.getLogger(__name__)


load_dotenv()

@dataclass
class OpenAIService:
    """
    Service class for interacting with the OpenAI API using the OpenAI Python client.
    """

    openai.api_key = os.getenv("OPENAI_API_KEY")

    @cached_property
    def openai_client(self):
        return Client()

    def make_request_with_structured_result(
        self,
        prompt: str,
        response_model: SCHEMA,
        *,
        model=os.getenv("OPENAI_MODEL"),
        messages: list[dict[str, str]] = None,
    ) -> SCHEMA:
        """
        Makes a request to the OpenAI API with a structured result.

        Args:
            prompt (str): The prompt to send to the OpenAI API.
            response_model (SCHEMA): The pydantic model to validate the response against.
            model (str, optional): The OpenAI model to use. Defaults to settings.OPENAI_MODEL.
            messages (list[dict[str, str]], optional): A list of message dictionaries to send to the OpenAI API.
                Each dictionary should have 'role' and 'content' keys. Defaults to None.

        Returns:
            SCHEMA: The validated pydantic model if the request is successful.
            None: If an error occurs during the request.
        """
        try:
            completion = self.openai_client.beta.chat.completions.parse(
                model=model,
                messages=(
                    messages if messages else [{"role": "system", "content": prompt}]
                ),
                response_format=response_model,
            )
            return response_model.model_validate(completion.choices[0].message.parsed)
        except Exception as e:
            logger.error("Error making request with OpenAI: %s", str(e))
            return None