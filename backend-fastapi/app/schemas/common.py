"""Types et schémas partagés."""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

# Contraintes réutilisables
Name = Annotated[str, Field(min_length=1, max_length=225)]
OrderNumber = Annotated[int, Field(ge=1)]
Score = Annotated[float, Field(ge=0, le=20)]


class ORMModel(BaseModel):
    """Base des schémas de sortie : construits depuis un objet SQLAlchemy."""

    model_config = ConfigDict(from_attributes=True)


class IdIn(BaseModel):
    id: int


class ChangeOrderIn(BaseModel):
    id: int
    order_number: OrderNumber
