from pydantic import BaseModel

from app.schemas.common import Name, ORMModel
from app.schemas.module import ModuleFull


class SemesterAddIn(BaseModel):
    name: Name
    academic_year_id: int


class SemesterModIn(BaseModel):
    id: int
    name: Name


class SemesterOut(ORMModel):
    id: int
    academic_year_id: int
    name: str
    order_number: int


class SemesterFull(SemesterOut):
    modules: list[ModuleFull] = []
