from typing import Generic

from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from google.cloud.sql.connector import create_async_connector
from sqlalchemy.orm import DeclarativeBase

from app.common.types import SCHEMA
from app.dependencies import get_settings

settings = get_settings()

class Base(DeclarativeBase, Generic[SCHEMA]):
    pass

async def get_async_engine() -> AsyncEngine:
    connector = await create_async_connector()

    pool = create_async_engine(
        "postgresql+asyncpg://",
        async_creator=lambda: connector.connect_async(
            settings.db_cloud_sql_connection_name,
            "asyncpg",
            user=settings.db_user,
            password=settings.db_password,
            db=settings.db_name,
        ),
    )

    return pool

async def get_session():
    engine = await get_async_engine()
    async with engine.begin() as conn:
        yield conn