from pydantic import BaseModel

from app.schemas.common import Name, ORMModel
from app.schemas.grade import GradeOut


class SubjectAddIn(BaseModel):
    module_id: int
    name: Name


class SubjectModIn(BaseModel):
    id: int
    name: Name


class SubjectOut(ORMModel):
    id: int
    module_id: int
    name: str
    order_number: int


class SubjectFull(SubjectOut):
    grades: list[GradeOut] = []
