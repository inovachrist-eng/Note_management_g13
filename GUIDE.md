# 📚 Guide éducatif — Comment ce projet est construit

Ce document explique **en détail et pas à pas** comment fonctionne le projet, pour quelqu'un qui découvre Laravel et React. On utilise de **vrais extraits du code** du projet.

Le projet est une application de **gestion des notes** découpée en deux programmes séparés qui communiquent :

```
┌─────────────────────┐         requêtes HTTP (JSON)         ┌──────────────────────┐
│   FRONTEND (React)   │  ──────────────────────────────▶    │   BACKEND (Laravel)  │
│   ce que l'on voit   │                                      │   le cerveau + la BDD │
│   navigateur :5173   │  ◀──────────────────────────────    │   serveur PHP :8000   │
└─────────────────────┘          réponses (JSON)             └──────────────────────┘
```

- Le **frontend** (React) = l'interface : pages, boutons, formulaires. Il ne sait rien faire seul, il **demande** au backend.
- Le **backend** (Laravel) = la logique + la base de données. Il **reçoit** des requêtes, vérifie, lit/écrit en base, et **répond** en JSON.

> 💡 **JSON** = un format texte pour échanger des données, ex : `{ "name": "Licence 1", "id": 3 }`.

---

# PARTIE 1 — LE BACKEND EN LARAVEL

## 1.1 C'est quoi Laravel ?

**Laravel** est un *framework* PHP : une boîte à outils qui organise le code selon le modèle **MVC**.

| Lettre | Nom | Rôle dans ce projet | Où |
|---|---|---|---|
| **M** | Model (Modèle) | Représente une table de la BDD (ex: `AcademicYear`) | `app/Models/` |
| **V** | View (Vue) | *Peu utilisé ici* — on renvoie du JSON, pas du HTML | `resources/views/` |
| **C** | Controller (Contrôleur) | Reçoit la requête, fait le travail, renvoie la réponse | `app/Http/Controllers/Api/` |

Comme le frontend est en React, Laravel ne génère **presque pas de pages HTML** : il sert d'**API** (il renvoie des données JSON).

## 1.2 Le trajet d'une requête (le plus important à comprendre)

Quand l'utilisateur ajoute une année académique, voici ce qui se passe côté backend :

```
1. ROUTE        routes/api.php   →  « POST /api/add_academic_years, va voir tel contrôleur »
2. MIDDLEWARE   auth:sanctum     →  « cet utilisateur a-t-il un token valide ? »
3. CONTROLLER   AcademicYearController →  valide les données, crée l'objet
4. MODEL        AcademicYear     →  écrit une ligne dans la table academic_years
5. RÉPONSE      response()->json →  renvoie un JSON au frontend
```

Décortiquons chaque étape avec le vrai code.

## 1.3 Les routes — `routes/api.php`

Une **route** associe une URL + une méthode HTTP à une **méthode de contrôleur**. C'est l'annuaire de l'API.

```php
// Routes publiques (pas besoin d'être connecté)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/magic-link',        [PasswordlessAuthController::class, 'send']);
Route::post('/auth/magic-link/verify', [PasswordlessAuthController::class, 'verify']);

// Routes protégées : il FAUT un token valide (middleware auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/add_academic_years', [AcademicYearController::class, 'add_academic_years']);
    Route::get('/user-full',           [AuthController::class, 'userFull']);
    // ... etc
});
```

À retenir :
- `Route::post('/url', [Controleur::class, 'methode'])` = « quand on reçoit un POST sur cette URL, exécute cette méthode ».
- `Route::middleware('auth:sanctum')->group(...)` = **tout ce qui est dans ce groupe est protégé**. Sans token valide → erreur `401 Unauthorized`.

## 1.4 Les contrôleurs — la logique

Un contrôleur reçoit l'objet `$request` (la requête) et renvoie une réponse. Exemple **réel** du projet, `AcademicYearController::add_academic_years` :

```php
public function add_academic_years(Request $request)
{
    // 1) VALIDATION : on refuse les données invalides AVANT de toucher la BDD
    $request->validate([
        'name' => 'required|string|max:225'
    ]);

    // 2) On récupère l'utilisateur connecté (grâce au token)
    $user = $request->user();

    // 3) On crée la ligne en base, liée à cet utilisateur
    $academicYear = AcademicYear::create([
        'user_id' => $user->id,
        'name'    => $request->name
    ]);

    // 4) On renvoie une réponse JSON
    return response()->json([
        'message' => 'Nouvelle année scolaire ajoutée',
        'data'    => $academicYear
    ]);
}
```

Les 3 réflexes Laravel illustrés ici :
- **`$request->validate([...])`** : règles de validation. Si `name` est vide, Laravel renvoie automatiquement une erreur `422` avec le détail. On n'écrit aucun `if` pour ça.
- **`$request->user()`** : Laravel sait *qui* fait la requête grâce au token Sanctum. Pas besoin de demander l'identité dans le formulaire.
- **`Model::create([...])`** : crée et enregistre une ligne en une seule instruction (Eloquent, voir plus bas).

> 🔎 Comparez avec `mod_academic_years` (modifier) et `delete_academic_years` (supprimer) dans le même fichier : même structure → valider → trouver → agir → répondre.

## 1.5 Les modèles & Eloquent — parler à la base sans SQL

Un **modèle** est une classe PHP qui représente une table. Grâce à **Eloquent** (l'ORM de Laravel), on manipule la base **sans écrire de SQL**.

Modèle `AcademicYear` (réel) :

```php
class AcademicYear extends Model
{
    // Champs que l'on autorise à remplir en masse (sécurité)
    protected $fillable = ['user_id', 'name'];

    // RELATION : une année possède plusieurs semestres
    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }
}
```

### Les relations = la colonne vertébrale du projet

Les données forment une **hiérarchie** (une chaîne parent → enfant) :

```
User
 └── AcademicYear   (hasMany)   → un utilisateur a plusieurs années
      └── Semester  (hasMany)   → une année a plusieurs semestres
           └── CourseModule     → un semestre a plusieurs modules
                └── Subject      → un module a plusieurs matières
                     └── Grade   → une matière a plusieurs notes
```

Dans le code, chaque « a plusieurs » s'écrit `hasMany`. Exemple dans `User` :

```php
public function academicYears(): HasMany
{
    return $this->hasMany(AcademicYear::class);  // 1 user → N années
}
```

Et la note connaît son parent avec `belongsTo` (« appartient à ») :

```php
// Dans le modèle Grade
public function subject()
{
    return $this->belongsTo(Subject::class);  // 1 note → 1 matière
}
```

### Le chargement « eager » : tout récupérer en une fois

Le frontend a besoin de **toutes** les données d'un coup pour afficher le tableau de bord. C'est le rôle de `userFull` (réel) :

```php
public function userFull(Request $request)
{
    $data = $request->user()->load([
        'academicYears'                                    => fn ($q) => $q->orderBy('id', 'asc'),
        'academicYears.semesters'                          => fn ($q) => $q->orderBy('order_number', 'asc'),
        'academicYears.semesters.modules'                  => fn ($q) => $q->orderBy('order_number', 'asc'),
        'academicYears.semesters.modules.subjects'         => fn ($q) => $q->orderBy('order_number', 'asc'),
        'academicYears.semesters.modules.subjects.grades'  => fn ($q) => $q->orderBy('order_number', 'asc'),
    ]);

    return response()->json(['user' => $data]);
}
```

`->load([...])` descend toute la chaîne (années → semestres → modules → matières → notes) **en une seule requête optimisée**, triée par `order_number`. Le frontend reçoit un seul gros JSON imbriqué.

## 1.6 Les migrations — fabriquer les tables

On ne crée pas les tables « à la main » dans phpMyAdmin. On les décrit en PHP dans `database/migrations/`, et `php artisan migrate` les construit. Exemple (table `grades`) :

```php
Schema::create('grades', function (Blueprint $table) {
    $table->id();                                            // clé primaire auto
    $table->foreignId('subject_id')->constrained()->onDelete('cascade'); // lien vers subjects
    $table->string('type')->default('devoir');
    $table->integer('session')->default(1);
    $table->integer('score');
    $table->integer('order_number')->default(1);
    $table->timestamps();                                    // created_at + updated_at
});
```

Points clés :
- `foreignId('subject_id')->constrained()` crée la **clé étrangère** : chaque note est rattachée à une matière.
- `onDelete('cascade')` : si on supprime une matière, **ses notes sont supprimées automatiquement**.
- Les migrations sont **versionnées** : n'importe qui peut recréer la base identique avec une commande.

## 1.7 L'authentification — Sanctum + lien magique

Ce projet utilise une connexion **sans mot de passe** (*passwordless / magic link*). Le déroulé :

```
1. L'utilisateur saisit son email           → POST /auth/magic-link
2. Le backend crée un token aléatoire (15 min) et envoie un EMAIL avec un lien
3. L'utilisateur clique sur le lien          → POST /auth/magic-link/verify
4. Le backend vérifie le token, le supprime, et renvoie un TOKEN Sanctum
5. Le frontend stocke ce token et l'envoie à chaque requête protégée
```

Étape 2-3, dans `PasswordlessAuthController::send` (réel) :

```php
$token = Str::random(64);                          // jeton imprévisible
MagicLinkToken::create([
    'email'      => $email,
    'token'      => $token,
    'expires_at' => now()->addMinutes(15),         // expire dans 15 min
]);
$magicUrl = config('app.frontend_url') . '/magic-link?token=' . $token;
Mail::to($email)->send(new MagicLinkMail($magicUrl, $user->full_name));  // envoi email
```

Étape 4, dans `verify` — on échange le lien contre un **vrai token d'API** :

```php
$token = $user->createToken('magic_link')->plainTextToken;  // ← Sanctum
return response()->json(['token' => $token, 'user' => $user]);
```

Ce `token` Sanctum est la « carte d'accès ». Le frontend devra le présenter (`Authorization: Bearer <token>`) sur chaque route protégée. C'est ce que vérifie `auth:sanctum`.

> 🔐 Le mot de passe n'est jamais utilisé pour se connecter : à l'inscription, on en met un **aléatoire** (`Hash::make(Str::random(32))`) juste pour respecter la structure de la table.

---

# PARTIE 2 — LE FRONTEND EN REACT

## 2.1 C'est quoi React ?

**React** est une bibliothèque JavaScript pour construire des interfaces à partir de **composants** : des morceaux d'UI réutilisables, écrits en **JSX** (du HTML directement dans le JavaScript).

```jsx
// Un composant = une fonction qui retourne du "HTML" (JSX)
function Bonjour() {
  return <h1 className="text-2xl">Bonjour 👋</h1>;
}
```

Un composant peut en contenir d'autres → on assemble l'application comme des **briques Lego**.

## 2.2 Le point de départ — `main.jsx` puis `App.jsx`

Tout commence dans `main.jsx` : React « accroche » l'application à la page HTML.

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />        {/* ← on affiche le composant principal */}
  </StrictMode>,
)
```

`<App />` définit ensuite **les pages et leurs URLs** avec React Router (réel) :

```jsx
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/magic-link" element={<MagicLinkVerify />} />

        {/* Page protégée : il faut être connecté */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

`<Route path="..." element={...} />` = « à cette URL, affiche ce composant ». C'est du **routage côté navigateur** : on change de page **sans recharger** le site.

## 2.3 L'état (state) — la mémoire d'un composant

`useState` permet à un composant de **se souvenir** de valeurs et de se **redessiner** quand elles changent. Exemple réel de `Login.jsx` :

```jsx
const [email, setEmail]     = useState("");      // ce que tape l'utilisateur
const [loading, setLoading] = useState(false);   // un envoi est en cours ?
const [error, setError]     = useState("");      // message d'erreur éventuel
const [sent, setSent]       = useState(false);   // le lien a-t-il été envoyé ?
```

- `email` = la valeur actuelle. `setEmail` = la fonction pour la modifier.
- Dès qu'on appelle `setEmail("...")`, React **réaffiche** le composant avec la nouvelle valeur.

Le champ de saisie est « contrôlé » par cet état :

```jsx
<input
  value={email}                               // affiche la valeur du state
  onChange={(e) => setEmail(e.target.value)}  // met à jour le state à chaque frappe
/>
```

## 2.4 Parler au backend — Axios

`axios` envoie les requêtes HTTP vers l'API Laravel. L'URL de base est centralisée dans `config.js` :

```js
export const BASE_URL = "http://127.0.0.1:8000/api";
```

Envoi du formulaire de connexion (réel, `Login.jsx`) :

```jsx
async function handleSubmit(e) {
  e.preventDefault();                 // empêche le rechargement de la page
  setError("");
  if (!email.trim()) return setError("L'adresse email est requise.");

  try {
    setLoading(true);                 // on affiche le spinner
    await axios.post(`${BASE_URL}/auth/magic-link`, { email: email.trim() });
    setSent(true);                    // succès → écran "vérifiez vos mails"
  } catch (err) {
    // si le backend renvoie une erreur, on récupère son message
    setError(err?.response?.data?.message ?? "Erreur lors de l'envoi.");
  } finally {
    setLoading(false);                // on cache le spinner dans tous les cas
  }
}
```

C'est le **miroir exact** du backend :
- `axios.post(url, { email })` → arrive dans `PasswordlessAuthController::send`.
- `err.response.data.message` → c'est le `response()->json(['message' => ...])` de Laravel.

## 2.5 Affichage conditionnel — montrer le bon écran

Avec l'état `sent`, le composant choisit quoi afficher (du JavaScript pur dans le JSX) :

```jsx
{sent ? (
  <p>Vérifiez votre boîte mail ✉️</p>      // si sent === true
) : (
  <form onSubmit={handleSubmit}> ... </form> // sinon, le formulaire
)}
```

Et le bouton change selon `loading` :

```jsx
<button disabled={loading}>
  {loading ? "Envoi…" : "Envoyer le lien de connexion"}
</button>
```

## 2.6 Protéger une page — `ProtectedRoute`

Une fois connecté, le **token** reçu du backend est rangé dans le `localStorage` du navigateur (une petite mémoire persistante). `ProtectedRoute` vérifie sa présence (réel) :

```jsx
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;   // pas de token → redirige vers l'accueil
  }
  return children;                        // token présent → affiche la page (Admin)
}
```

C'est le **garde du corps** de la page `/admin` : sans token, impossible d'entrer.

---

# PARTIE 3 — VUE D'ENSEMBLE : LES DEUX CÔTÉS ENSEMBLE

Le cycle complet « se connecter puis charger ses données » illustre comment React et Laravel coopèrent :

```
NAVIGATEUR (React)                          SERVEUR (Laravel)
──────────────────                          ─────────────────
1. Login.jsx : saisie email
   axios.post('/auth/magic-link') ───────▶  PasswordlessAuthController::send
                                            → crée token + envoie email
2. clic sur le lien reçu
   /magic-link?token=XXX
   axios.post('/auth/magic-link/verify') ─▶ verify() → renvoie un token Sanctum
   localStorage.setItem('token', ...)  ◀───  { token: "..." }

3. va sur /admin
   ProtectedRoute vérifie le token (OK)
   axios.get('/user-full',
     headers: Authorization Bearer token) ▶ middleware auth:sanctum (vérifie)
                                            → userFull() charge toute la hiérarchie
   Admin.jsx affiche les données       ◀───  { user: { academicYears: [...] } }
```

### Tableau de correspondance frontend ↔ backend

| Action utilisateur | Frontend (React) | Backend (Laravel) | Table BDD |
|---|---|---|---|
| Demander un lien de connexion | `Login.jsx` → `axios.post('/auth/magic-link')` | `PasswordlessAuthController::send` | `magic_link_tokens` |
| Valider le lien | `MagicLinkVerify.jsx` → `verify` | `...::verify` (crée token Sanctum) | `personal_access_tokens` |
| Ajouter une année | formulaire → `axios.post('/add_academic_years')` | `AcademicYearController::add_academic_years` | `academic_years` |
| Charger le tableau de bord | `Admin.jsx` → `axios.get('/user-full')` | `AuthController::userFull` | toutes (jointures) |

---

## 🚀 Pour lancer le projet (rappel)

```bash
# Backend
cd backend && composer install && php artisan migrate && php artisan serve   # :8000

# Frontend (dans un autre terminal)
cd frontend && npm install && npm run dev                                     # :5173
```

Détails complets d'installation dans le [README.md](README.md).

---

## 📖 Glossaire express

| Terme | En une phrase |
|---|---|
| **API REST** | Des URLs qui renvoient des données (JSON) au lieu de pages HTML. |
| **Framework** | Une structure toute prête qui impose une organisation (Laravel, React). |
| **MVC** | Modèle (données) / Vue (affichage) / Contrôleur (logique). |
| **ORM / Eloquent** | Manipuler la base de données avec des objets PHP, sans écrire de SQL. |
| **Migration** | Un fichier qui décrit la structure d'une table, rejouable partout. |
| **Middleware** | Un filtre exécuté avant le contrôleur (ex : vérifier le token). |
| **Token (Sanctum)** | Une « carte d'accès » prouvant qu'on est connecté, envoyée à chaque requête. |
| **Composant (React)** | Un morceau d'interface réutilisable écrit en JSX. |
| **State (`useState`)** | La mémoire d'un composant ; le modifier redessine l'écran. |
| **JSX** | Écrire du HTML directement dans du JavaScript. |
| **Props** | Les « paramètres » qu'un composant parent passe à un composant enfant. |
