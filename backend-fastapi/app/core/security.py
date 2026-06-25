"""Génération et hachage des tokens — équivalent de Laravel Sanctum.

On stocke en base le SHA-256 du token (jamais le token en clair), comme le fait Sanctum.
Le client conserve le token en clair et le renvoie via l'en-tête `Authorization: Bearer <token>`.
"""

import hashlib
import secrets


def generate_token() -> str:
    """Token opaque imprévisible (≈ plainTextToken de Sanctum)."""
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    """Hash stocké en base et comparé à chaque requête."""
    return hashlib.sha256(token.encode()).hexdigest()
