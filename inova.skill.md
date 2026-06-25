# INOVA UI Guidelines

## Philosophie

Construire des interfaces **professionnelles, sobres et maintenables** qui ressemblent à un vrai produit — pas à un site généré par une IA.

> **Règle d'or** : avant d'ajouter quoi que ce soit, demande-toi si ça améliore vraiment l'expérience utilisateur ou la lisibilité. Si non — ne l'ajoute pas.

---

## Ce qu'on évite absolument

Ces patterns trahissent immédiatement une interface "IA-friendly". Ils sont **interdits**.

### Couleurs et effets

```html
<!-- INTERDIT -->
bg-gradient-to-r / bg-gradient-to-l / bg-gradient-to-b
shadow-xl / shadow-2xl
ring-4 ring-purple-300
```

- Pas de dégradés
- Pas d'ombres agressives
- Pas de glows ou halos colorés
- Pas de couleurs multiples (une seule couleur d'accent : le vert)

### Typographie

```html
<!-- INTERDIT -->
font-extrabold sur du texte courant
text-4xl pour des labels
uppercase partout
tracking-widest sur les titres principaux
```

- Pas de texte en majuscules systématiques
- Pas de titres disproportionnés
- Pas de letter-spacing excessif

### Layout et composants

- Pas de cartes avec 3 niveaux d'ombre imbriqués
- Pas d'icônes décoratives à chaque ligne
- Pas de badges colorés pour tout et n'importe quoi
- Pas de grilles asymétriques "artistiques"
- Pas d'animations au scroll ou au hover inutiles

---

## Palette

| Usage | Classe Tailwind |
|---|---|
| Fond principal | `bg-gray-50` ou `bg-white` |
| Texte principal | `text-gray-900` |
| Texte secondaire | `text-gray-600` |
| Texte tertiaire | `text-gray-400` |
| Bordures | `border-gray-200` |
| Accent (vert) | `green-600` |

**Le vert est la seule couleur d'accent.** Il sert à signaler : validation, succès, confirmation, action principale.

---

## Typographie

```html
<!-- Titre de page -->
text-2xl font-semibold text-gray-900

<!-- Titre de section -->
text-lg font-medium text-gray-800

<!-- Label / texte courant -->
text-sm text-gray-600

<!-- Texte discret -->
text-xs text-gray-400
```

Pas de `font-bold` systématique. Le contraste vient du poids et de la couleur, pas de la taille.

---

## Composants

### Card

```jsx
<div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
  {/* contenu */}
</div>
```

### Bouton principal

```jsx
<button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black transition">
  Action
</button>
```

### Bouton secondaire

```jsx
<button className="px-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg hover:bg-gray-50 transition">
  Annuler
</button>
```

### Bouton succès

```jsx
<button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
  Confirmer
</button>
```

### Input

```jsx
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-green-500" />
```

### Badge (statut)

```jsx
<!-- Neutre -->
<span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
  Brouillon
</span>

<!-- Succès -->
<span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">
  Actif
</span>

<!-- Erreur -->
<span className="px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-full">
  Erreur
</span>
```

---

## Layout

### Conteneur

```html
max-w-7xl mx-auto px-4
```

### Espacement vertical

```html
space-y-6
```

### Grilles (mobile-first)

```html
grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3
```

---

## Ombres et bordures

**Règle** : toujours préférer les bordures aux ombres.

```html
<!-- OK -->
shadow-sm
hover:shadow-md

<!-- INTERDIT -->
shadow-xl
shadow-2xl
drop-shadow-lg
```

---

## Animations

Utiliser uniquement `transition` sur les éléments interactifs (hover, focus). Pas d'animations d'entrée, pas de keyframes décoratifs.

```html
<!-- OK -->
hover:shadow-md transition
hover:bg-gray-50 transition

<!-- INTERDIT -->
animate-bounce
animate-pulse (sauf skeleton loader)
animate-spin (sauf loading spinner)
```

---

## Résumé

| ✅ Faire | ❌ Ne pas faire |
|---|---|
| `bg-gray-50` / `bg-white` | Dégradés |
| `border border-gray-200` | Ombres agressives |
| `text-gray-900` / `text-gray-600` | Couleurs multiples |
| Vert comme seul accent | Violet, bleu, orange décoratifs |
| `bg-gray-900` pour les boutons | Boutons colorés en arc-en-ciel |
| `transition` sur le hover | Animations au scroll |
| Espaces blancs généreux | Composants surchargés |
| Bordures avant ombres | Icônes partout |

**Objectif** : une interface qu'on croirait sortie d'un vrai studio produit — sobre, rapide à maintenir, agréable à utiliser tous les jours.