import enum
from app.common.model_mixins import CreatedAtUpdatedAtMixin, SoftDeleteMixin, int_pk

from sqlalchemy import Text, JSON, Date, Boolean, String, TIMESTAMP, func, Integer, ForeignKey, TextClause, \
    CheckConstraint, Column, UniqueConstraint, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.adapters.postgres.adapter import Base

class InstitutionModel(Base, CreatedAtUpdatedAtMixin, SoftDeleteMixin):
    __tablename__ = 'institution'

    id: Mapped[int_pk]
    name: Mapped[str]
    alias: Mapped[str]
