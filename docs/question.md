# 📚 Fiche de révision — React · Laravel · Auth · API

> Réponses claires aux 11 questions probables, avec exemples de code.

## 📑 Sommaire

1. [Magic link](#1-magic-link)
2. [Envoyer des emails avec l'API Gmail](#2-envoyer-des-emails-avec-lapi-gmail)
3. [`useState` en React](#3-usestate-en-react)
4. [`useEffect` en React](#4-useeffect-en-react)
5. [Axios vs Fetch](#5-axios-vs-fetch)
6. [Les Hooks](#6-les-hooks)
7. [Le Context](#7-le-context)
8. [Redux](#8-redux)
9. [Eloquent (Laravel)](#9-eloquent-laravel)
10. [Un ORM](#10-un-orm)
11. [Sanctum](#11-sanctum)
12. [Qu'est-ce qui connecte le front et le back ?](#12-quest-ce-qui-connecte-le-front-et-le-back)
13. [C'est quoi une API REST ?](#13-cest-quoi-une-api-rest)
14. [Charger des données au montage (`useEffect` + loader)](#14-charger-des-données-au-montage-useeffect--loader)

---

## 1. Magic Link

Un **magic link** est un lien d'authentification **à usage unique** envoyé par email (ou SMS). Au lieu de taper un mot de passe, l'utilisateur clique sur le lien et il est automatiquement connecté.

### Comment ça marche

| Étape | Action |
|-------|--------|
| 1 | L'utilisateur entre son email |
| 2 | Le serveur génère un **token unique, temporaire et signé** (ex : valable 15 min) |
| 3 | Le token est stocké (ou signé cryptographiquement) et intégré dans un lien |
| 4 | L'email est envoyé à l'utilisateur |
| 5 | Au clic, le serveur **vérifie** le token (validité + expiration), ouvre la session |
| 6 | Le token est **invalidé** (usage unique) |

```
https://monsite.com/login?token=abc123xyz...
```

> ✅ **Avantages** : pas de mot de passe à retenir, pas de fuite de mot de passe.
> ⚠️ **Limites** : dépend de la sécurité de la boîte mail.

---

## 2. Envoyer des emails avec l'API Gmail

On utilise l'**API Gmail** de Google avec une authentification **OAuth2**.

### Étapes

1. Créer un projet sur **Google Cloud Console**
2. Activer l'**API Gmail**
3. Configurer l'**écran de consentement OAuth**
4. Créer des **identifiants** (OAuth Client ID ou Service Account)
5. Récupérer un `access_token` via OAuth2 (scope `gmail.send`)
6. Construire le message au format **MIME** (`From`, `To`, `Subject`, `Body`)
7. Encoder le message en **base64url**
8. Appeler l'endpoint d'envoi

```http
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "raw": "<message_encodé_en_base64url>"
}
```

> 💡 **Alternative simple** : utiliser le **SMTP de Gmail** (`smtp.gmail.com`) avec un *App Password*. Plus rapide pour de petits projets (ex : `MAIL_MAILER=smtp` dans Laravel).

---

## 3. `useState` en React

C'est un **Hook** qui permet d'ajouter un **état local** à un composant fonctionnel — une variable qui change dans le temps et déclenche un re-render.

```jsx
const [valeur, setValeur] = useState(valeurInitiale);
```

- `valeur` → la valeur actuelle de l'état
- `setValeur` → la fonction pour la modifier
- Appeler `setValeur(...)` → React **re-render** le composant

### Exemple

```jsx
function Compteur() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Cliqué {count} fois
    </button>
  );
}
```

---

## 4. `useEffect` en React

C'est un **Hook** qui gère les **effets de bord** : tout ce qui sort du simple rendu (appels API, timers, abonnements, manipulation du DOM…). Il s'exécute **après** le rendu.

```jsx
useEffect(() => {
  // code de l'effet
  return () => {
    // nettoyage (cleanup) : timer, désabonnement...
  };
}, [dependances]);
```

### Le tableau de dépendances

| Dépendances | Comportement |
|-------------|--------------|
| `[]` | S'exécute **une seule fois** (au montage) |
| `[valeur]` | Se ré-exécute quand `valeur` change |
| *(aucun tableau)* | S'exécute **à chaque render** (à éviter) |

### Exemple

```jsx
useEffect(() => {
  axios.get("/api/users").then(res => setUsers(res.data));
}, []); // au montage uniquement
```

---

## 5. Axios vs Fetch

**Axios** est une librairie JavaScript pour faire des requêtes HTTP (`GET`, `POST`, `PUT`, `DELETE`…). C'est une alternative à `fetch()`.

### Pourquoi axios plutôt que fetch ?

| Critère | `fetch` | `axios` |
|---------|---------|---------|
| Conversion JSON | Manuelle (`.json()`) | **Automatique** |
| Erreurs HTTP (4xx/5xx) | ❌ Ne rejette pas | ✅ **Rejette** automatiquement |
| Intercepteurs | ❌ | ✅ (ajouter un token, gérer les erreurs globalement) |
| Config globale (`baseURL`) | ❌ | ✅ |
| Timeout natif | ❌ | ✅ |
| Annulation de requête | Manuelle | ✅ Simple |
| Dépendance externe | Aucune | À installer |

### Exemple

```js
// axios
const { data } = await axios.get("/api/users");

// fetch équivalent
const res = await fetch("/api/users");
const data = await res.json();
```

> 👉 `fetch` reste parfait pour des cas simples et n'ajoute aucune dépendance.

---

## 6. Les Hooks

Un **Hook** est une fonction spéciale de React qui permet d'utiliser des fonctionnalités de React (état, cycle de vie, contexte…) **dans un composant fonctionnel**, sans écrire de classe.

### Hooks de base

`useState` · `useEffect` · `useContext` · `useRef` · `useMemo` · `useCallback` · `useReducer`

### Custom hooks

On peut créer ses propres Hooks (ex : `useAuth`, `useFetch`). Le nom **commence toujours par `use`**.

### ⚠️ Les 2 règles des Hooks

1. Les appeler **uniquement au niveau racine** du composant (jamais dans une boucle, une condition ou une fonction imbriquée).
2. Les appeler **uniquement** dans des composants React ou d'autres Hooks.

---

## 7. Le Context

Le **Context** est un mécanisme React pour **partager des données** à travers l'arbre de composants **sans passer les props** à chaque niveau (on évite le *prop drilling*).

### Cas d'usage typiques

Utilisateur connecté · Thème (clair/sombre) · Langue · Panier d'achat

### Les 3 étapes

```jsx
// 1. Créer le contexte
const AuthContext = createContext();

// 2. Fournir la valeur
<AuthContext.Provider value={user}>
  <App />
</AuthContext.Provider>

// 3. Consommer la valeur
const user = useContext(AuthContext);
```

> ℹ️ Tous les composants qui consomment le contexte se **re-render** quand la valeur change → idéal pour des données peu fréquentes.

---

## 8. Redux

**Redux** est une librairie de **gestion d'état global**. Elle centralise tout l'état de l'appli dans un seul endroit : le **store**.

### Concepts clés

| Concept | Rôle |
|---------|------|
| **Store** | Objet unique qui contient tout l'état |
| **Action** | Objet décrivant ce qui s'est passé : `{ type, payload }` |
| **Reducer** | Fonction pure `(state, action) => nouveau state` |
| **Dispatch** | Envoie une action au store |

### Flux unidirectionnel

```
Composant → dispatch(action) → reducer → nouveau state → re-render
```

> 💡 Aujourd'hui on utilise surtout **Redux Toolkit (RTK)** (moins de code, *slices*…).
>
> Pour un petit projet, **Context + `useReducer`** suffit souvent.

---

## 9. Eloquent (Laravel)

**Eloquent** est l'**ORM intégré à Laravel**. Il permet d'interagir avec la base de données en manipulant des **objets PHP** (des *Modèles*) au lieu d'écrire du SQL à la main.

> Chaque table correspond à un Modèle : table `users` ↔ modèle `User`

### Exemples

```php
User::all();                        // SELECT * FROM users
User::find(1);                      // par id
User::where('actif', true)->get();  // filtre
$user->posts;                       // relation (1-N)
```

> ✅ **Avantages** : code lisible, relations faciles (`hasMany`, `belongsTo`…), protection contre les injections SQL, moins de code répétitif.

---

## 10. Un ORM

**ORM** = *Object-Relational Mapping* (mapping objet-relationnel). C'est le **pont** entre :

- le monde **objet** (classes, objets de ton langage)
- et le monde **relationnel** (tables, lignes, colonnes de la BDD)

L'ORM transforme tes objets en requêtes SQL et inversement → **tu manipules des objets, l'ORM écrit le SQL pour toi.**

| ✅ Avantages | ⚠️ Inconvénients |
|-------------|------------------|
| Productivité | SQL parfois moins optimisé |
| Code lisible | Courbe d'apprentissage |
| Sécurité (injections SQL) | Peut être lent sur requêtes complexes |
| Portabilité entre BDD | |

> **Exemples d'ORM** : Eloquent (Laravel), Doctrine (Symfony), Prisma / Sequelize (Node.js), Hibernate (Java).

---

## 11. Sanctum

**Laravel Sanctum** est un package officiel de Laravel pour gérer l'**authentification d'API** de manière simple et légère.

### 2 cas d'usage

**① Authentification par token** (applis mobiles, API externes)

```php
$token = $user->createToken('nom')->plainTextToken;
```

Le client envoie ensuite :

```http
Authorization: Bearer <token>
```

**② Authentification SPA** (front React/Vue sur le même domaine)
→ utilise les **cookies de session** + protection **CSRF**.

### Sanctum vs Passport

| | Sanctum | Passport |
|--|---------|----------|
| Poids | Léger ✅ | Lourd |
| OAuth2 complet | ❌ | ✅ |
| Recommandé pour | SPA + tokens simples | OAuth2 avancé |

> 👉 C'est le choix recommandé pour ton stack **Laravel + React**.

---

## 12. Qu'est-ce qui connecte le front et le back ?

> ❓ *Question piège : « C'est les Hooks qui connectent le backend et le frontend ? »*
> **Non.** Les Hooks **orchestrent**, mais ce n'est **pas eux** qui communiquent avec le serveur.

### Le vrai « pont » : une API REST + HTTP

Le frontend (React) et le backend (Laravel) sont **deux applications séparées**, souvent sur des ports différents :

```text
React (Vite)  http://localhost:5173  ──►  Laravel API  http://127.0.0.1:8000/api
              (ou nginx : localhost:80)        (renvoie du JSON)
```

Ils ne partagent **aucun code** : ils discutent uniquement via des **requêtes HTTP** qui transportent du **JSON**.

### Qui fait quoi ?

| Élément | Rôle réel |
| --- | --- |
| **axios** (ou `fetch`) | 🌉 **LE pont** : envoie la requête HTTP au backend et récupère la réponse |
| **API REST** (`routes/api.php`) | Le backend **expose des endpoints** (`/api/login`, `/api/grades`…) qui renvoient du JSON |
| **`useEffect`** | Décide **QUAND** lancer l'appel (ex. au chargement de la page) |
| **`useState`** | Décide **OÙ ranger** la réponse pour l'afficher |
| Événement (`onSubmit`, `onClick`) | Déclenche l'appel suite à une action de l'utilisateur |
| **CORS** | Autorise le navigateur à appeler une API sur un **autre domaine/port** |

> 🧠 **À retenir** : `axios` connecte, les Hooks orchestrent.
> Les Hooks ne savent rien du réseau — ils gèrent l'état et le cycle de vie du composant.

### Le flux complet (exemple : connexion)

```text
1. L'utilisateur tape son email          → useState stocke la valeur
2. Il clique « Envoyer »                  → onSubmit déclenche la fonction
3. axios.post(`${BASE_URL}/...`, data)    → requête HTTP envoyée au backend  ◄── LA CONNEXION
4. Laravel traite et renvoie du JSON      → réponse HTTP
5. setSent(true) / setError(...)          → useState met à jour l'état
6. React re-render avec le résultat       → l'UI change
```

### Exemple tiré du projet (`Login.jsx`)

```jsx
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config"; // "http://127.0.0.1:8000/api"

const [email, setEmail] = useState("");        // 👈 Hook : gère l'état

async function handleSubmit(e) {
  e.preventDefault();
  // 👇 axios : LA connexion réelle au backend
  await axios.post(`${BASE_URL}/auth/magic-link`, { email });
  setSent(true);                               // 👈 Hook : met à jour l'UI
}
```

> 💡 **Analogie** : `axios` est le **téléphone** qui appelle le serveur.
> `useEffect`/`useState` décident **quand décrocher** et **quoi noter** — mais ils ne sont pas la ligne téléphonique.

### Appel au montage (avec `useEffect`)

```jsx
useEffect(() => {
  axios.get(`${BASE_URL}/user-full`, { headers: authHeaders() })
    .then(res => setData(res.data));   // axios connecte, useState range
}, []); // [] = une seule fois au chargement
```

---

## 13. C'est quoi une API REST ?

Une **API REST** (*REpresentational State Transfer*) est une **convention** pour construire une API web. Le backend expose des **ressources** (utilisateurs, notes, modules…) accessibles via des **URLs**, et on agit dessus avec les **verbes HTTP**.

> 📌 En clair : une API REST, c'est un **menu d'URLs** que le frontend peut appeler pour **lire et modifier** les données du serveur.

### Les 4 principes clés

| Principe | Explication |
| --- | --- |
| **Ressources** | Chaque chose est une ressource avec une URL : `/api/users`, `/api/grades` |
| **Verbes HTTP** | L'action dépend de la méthode : `GET` (lire), `POST` (créer), `PUT/PATCH` (modifier), `DELETE` (supprimer) |
| **Sans état** (*stateless*) | Le serveur ne « retient » rien entre 2 requêtes → chaque requête porte elle-même son **token** d'auth |
| **Représentation** | Les données sont échangées dans un format standard, le plus souvent **JSON** |

### Verbes HTTP ↔ CRUD

| Verbe | Action | Exemple | SQL équivalent |
| --- | --- | --- | --- |
| `GET` | Lire | `GET /api/grades` | `SELECT` |
| `POST` | Créer | `POST /api/grades/add` | `INSERT` |
| `PUT` / `PATCH` | Modifier | `POST /api/grades/update` | `UPDATE` |
| `DELETE` | Supprimer | `POST /api/grades/delete` | `DELETE` |

### Les codes de statut HTTP

| Code | Signification |
| --- | --- |
| **2xx** | ✅ Succès (`200` OK, `201` Créé) |
| **4xx** | ⚠️ Erreur du client (`401` non authentifié, `404` introuvable, `422` validation) |
| **5xx** | ❌ Erreur du serveur (`500`) |

### Exemple concret (ton projet)

```http
GET http://127.0.0.1:8000/api/user-full
Authorization: Bearer <token>

→ Réponse 200 OK
{
  "user": { "id": 1, "name": "Christ" },
  "academic_years": [ ... ]
}
```

> 💡 **REST ≠ une techno** : c'est un **style d'architecture**. Laravel l'implémente via `routes/api.php`, et React le consomme via `axios`.

---

## 14. Charger des données au montage (`useEffect` + loader)

C'est **le** pattern le plus courant : quand une page s'ouvre, on va chercher les données sur l'API. Comme l'appel réseau **prend du temps**, on affiche un **loader** (spinner) en attendant, puis le résultat ou une erreur.

> 🧠 **C'est bien le Hook qui pilote axios** : `useEffect` déclenche l'appel, et `useState` mémorise dans quel état on se trouve.

### Les 3 états à gérer

| État | Rôle | Ce qu'on affiche |
| --- | --- | --- |
| `loading` | L'appel est en cours | ⏳ un spinner / squelette |
| `error` | L'appel a échoué | ⚠️ un message d'erreur |
| `data` | L'appel a réussi | ✅ les données |

### Le pattern complet

```jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

export default function MaPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);  // 👈 true au départ
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${BASE_URL}/user-full`)
      .then((res) => setData(res.data))                 // ✅ succès
      .catch(() => setError("Impossible de charger."))  // ⚠️ erreur
      .finally(() => setLoading(false));                // 🏁 toujours, à la fin
  }, []); // [] → une seule fois, à l'ouverture de la page

  if (loading) return <p>⏳ Chargement…</p>;     // loader
  if (error)   return <p>{error}</p>;             // erreur
  return <pre>{JSON.stringify(data, null, 2)}</pre>; // données
}
```

### Pourquoi `finally` ?

`finally` s'exécute **dans tous les cas** (succès **ou** erreur) → on est sûr de **couper le loader** quoi qu'il arrive. Sans lui, un échec laisserait le spinner tourner à l'infini.

### Variante : un seul état `status` (comme dans `MagicLinkVerify.jsx`)

```jsx
const [status, setStatus] = useState("loading"); // "loading" | "error" | "ok"

useEffect(() => {
  axios.post(`${BASE_URL}/auth/magic-link/verify`, { token })
    .then(() => setStatus("ok"))
    .catch(() => setStatus("error"));
}, []);

// puis dans le JSX :
{status === "loading" && <Spinner />}
{status === "error"   && <Message erreur />}
```

> ⚠️ **Piège classique** : oublier le tableau `[]` de dépendances → l'appel se relance **à chaque render** → boucle infinie de requêtes.

---

*Fiche de révision — bon courage pour les questions ! 💪*