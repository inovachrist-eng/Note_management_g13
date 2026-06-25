# Projet G12 — Système de gestion académique

Application web de gestion des **notes et résultats scolaires**, organisée par année académique → semestre → module → matière → note. Un utilisateur gère son propre cursus : il crée ses années, y ajoute des semestres, des modules de cours, des matières, puis saisit ses notes.

L'application est découpée en deux parties indépendantes :

- **`backend/`** — API REST en **Laravel** (PHP), authentification par token.
- **`frontend/`** — Interface **React + Vite**, qui consomme l'API.

> 🎓 **Nouveau sur Laravel ou React ?** Lisez le [**Guide éducatif (GUIDE.md)**](GUIDE.md) : il explique pas à pas, avec de vrais extraits du code, comment le projet est construit des deux côtés.

---

## Stack technique

| Couche | Technologies |
|---|---|
| **Backend** | Laravel 13 · PHP 8.3+ · Laravel Sanctum (auth token) · base de données relationnelle (MySQL / SQLite) |
| **Frontend** | React 19 · Vite 8 · React Router 7 · Axios · TailwindCSS 4 · `qrcode.react` |
| **Auth** | Inscription + **connexion sans mot de passe** (magic link par email) · token Bearer stocké côté client |

---

## Structure du dépôt

```
Projet/
├── backend/                # API REST Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Auth, AcademicYear, Semester, CourseModule, Subject, Grade…
│   │   ├── Models/                 # User, AcademicYear, Semester, CourseModule, Subject, Grade…
│   │   └── Mail/                   # MagicLinkMail (email de connexion)
│   ├── database/migrations/        # Schéma de la base
│   └── routes/api.php              # Toutes les routes de l'API
│
├── frontend/               # Interface React (Vite)
│   └── src/
│       ├── pages/                  # Home, Login, Register, Admin, MagicLinkVerify
│       ├── components/             # ProtectedRoute, sidebar, formulaires d'ajout…
│       └── config.js               # URL de base de l'API
│
├── run_servers.c           # Petit utilitaire C : lance les 2 serveurs (PHP + Vite)
└── README.md
```

---

## Modèle de données

Les données suivent une hiérarchie stricte, propre à chaque utilisateur :

```
User
 └── AcademicYear      (année académique)
      └── Semester     (semestre)
           └── CourseModule   (module de cours, avec crédits)
                └── Subject    (matière)
                     └── Grade (note : type, session, score décimal)
```

Chaque niveau possède un `order_number` pour gérer l'ordre d'affichage.

---

## Démarrage rapide

### Prérequis
- PHP **8.3+** et Composer
- Node.js **18+** et npm
- Une base de données (MySQL, ou SQLite pour le développement)

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env          # puis renseigner la connexion BDD + le mailer
php artisan key:generate
php artisan migrate
php artisan serve             # → http://127.0.0.1:8000
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

> L'URL de l'API consommée par le frontend est définie dans
> [`frontend/src/config.js`](frontend/src/config.js) (`http://127.0.0.1:8000/api` par défaut).

### Raccourci : lancer les deux serveurs d'un coup

Le fichier [`run_servers.c`](run_servers.c) ouvre automatiquement le serveur PHP **et** le serveur Vite dans deux terminaux :

```bash
gcc run_servers.c -o run_servers
./run_servers
```

---

## Aperçu de l'API

Base : `/api` · les routes protégées exigent un header `Authorization: Bearer <token>`.

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | Inscription |
| POST | `/auth/magic-link` | Envoi du lien de connexion par email |
| POST | `/auth/magic-link/verify` | Vérification du lien et émission du token |
| POST | `/logout` 🔒 | Déconnexion |
| GET | `/user` 🔒 | Profil de l'utilisateur connecté |
| GET | `/user-full` 🔒 | Profil **+ toutes les données** (années → … → notes) |

### Ressources (toutes protégées 🔒)
| Domaine | Routes |
|---|---|
| **Années** | `add_academic_years`, `mod_academic_years`, `delete-academic-years` |
| **Semestres** | `add_semester`, `mod_semester`, `delete_semester`, `change_semester` |
| **Modules** | `modules/add`, `modules/update`, `modules/delete`, `modules/change-order` |
| **Matières** | `subjects/add`, `subjects/update`, `subjects/delete`, `subjects/change-order` |
| **Notes** | `grades/add`, `grades/update`, `grades/delete`, `grades/change-order`, `grades/free` |

> Définition complète : [`backend/routes/api.php`](backend/routes/api.php).

---

## Frontend — pages principales

| Page | Rôle |
|---|---|
| `Home` | Page d'accueil (présentation, QR code, contributeurs) |
| `Register` / `Login` | Inscription et connexion |
| `MagicLinkVerify` | Vérification du lien de connexion reçu par email |
| `Admin` 🔒 | Tableau de bord : navigation par année/semestre, gestion des modules, matières et notes |

La route `/admin` est protégée par [`ProtectedRoute`](frontend/src/components/ProtectedRoute.jsx) (redirige vers la connexion si aucun token).

### Charte d'interface
Le projet suit une charte UI sobre et professionnelle (vert comme seule couleur d'accent, bordures plutôt qu'ombres, pas de dégradés). Détails dans [`inova.skill.md`](inova.skill.md).

---

## État du projet

Base technique solide (Laravel + React bien séparés, auth fonctionnelle). Le développement se poursuit côté tableau de bord et saisie des notes. L'état détaillé, les fonctionnalités terminées et les points en cours sont suivis dans [`PROJECT_STATE.md`](PROJECT_STATE.md).
