from datetime import datetime
from typing import Annotated

from sqlalchemy import Integer, ForeignKey, TIMESTAMP, func, BigInteger
from sqlalchemy.orm import mapped_column, Mapped

int_pk = Annotated[int, mapped_column(Integer, primary_key=True, index=True)]


class CreatedAtUpdatedAtMixin:
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.now, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class SoftDeleteMixin:
    deleted_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=None, nullable=True)