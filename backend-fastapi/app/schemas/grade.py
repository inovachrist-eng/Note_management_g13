from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel, Score


class GradeAddIn(BaseModel):
    subject_id: int
    type: str | None = Field(default=None, max_length=50)
    session: Literal[1, 2]
    score: Score


class GradeModIn(BaseModel):
    id: int
    score: Score | None = None
    type: str | None = Field(default=None, max_length=50)
    session: Literal[1, 2] | None = None


class FreeGradesIn(BaseModel):
    subject_id: int
    grades: list[Score | None] | None = Field(default=None, max_length=10)


class GradeOut(ORMModel):
    id: int
    subject_id: int
    type: str
    session: int
    score: float
    order_number: int
