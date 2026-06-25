from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.subject import Subject


class Grade(Base, TimestampMixin):
    __tablename__ = "grades"

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(50), default="devoir")
    session: Mapped[int] = mapped_column(Integer, default=1)
    score: Mapped[float] = mapped_column(Numeric(5, 2))
    order_number: Mapped[int] = mapped_column(Integer, default=1)

    subject: Mapped["Subject"] = relationship(back_populates="grades")
