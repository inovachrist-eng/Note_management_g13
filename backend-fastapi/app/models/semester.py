from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.academic_year import AcademicYear
    from app.models.course_module import CourseModule


class Semester(Base, TimestampMixin):
    __tablename__ = "semesters"

    id: Mapped[int] = mapped_column(primary_key=True)
    academic_year_id: Mapped[int] = mapped_column(
        ForeignKey("academic_years.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(225))
    order_number: Mapped[int] = mapped_column(Integer, default=1)

    academic_year: Mapped["AcademicYear"] = relationship(back_populates="semesters")
    modules: Mapped[list["CourseModule"]] = relationship(
        back_populates="semester",
        cascade="all, delete-orphan",
        order_by="CourseModule.order_number",
        lazy="selectin",
    )
