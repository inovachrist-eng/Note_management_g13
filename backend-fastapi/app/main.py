"""Point d'entrée de l'API FastAPI — équivalent de bootstrap/app.php + routes/api.php.

- Crée les tables au démarrage (en dev ; en prod on utiliserait Alembic).
- Active le CORS pour le frontend React.
- Traduit les erreurs au format de Laravel : {"message": ..., "errors": {...}}.
- Monte toutes les routes sous le préfixe /api (comme Laravel).
"""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import ApiError
from app.db.database import Base, engine
from app.routers import academic_years, auth, grades, modules, semesters, subjects

# Importer les modèles enregistre les tables sur Base.metadata avant create_all
import app.models  # noqa: F401,E402  (effet de bord voulu)

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s: %(message)s")

# Création des tables au démarrage (dev). En production : migrations Alembic.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Note Management API (FastAPI)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Gestion des erreurs au format Laravel ────────────────────────────────────
@app.exception_handler(ApiError)
async def handle_api_error(_request: Request, exc: ApiError):
    body: dict = {"message": exc.message}
    if exc.errors:
        body["errors"] = exc.errors
    return JSONResponse(status_code=exc.status_code, content=body)


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_request: Request, exc: RequestValidationError):
    """Transforme la 422 de FastAPI en {"message", "errors"} façon Laravel.

    Le frontend lit `data.message` puis `data.errors.<champ>[0]`.
    """
    errors: dict[str, list[str]] = {}
    for err in exc.errors():
        # loc ressemble à ("body", "email") → on garde le dernier segment
        loc = [str(p) for p in err["loc"] if p != "body"]
        field = loc[-1] if loc else "champ"
        errors.setdefault(field, []).append(err["msg"])

    first_message = next(iter(errors.values()))[0] if errors else "Données invalides."
    return JSONResponse(
        status_code=422,
        content={"message": first_message, "errors": errors},
    )


# ── Montage des routes (préfixe /api, comme routes/api.php) ───────────────────
for module in (auth, academic_years, semesters, modules, subjects, grades):
    app.include_router(module.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "api": "/api", "docs": "/docs"}
