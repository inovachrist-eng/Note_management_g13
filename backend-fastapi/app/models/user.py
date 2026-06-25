from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.academic_year import AcademicYear


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(225))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # 1 utilisateur → N années (triées par id, comme userFull en Laravel)
    academic_years: Mapped[list["AcademicYear"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="AcademicYear.id",
        lazy="selectin",
    )
