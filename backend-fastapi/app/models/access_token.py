from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AccessToken(Base, TimestampMixin):
    """Token d'accès API — équivalent de personal_access_tokens (Sanctum)."""

    __tablename__ = "access_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255), default="magic_link")
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    user: Mapped["User"] = relationship()
