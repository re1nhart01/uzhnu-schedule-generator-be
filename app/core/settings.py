from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database settings
    alembic_database_url: str = Field(alias='ALEMBIC_DATABASE_URL')
    db_host: str = Field(alias='DB_HOST')
    db_port: int = Field(alias='DB_PORT')
    db_user: str = Field(alias='DB_USER')
    db_password: str = Field(alias='DB_PASSWORD')
    db_name: str = Field(alias='DB_NAME')
    db_cloud_sql_connection_name: str = Field(alias='DB_CLOUD_SQL_CONNECTION_NAME')
    echo: bool = False

    model_config = SettingsConfigDict(env_file='./app/.env',
                                      extra='ignore',
                                      env_ignore_empty=True)