"""Dépendances FastAPI réutilisables.

`get_current_user` est l'équivalent du middleware `auth:sanctum` de Laravel :
il lit l'en-tête `Authorization: Bearer <token>`, retrouve l'utilisateur via le hash
du token, ou renvoie 401 {"message": "Unauthenticated."} si le token est absent/invalide.
"""

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.core.security import hash_token
from app.db.database import get_db
from app.models import AccessToken, User


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ApiError(401, "Unauthenticated.")

    raw_token = authorization[7:].strip()
    if not raw_token:
        raise ApiError(401, "Unauthenticated.")

    row = (
        db.query(AccessToken)
        .filter(AccessToken.token_hash == hash_token(raw_token))
        .first()
    )
    if row is None:
        raise ApiError(401, "Unauthenticated.")

    return row.user
