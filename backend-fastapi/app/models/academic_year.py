from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.semester import Semester
    from app.models.user import User


class AcademicYear(Base, TimestampMixin):
    __tablename__ = "academic_years"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(225))

    user: Mapped["User"] = relationship(back_populates="academic_years")
    semesters: Mapped[list["Semester"]] = relationship(
        back_populates="academic_year",
        cascade="all, delete-orphan",
        order_by="Semester.order_number",
        lazy="selectin",
    )
