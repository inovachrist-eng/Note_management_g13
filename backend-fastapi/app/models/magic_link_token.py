from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.base import TimestampMixin, utcnow


class MagicLinkToken(Base, TimestampMixin):
    """Token de connexion sans mot de passe (lien magique)."""

    __tablename__ = "magic_link_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)

    def is_expired(self) -> bool:
        expires = self.expires_at
        if expires.tzinfo is None:  # valeurs stockées en UTC naïf (SQLite)
            expires = expires.replace(tzinfo=timezone.utc)
        return expires < utcnow()
