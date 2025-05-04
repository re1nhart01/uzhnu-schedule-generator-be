from abc import ABC, abstractmethod
from datetime import datetime
from typing import Annotated, Sequence, Optional

from fastapi import Depends, HTTPException
from fastapi_pagination import LimitOffsetPage
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi_pagination.types import AsyncItemsTransformer
from sqlalchemy import select, insert, update, delete, Select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.types import MODEL, SCHEMA
from app.core.adapters.postgres.adapter import get_session


class BaseRepository(ABC):

    @property
    @abstractmethod
    def model(self):
        return MODEL

    def __init__(self, session: Annotated[AsyncSession, Depends(get_session)]):
        self.session = session

    async def get_by_id_selective(self, entity_id: int, filter: dict = {}) -> MODEL | None:
        stmt = self._get_default_stmt()
        stmt = stmt.filter_by(id=entity_id, **filter)
        entity = await self.session.scalar(stmt)
        return entity

    async def get_one_selective(self, filter: dict = {}) -> MODEL | None:
        stmt = self._get_default_stmt()
        stmt = stmt.filter_by(**filter)
        entity = await self.session.scalar(stmt)
        return entity

    async def get_multi_selective(
            self,
            offset: int = 0,
            limit: int | None = None,
            filter: dict = {}
    ) -> Sequence[MODEL]:
        stmt = (
            self._get_default_stmt()
            .filter_by(**filter)
            .offset(offset)
            .limit(limit)
        )

        entities = await self.session.scalars(stmt)

        return entities.unique().all()

    async def get_one(self, filters: dict) -> MODEL | None:
        return await self.session.scalar(select(self.model).filter_by(**filters))

    async def get_by_id(self, entity_id: int) -> MODEL | None:
        return await self.session.get(self.model, entity_id)

    async def get_multi(self, offset: int = 0, limit: int | None = None) -> Sequence[MODEL]:
        stmt = (
            select(self.model)
            .offset(offset)
            .limit(limit)
        )

        entities = await self.session.scalars(stmt)

        return entities.all()

    async def get_paginated(self,
                            filter: dict = {},
                            transformer: Optional[AsyncItemsTransformer] = None
                            ) -> LimitOffsetPage[SCHEMA]:
        stmt = (
            self._get_default_stmt()
            .filter_by(**filter)
        )

        return await paginate(self.session, stmt, transformer=transformer)

    async def create(self, entity: SCHEMA) -> MODEL:
        entity_model = self.model(**entity.model_dump())

        self.session.add(entity_model)
        await self.session.commit()
        await self.session.refresh(entity_model)

        return entity_model

    async def create_many(self, entities: list[SCHEMA]) -> Sequence[MODEL]:
        entities_db = await self.session.scalars(insert(self.model).returning(self.model), entities)
        await self.session.commit()

        return entities_db.all()

    async def update(self, entity_id: int, entity: SCHEMA | dict, exclude_unset: bool = True) -> SCHEMA:
        stmt = (
            update(self.model).
            where(self.model.id == entity_id)
        )
        stmt = stmt.values(**entity) if isinstance(entity, dict) else stmt.values(
            **entity.model_dump(exclude_unset=exclude_unset))
        result = await self.session.execute(stmt)
        if result is None:
            raise HTTPException(404, "Entity not found.")

        await self.session.commit()

        return entity

    async def update_many(self, entities: list[SCHEMA]) -> bool:
        "Creapy implementation, REFACTOR IT"
        for entity in entities:
            await self.update(entity.id, entity)

        return True

    async def soft_delete(self, entity_id: int) -> bool:
        stmt = update(self.model).where(self.model.id == entity_id).values({"deleted_at": datetime.now()})
        result = await self.session.execute(stmt)
        if result is None:
            raise HTTPException(404, "Entity not found.")
        await self.session.commit()

        return result == 1

    async def delete(self, entity_id: int) -> bool:
        stmt = delete(self.model).where(self.model.id == entity_id)
        await self.session.execute(stmt)
        await self.session.commit()

        return True

    async def delete_many(self, entity_ids: list[int]) -> bool:
        stmt = delete(self.model).where(self.model.id.in_(entity_ids))

        await self.session.execute(stmt)
        await self.session.commit()

        return True

    async def expire_session_for_entity(self, model: MODEL) -> None:
        return self.session.expire(model)

    async def expire_session_for_all(self) -> None:
        return self.session.expire_all()

    def _get_default_stmt(self) -> Select:
        """
        Get the default SQL statement.

        This method can be overridden in subclasses and allows to extend selective statements.

        Returns:
            Select: SQLA Select statement
        """
        return select(self.model)
