"""Routes d'authentification — équivalent de AuthController + PasswordlessAuthController.

Endpoints (préfixe /api ajouté dans main.py) :
  POST /register                  inscription
  POST /auth/magic-link           envoi du lien de connexion
  POST /auth/magic-link/verify    vérification du lien → token d'accès
  POST /logout            (🔒)    déconnexion (supprime le token courant)
  GET  /user              (🔒)    profil simple
  GET  /user-full         (🔒)    profil + toute la hiérarchie de données
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ApiError
from app.core.security import generate_token, hash_token
from app.db.database import get_db
from app.deps import get_current_user
from app.mailer import send_magic_link
from app.models import AccessToken, MagicLinkToken, User
from app.schemas import MagicLinkIn, RegisterIn, UserFull, UserOut, VerifyIn

router = APIRouter(tags=["auth"])


@router.post("/register", status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists is not None:
        raise ApiError(
            422,
            "Un compte existe déjà avec cet email.",
            {"email": ["Un compte existe déjà avec cet email."]},
        )

    user = User(full_name=payload.full_name, email=payload.email)
    db.add(user)
    db.commit()

    return {
        "message": "Compte créé. Connectez-vous via le lien magique envoyé à votre email.",
        "user": UserOut.model_validate(user),
    }


@router.post("/auth/magic-link")
def send_magic_link_route(payload: MagicLinkIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        raise ApiError(
            422,
            "Aucun compte associé à cet email.",
            {"email": ["Aucun compte associé à cet email."]},
        )

    # Supprime les anciens tokens de cet email
    db.query(MagicLinkToken).filter(MagicLinkToken.email == payload.email).delete()

    raw = generate_token()
    db.add(
        MagicLinkToken(
            email=payload.email,
            token=raw,
            expires_at=datetime.now(timezone.utc)
            + timedelta(minutes=settings.magic_link_ttl_minutes),
        )
    )
    db.commit()

    magic_url = f"{settings.frontend_url}/magic-link?token={raw}"
    send_magic_link(payload.email, user.full_name, magic_url)

    return {"message": f"Lien de connexion envoyé à {payload.email}"}


@router.post("/auth/magic-link/verify")
def verify_magic_link(payload: VerifyIn, db: Session = Depends(get_db)):
    record = db.query(MagicLinkToken).filter(MagicLinkToken.token == payload.token).first()

    if record is None:
        raise ApiError(422, "Lien invalide ou déjà utilisé.")

    if record.is_expired():
        db.delete(record)
        db.commit()
        raise ApiError(422, "Ce lien a expiré. Demandez-en un nouveau.")

    user = db.query(User).filter(User.email == record.email).first()
    if user is None:
        raise ApiError(404, "Utilisateur introuvable.")

    db.delete(record)

    raw = generate_token()
    db.add(AccessToken(user_id=user.id, name="magic_link", token_hash=hash_token(raw)))
    db.commit()

    return {
        "message": "Connexion réussie",
        "token": raw,
        "user": UserOut.model_validate(user),
    }


@router.post("/logout")
def logout(
    authorization: str | None = Header(default=None),
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw = authorization[7:].strip()  # get_current_user a déjà validé le format "Bearer …"
    db.query(AccessToken).filter(AccessToken.token_hash == hash_token(raw)).delete()
    db.commit()
    return {"message": "Déconnexion réussie"}


@router.get("/user")
def user(current: User = Depends(get_current_user)):
    return {"user": UserOut.model_validate(current)}


@router.get("/user-full")
def user_full(current: User = Depends(get_current_user)):
    return {
        "message": "Données utilisateur complètes",
        "user": UserFull.model_validate(current),
    }
