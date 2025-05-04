from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database settings
    database_url: str = Field(alias='DATABASE_URL')
    echo: bool = False

    model_config = SettingsConfigDict(env_file='./app/.env',
                                      extra='ignore',
                                      env_ignore_empty=True)