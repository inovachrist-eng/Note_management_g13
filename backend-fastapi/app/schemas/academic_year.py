from pydantic import BaseModel

from app.schemas.common import Name, ORMModel
from app.schemas.semester import SemesterFull


class AcademicYearAddIn(BaseModel):
    name: Name


class AcademicYearModIn(BaseModel):
    id: int
    name: Name


class AcademicYearOut(ORMModel):
    id: int
    user_id: int
    name: str


class AcademicYearFull(AcademicYearOut):
    semesters: list[SemesterFull] = []
