# 🎨 Refonte du Design Front-Office

## Vue d'ensemble

Le front-office de **RateMyD** a été entièrement refondu avec un design minimaliste, moderne et épuré. Le thème clair (blanc) est maintenant le thème par défaut, avec la possibilité de basculer vers le mode sombre.

---

## 🌟 Changements principaux

### 1. **Système de thème clair/sombre**
- **Mode clair par défaut** : Fond blanc pur (#FFFFFF) avec textes sombres
- **Toggle de thème** : Bouton Sun/Moon dans la Navbar pour basculer entre les thèmes
- **Persistance** : Le choix de thème est sauvegardé dans le localStorage
- **Transitions fluides** : Animations douces de 200ms lors du changement de thème

**Fichiers modifiés :**
- `/src/contexts/ThemeContext.tsx` - Context React pour la gestion du thème
- `/src/components/shared/ThemeToggle.tsx` - Composant de toggle
- `/src/app/providers.tsx` - Intégration du ThemeProvider
- `/src/app/layout.tsx` - Configuration HTML avec classe light par défaut

### 2. **Nouvelle palette de couleurs**
Passage de **pourpre/rose** à **bleu moderne** :

| Élément | Couleur claire | Couleur sombre |
|---------|---------------|----------------|
| **Primaire** | Bleu #3B82F6 | Bleu #3B82F6 |
| **Fond** | Blanc #FFFFFF | Gris #030712 |
| **Texte** | Gris #111827 | Blanc #F9FAFB |
| **Bordures** | Gris #E5E7EB | Gris #374151 |
| **Succès** | Vert #10B981 | Vert #10B981 |
| **Danger** | Rouge #EF4444 | Rouge #EF4444 |

**Fichier modifié :**
- `/src/app/globals.css` - Variables CSS pour les deux thèmes

### 3. **Configuration Tailwind CSS**
Nouveau fichier de configuration avec :
- Palette bleue étendue (primary-50 à primary-950)
- Ombres douces personnalisées (soft, soft-lg, blue, blue-lg)
- Animations personnalisées (fade-in, slide-in, slide-up, scale-in)
- Support du mode sombre via la classe `dark`

**Fichier créé :**
- `/tailwind.config.ts`

### 4. **Composants UI refondus**

#### **Button** ([src/components/ui/Button.tsx](src/components/ui/Button.tsx))
- Variante `primary` : Bleu #3B82F6 avec ombres douces
- Variante `outline` : Bordures adaptées au thème (gris clair/sombre)
- Variante `ghost` : Hover subtil avec fond gris
- Tous les boutons ont des états actifs et focus améliorés

#### **Card** ([src/components/ui/Card.tsx](src/components/ui/Card.tsx))
- Fond blanc en mode clair, gris foncé en mode sombre
- Bordures subtiles adaptées au thème
- Effet hover avec élévation et ombre bleue
- Padding augmenté pour plus de respiration (p-6 par défaut)

#### **Badge** ([src/components/ui/Badge.tsx](src/components/ui/Badge.tsx))
- Couleurs adaptées au mode clair (backgrounds clairs, textes foncés)
- Bordures subtiles en mode clair
- Variante `primary` en bleu au lieu de pourpre

### 5. **Navbar** ([src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx))
**Changements :**
- Fond blanc transparent (95%) avec backdrop blur
- Ombre légère pour le depth
- Logo avec gradient bleu
- Liens avec hover bleu
- Avatar utilisateur avec gradient bleu
- Menu dropdown avec fond blanc/sombre adaptatif
- Ajout du ThemeToggle dans la navbar

### 6. **Footer** ([src/components/layout/Footer.tsx](src/components/layout/Footer.tsx))
**Changements :**
- Fond gris clair (#F9FAFB) en mode clair
- Textes gris foncés avec hover bleu
- Espacement augmenté (py-12)
- Logo avec gradient bleu

### 7. **Page d'accueil** ([src/app/page.tsx](src/app/page.tsx))
**Sections refondues :**

#### **Hero Section**
- Titre avec gradient bleu
- Sous-titre gris foncé en mode clair
- Boutons mis à jour avec la nouvelle variante

#### **Features Section**
- Fond gris clair (#F9FAFB) en mode clair
- Cards blanches avec ombres douces
- Icônes bleues avec fond bleu clair
- Textes adaptés au thème

#### **Categories Section**
- Cards avec gradients colorés en mode clair (bleu-50, pink-50, amber-50)
- Bordures colorées subtiles
- Icônes colorées adaptées

#### **Pricing Section**
- Fond gris clair en mode clair
- Plan populaire avec gradient bleu et badge bleu
- Cards blanches avec ombres
- Checkmarks verts

#### **CTA Section**
- Textes adaptés au thème
- Bouton bleu principal

---

## 📁 Structure des fichiers

```
/src
├── /contexts
│   └── ThemeContext.tsx          [NOUVEAU]
├── /components
│   ├── /shared
│   │   └── ThemeToggle.tsx       [NOUVEAU]
│   ├── /layout
│   │   ├── Navbar.tsx            [MODIFIÉ]
│   │   └── Footer.tsx            [MODIFIÉ]
│   └── /ui
│       ├── Button.tsx            [MODIFIÉ]
│       ├── Card.tsx              [MODIFIÉ]
│       └── Badge.tsx             [MODIFIÉ]
├── /app
│   ├── layout.tsx                [MODIFIÉ]
│   ├── page.tsx                  [MODIFIÉ]
│   ├── providers.tsx             [MODIFIÉ]
│   └── globals.css               [MODIFIÉ]
└── tailwind.config.ts            [NOUVEAU]
```

---

## 🎯 Prochaines étapes recommandées

### Pages à adapter au nouveau design :

1. **Page Compare** ([/src/app/(main)/compare/page.tsx](src/app/(main)/compare/page.tsx))
   - Adapter les cards de photos
   - Mettre à jour les boutons de vote
   - Adapter les filtres de catégories

2. **Pages Leaderboard** ([/src/app/(main)/leaderboard/](src/app/(main)/leaderboard/))
   - Refondre les tables de classement
   - Adapter les badges de classement
   - Mettre à jour les filtres

3. **Pages Profile** ([/src/app/(main)/profile/](src/app/(main)/profile/))
   - Adapter les cards de statistiques
   - Refondre les pages photos, stats, settings
   - Mettre à jour les formulaires

4. **Pages Auth** ([/src/app/(auth)/](src/app/(auth)/))
   - Refondre les formulaires de login/register
   - Adapter les messages d'erreur
   - Mettre à jour les boutons

5. **Admin Panel** ([/src/app/admin/](src/app/admin/))
   - Garder le design actuel (admin distinct du front-office)
   - Ou adapter si nécessaire

---

## 🔧 Utilisation du système de thème

### Dans un composant client :

```tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Thème actuel : {theme}</p>
      <button onClick={toggleTheme}>
        Changer de thème
      </button>
    </div>
  );
}
```

### Classes Tailwind adaptatives :

```tsx
// Utiliser dark: pour le mode sombre
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Contenu adaptatif
</div>
```

---

## 🎨 Classes CSS personnalisées

| Classe | Description |
|--------|-------------|
| `.gradient-text` | Texte avec gradient bleu (remplace pourpre/rose) |
| `.focus-ring` | Anneau de focus bleu adaptatif |
| `.card-hover` | Effet hover avec élévation et ombre |
| `.glass` | Effet glassmorphisme adaptatif |
| `.animate-fadeIn` | Animation d'apparition en fondu |
| `.animate-slideIn` | Animation de glissement depuis la gauche |
| `.animate-slideUp` | Animation de glissement depuis le bas |

---

## ✅ Checklist de compatibilité

- ✅ Mode clair par défaut
- ✅ Mode sombre fonctionnel
- ✅ Toggle de thème dans la navbar
- ✅ Persistance du choix de thème
- ✅ Transitions fluides
- ✅ Accessibilité (contraste suffisant)
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Composants UI refondus
- ✅ Page d'accueil refondre
- ⏳ Pages internes à adapter

---

## 🚀 Pour tester

1. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrir [http://localhost:3000](http://localhost:3000)

3. Tester le toggle de thème dans la navbar (icône Sun/Moon)

4. Vérifier que le thème persiste après rechargement de la page

---

## 📸 Aperçu des changements

### Avant (Design sombre pourpre/rose)
- Fond noir par défaut
- Couleurs pourpre et rose
- Design sombre uniquement

### Après (Design blanc minimaliste bleu)
- Fond blanc par défaut
- Couleurs bleues modernes
- Mode sombre disponible
- Design épuré et propre
- Espaces généreux
- Ombres douces

---

**Date de refonte :** 2026-01-15
**Design system :** Minimaliste épuré avec accents bleus
**Thème par défaut :** Clair (blanc)
