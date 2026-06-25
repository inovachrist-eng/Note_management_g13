from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.course_module import CourseModule
    from app.models.grade import Grade


class Subject(Base, TimestampMixin):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    module_id: Mapped[int] = mapped_column(
        ForeignKey("modules.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(225))
    order_number: Mapped[int] = mapped_column(Integer, default=1)

    module: Mapped["CourseModule"] = relationship(back_populates="subjects")
    grades: Mapped[list["Grade"]] = relationship(
        back_populates="subject",
        cascade="all, delete-orphan",
        order_by="Grade.order_number",
        lazy="selectin",
    )
