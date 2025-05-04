from typing import Generic

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.common.types import SCHEMA
from app.dependencies import get_settings


class Base(DeclarativeBase, Generic[SCHEMA]):
    pass


engine = create_async_engine(get_settings().database_url,
                             echo=get_settings().echo)


async def get_session():
    session_maker = async_sessionmaker(bind=engine)
    async with session_maker() as session:
        yield session