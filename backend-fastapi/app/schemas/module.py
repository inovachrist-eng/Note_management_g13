from typing import Annotated

from pydantic import BaseModel, Field

from app.schemas.common import Name, ORMModel
from app.schemas.subject import SubjectFull


class ModuleAddIn(BaseModel):
    semester_id: int
    name: Name
    credits: int = Field(ge=1)


class ModuleModIn(BaseModel):
    id: int
    name: Name | None = None
    credits: Annotated[int, Field(ge=1)] | None = None


class ModuleOut(ORMModel):
    id: int
    semester_id: int
    name: str
    credits: int
    order_number: int


class ModuleFull(ModuleOut):
    subjects: list[SubjectFull] = []
