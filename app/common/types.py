import enum
from typing import TypeVar, Annotated

from pydantic import BaseModel, BeforeValidator, TypeAdapter, AnyUrl
from sqlalchemy.orm import DeclarativeBase

""" A parent type for any SQLAlchemy model. Is used in base repository as an abstract property.
It is used in base repository to type methods arguments.
It is required to be redefined in every particular repository with it`s own model, e.g. UserModel """
MODEL = TypeVar('MODEL', bound=DeclarativeBase)

""" A parent type for any Pydentic schema. It is used in base repository to type methods arguments. """
SCHEMA = TypeVar('SCHEMA', bound=BaseModel)

""" A special type, created to validate a string to be a URL, but avoid Pydentic auto converting into a URL object. """
UrlStr = Annotated[str, BeforeValidator(lambda value: str(TypeAdapter(AnyUrl).validate_python(value)))]

""" A parent type for any SQLAlchemy repository. It is used in base repository to type methods arguments. """
REPO = TypeVar('REPO', bound='BaseRepository')


class ApiTags(enum.Enum):
    pass
    