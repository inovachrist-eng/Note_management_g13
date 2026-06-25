# Backend FastAPI — Note Management

Réécriture du backend **Laravel** en **FastAPI** (Python). Le **contrat de l'API est identique** :
mêmes URLs, mêmes corps de requêtes, mêmes réponses JSON. Le frontend React fonctionne donc
**sans aucune modification** (il pointe toujours vers `http://127.0.0.1:8000/api`).

## Stack

| Rôle | Technologie | Équivalent Laravel |
|---|---|---|
| Framework web | **FastAPI** | Laravel |
| ORM (base de données) | **SQLAlchemy 2** | Eloquent |
| Validation | **Pydantic v2** | `$request->validate()` |
| Base de données | **SQLite** (par défaut) | MySQL/SQLite |
| Auth | Token opaque haché (SHA-256) | Sanctum |
| Serveur | **Uvicorn** (ASGI) | `php artisan serve` |

---

## Démarrage rapide

```bash
cd backend-fastapi

# 1. Environnement virtuel + dépendances
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # macOS / Linux
pip install -r requirements.txt

# 2. Configuration (optionnel : les valeurs par défaut suffisent en dev)
copy .env.example .env            # Windows  (cp sur macOS/Linux)

# 3. Lancer l'API sur le port 8000 (celui qu'attend le frontend)
uvicorn app.main:app --reload --port 8000
```

- API : http://127.0.0.1:8000/api
- **Documentation interactive auto-générée** : http://127.0.0.1:8000/docs (Swagger UI)

> 📧 **Connexion en dev** : `MAIL_MAILER=log` (défaut) → le lien magique n'est pas envoyé par
> email mais **affiché dans la console** du serveur. Copiez-le pour vous connecter.
> Les tables SQLite sont créées automatiquement au premier démarrage (fichier `app.db`).

---

## Structure (architecture en couches)

```
backend-fastapi/
├── app/
│   ├── main.py            # création de l'app, CORS, gestion d'erreurs, montage des routes
│   ├── core/
│   │   ├── config.py      # configuration (.env)                    ≈ config/*.php
│   │   ├── security.py    # génération/hachage des tokens           ≈ Sanctum
│   │   └── errors.py      # erreur applicative format Laravel
│   ├── db/
│   │   └── database.py    # moteur + session SQLAlchemy             ≈ couche BDD
│   ├── models/            # tables SQLAlchemy (un fichier/entité)   ≈ app/Models/*
│   │   ├── base.py        #   mixin timestamps
│   │   ├── user.py
│   │   ├── academic_year.py
│   │   ├── semester.py
│   │   ├── course_module.py
│   │   ├── subject.py
│   │   ├── grade.py
│   │   ├── magic_link_token.py
│   │   └── access_token.py
│   ├── schemas/           # validation + sérialisation Pydantic     ≈ validate() + JSON
│   │   ├── common.py      #   types partagés (ORMModel, IdIn…)
│   │   ├── auth.py
│   │   ├── academic_year.py
│   │   ├── semester.py
│   │   ├── module.py
│   │   ├── subject.py
│   │   ├── grade.py
│   │   └── user.py        #   schéma imbriqué complet (user-full)
│   ├── deps.py            # dépendances (get_current_user)          ≈ middleware auth:sanctum
│   ├── mailer.py          # envoi du lien magique                   ≈ Mail / MagicLinkMail
│   └── routers/           # les routes, par domaine                 ≈ Http/Controllers/Api/*
│       ├── auth.py
│       ├── academic_years.py
│       ├── semesters.py
│       ├── modules.py
│       ├── subjects.py
│       └── grades.py
├── requirements.txt
└── .env.example
```

> Les packages `models/` et `schemas/` exposent tout via leur `__init__.py`, donc les imports
> restent simples : `from app.models import User`, `from app.schemas import RegisterIn`.

---

## Correspondance Laravel → FastAPI

| Concept Laravel | Équivalent FastAPI / Python |
|---|---|
| `routes/api.php` | `app/routers/*.py` + `include_router(..., prefix="/api")` |
| Controller (`AcademicYearController`) | un `router` avec ses fonctions |
| `$request->validate([...])` | un schéma **Pydantic** en paramètre de la fonction |
| Model Eloquent (`AcademicYear`) | classe **SQLAlchemy** dans `models.py` |
| `hasMany` / `belongsTo` | `relationship(...)` |
| `Model::create([...])` | `db.add(obj)` + `db.commit()` |
| `findOrFail($id)` | `get_or_404(db, Model, id, ...)` |
| `$request->user()` | dépendance `get_current_user` |
| Middleware `auth:sanctum` | `Depends(get_current_user)` |
| `response()->json([...], 201)` | `return {...}` (+ `status_code=201`) |
| Migrations | `Base.metadata.create_all()` (dev) ; Alembic en prod |
| `php artisan serve` | `uvicorn app.main:app --reload` |

---

## Endpoints (préfixe `/api`)

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | Inscription |
| POST | `/auth/magic-link` | Envoi du lien de connexion (affiché en console en dev) |
| POST | `/auth/magic-link/verify` | Vérifie le lien → renvoie un token d'accès |
| POST | `/logout` 🔒 | Déconnexion (révoque le token) |
| GET | `/user` 🔒 | Profil simple |
| GET | `/user-full` 🔒 | Profil + toute la hiérarchie de données |

### Ressources (toutes 🔒)
| Domaine | Routes |
|---|---|
| Années | `/add_academic_years`, `/mod_academic_years`, `/delete-academic-years` |
| Semestres | `/add_semester`, `/mod_semester`, `/delete_semester`, `/change_semester` |
| Modules | `/modules/add`, `/modules/update`, `/modules/delete`, `/modules/change-order` |
| Matières | `/subjects/add`, `/subjects/update`, `/subjects/delete`, `/subjects/change-order` |
| Notes | `/grades/add`, `/grades/update`, `/grades/delete`, `/grades/change-order`, `/grades/free` |

🔒 = requiert l'en-tête `Authorization: Bearer <token>`.

---

## Choix de compatibilité (pour rester identique à Laravel)

- **Réponses en `snake_case`** (`academic_years`, `semesters`, `modules`, `subjects`, `grades`) :
  c'est ce que lit le frontend React.
- **Erreurs au format Laravel** : `{"message": "...", "errors": {"champ": ["..."]}}` (422),
  et `{"message": "Unauthenticated."}` (401). Géré par les *exception handlers* dans `main.py`.
- **`order_number`** auto-incrémenté à la création, réordonné après suppression, et échangé
  proprement (swap transactionnel) au changement d'ordre — comme les controllers Laravel.
- **Notes libres** (`/grades/free`) : `type="libre"`, `session=0`, remplacées à chaque envoi.

---

## Production (pistes)

- Remplacer `create_all()` par des **migrations Alembic**.
- Passer à **PostgreSQL** : changer `DATABASE_URL` (aucun autre changement de code).
- Lancer derrière **Gunicorn + workers Uvicorn**, en HTTPS.
