from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.semester import Semester
    from app.models.subject import Subject


class CourseModule(Base, TimestampMixin):
    """Module de cours — table "modules" (comme en Laravel)."""

    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(primary_key=True)
    semester_id: Mapped[int] = mapped_column(
        ForeignKey("semesters.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(225))
    credits: Mapped[int] = mapped_column(Integer)
    order_number: Mapped[int] = mapped_column(Integer, default=1)

    semester: Mapped["Semester"] = relationship(back_populates="modules")
    subjects: Mapped[list["Subject"]] = relationship(
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="Subject.order_number",
        lazy="selectin",
    )
