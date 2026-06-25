# PROJECT_STATE.md — Academic Management System

> Généré automatiquement le 2026-05-20 · Analyse complète du backend et du frontend.

---

## Architecture actuelle

```
Projet/
├── backend/                  # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── AcademicYearController.php
│   │   │   ├── SemesterController.php
│   │   │   ├── CourseModuleController.php
│   │   │   ├── SubjectController.php
│   │   │   └── GradeController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── AcademicYear.php
│   │       ├── Semester.php
│   │       ├── CourseModule.php
│   │       ├── Subject.php
│   │       └── Grade.php
│   ├── database/migrations/
│   └── routes/api.php
└── frontend/                 # React 19 + Vite + TailwindCSS v4
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Admin.jsx
        └── components/
            ├── ProtectedRoute.jsx
            ├── message.jsx
            ├── slidebar.jsx
            └── hover/add/
                ├── add_academic_years.jsx
                ├── add_semester.jsx
                ├── Add_module_and_subject.jsx
                └── add_grades.jsx   ← VIDE
```

**Stack :**
- Backend : Laravel 11, Sanctum (auth token), MySQL
- Frontend : React 19, Vite 8, TailwindCSS v4, Axios, React Router v7
- Auth : Bearer token (localStorage)

---

## Hiérarchie des données

```
User
 └── AcademicYear (année scolaire)
      └── Semester (semestre, order_number)
           └── CourseModule (module, credits, order_number)
                └── Subject (matière, order_number)
                     └── Grade (note, type, session 1/2, score, order_number)
```

---

## Fonctionnalités déjà terminées

| Fonctionnalité | Statut |
|---|---|
| Inscription / Connexion / Déconnexion | ✅ Complet |
| Création d'années académiques | ✅ Complet |
| Chargement complet des données (`userFull`) | ✅ Complet |
| CRUD semestres (add, mod, delete, change-order) | ✅ Partiel (voir problèmes) |
| CRUD modules | ✅ Partiel |
| CRUD subjects | ✅ Partiel |
| CRUD grades | ✅ Partiel |
| Sidebar navigation (années, semestres) | ✅ Complet |
| Route `/admin` protégée | ✅ Complet |
| Chargement eager des relations (semesters → modules → subjects → grades) | ✅ Complet |

---

## Problèmes détectés

### Backend

| Problème | Fichier | Gravité |
|---|---|---|
| `GradeController` non importé dans `api.php` | `routes/api.php` | 🔴 Critique — routes grades cassées |
| `order_number` requis en input sur add_semester, add_module, add_subject, add_grade | Tous les controllers | 🔴 Critique |
| `order_number` jamais auto-généré | Tous les controllers | 🔴 Critique |
| Après suppression, les `order_number` des items restants ne sont pas réordonnés | SemesterController, CourseModuleController, SubjectController, GradeController | 🟠 Important |
| `score` défini en `integer` en BDD alors que les notes peuvent être décimales (14.5/20) | Migration grades | 🟠 Important |
| `AuthController::Login` — `request` en minuscule (bug PHP) | `AuthController.php` | 🟠 Important |
| `mod_academic_years` et `delete_academic_years` n'utilisent pas `findOrFail` de manière optimale | `AcademicYearController.php` | 🟡 Mineur |
| Pas de vérification propriété user sur semestres/modules/subjects | Tous les controllers | 🟡 Sécurité |

### Frontend

| Problème | Fichier | Gravité |
|---|---|---|
| `add_grades.jsx` complètement vide | `add_grades.jsx` | 🔴 Critique |
| `add_semester.jsx` demande `order_number` à l'utilisateur | `add_semester.jsx` | 🔴 UX |
| `Add_module_and_subject.jsx` demande `order_number` pour module et chaque matière | `Add_module_and_subject.jsx` | 🔴 UX |
| `window.location.reload()` utilisé à la place d'un callback | `add_semester.jsx`, `add_academic_years.jsx` | 🟠 Mauvaise pratique |
| `Admin.jsx` n'affiche pas les modules/matières/notes du semestre sélectionné | `Admin.jsx` | 🔴 Critique |
| Pas de section statistiques | `Admin.jsx` | 🔴 Fonctionnalité manquante |
| `Register.jsx` — pas d'état de chargement, pas de gestion d'erreur | `Register.jsx` | 🟠 UX |
| Erreurs console.log au lieu de gestion propre des erreurs | Partout | 🟡 Qualité |
| Refresh des données par rechargement page entière | Partout | 🟡 UX |

---

## Routes API existantes

### Auth (publiques)
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/register` | Inscription |
| POST | `/api/login` | Connexion |

### Auth (protégées — Bearer token)
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/logout` | Déconnexion |
| GET | `/api/user` | Profil simple |
| GET | `/api/user-full` | Profil complet avec toutes les données |

### Années académiques
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/add_academic_years` | Créer une année |
| POST | `/api/mod_academic_years` | Modifier une année |
| POST | `/api/delete_academic_years` | Supprimer une année |

### Semestres
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/add_semester` | Créer un semestre |
| POST | `/api/mod_semester` | Modifier un semestre |
| POST | `/api/delete_semester` | Supprimer un semestre |
| POST | `/api/change_semester` | Changer l'ordre d'un semestre |

### Modules
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/modules/add` | Créer un module |
| POST | `/api/modules/update` | Modifier un module |
| POST | `/api/modules/delete` | Supprimer un module |
| POST | `/api/modules/change-order` | Changer l'ordre d'un module |

### Matières (Subjects)
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/subjects/add` | Créer une matière |
| POST | `/api/subjects/update` | Modifier une matière |
| POST | `/api/subjects/delete` | Supprimer une matière |
| POST | `/api/subjects/change-order` | Changer l'ordre d'une matière |

### Notes (Grades) — ⚠️ CASSÉES (GradeController non importé)
| Méthode | Route | Action |
|---|---|---|
| POST | `/api/grades/add` | Ajouter une note |
| POST | `/api/grades/update` | Modifier une note |
| POST | `/api/grades/delete` | Supprimer une note |
| POST | `/api/grades/change-order` | Changer l'ordre d'une note |

---

## Composants frontend existants

| Composant | Fichier | Description |
|---|---|---|
| `Home` | `pages/Home.jsx` | Landing page avec QR code et contributeurs |
| `Login` | `pages/Login.jsx` | Page de connexion avec gestion erreurs basique |
| `Register` | `pages/Register.jsx` | Inscription — sans loading state ni erreurs propres |
| `Admin` | `pages/Admin.jsx` | Dashboard — sidebar + état vide, sans modules/notes |
| `ProtectedRoute` | `components/ProtectedRoute.jsx` | Guard de route par token |
| `Message` | `components/message.jsx` | Composant d'affichage de messages |
| `Slidebar` | `components/slidebar.jsx` | Carrousel de contributeurs (Home) |
| `Add_academic` | `hover/add/add_academic_years.jsx` | Formulaire ajout année académique |
| `Add_semester` | `hover/add/add_semester.jsx` | Formulaire ajout semestre (avec ordre manuel) |
| `Add_module_and_subject` | `hover/add/Add_module_and_subject.jsx` | Formulaire ajout module + matières |
| `add_grades` | `hover/add/add_grades.jsx` | **VIDE — non implémenté** |

---

## Améliorations à faire

### Backend (priorité haute)
1. ✅ Corriger l'import manquant de `GradeController` dans `api.php`
2. ✅ Rendre `order_number` optionnel et auto-généré dans tous les controllers
3. ✅ Réordonner les items après suppression
4. ✅ Changer `score` de `integer` à `decimal(5,2)` dans la migration grades
5. ✅ Corriger le bug `request` lowercase dans `AuthController`

### Frontend (priorité haute)
1. ✅ Supprimer les inputs `order_number` des formulaires
2. ✅ Utiliser des callbacks `refresh` au lieu de `window.location.reload()`
3. ✅ Implémenter la section notes (interface de saisie)
4. ✅ Implémenter le panneau de statistiques
5. ✅ Revoir `Admin.jsx` pour afficher modules, matières, notes
6. ✅ Améliorer `Register.jsx` avec loading/erreur

---

## État global du projet

| Aspect | Note |
|---|---|
| Architecture | 🟢 Solide (Laravel + React bien séparés) |
| Auth | 🟢 Fonctionnelle (Sanctum) |
| Backend CRUD | 🟠 Partiel (order_number cassé, GradeController non branché) |
| Frontend UI | 🟠 Partiel (sidebar ok, mais pas de contenu dans Admin) |
| Gestion des notes | 🔴 Absente |
| Statistiques | 🔴 Absentes |
| Qualité du code | 🟠 Moyen (gestion erreurs basique, reloads de page) |
| **Global** | **🟠 En développement — base solide mais incomplète** |
