test rapid paralax galaxy
- https://cloudspawn.github.io/landingtest/parallax_galaxy.html
- https://cloudspawn.github.io/landingtest/index.html
- https://cloudspawn.github.io/landingtest/tron.html
- https://cloudspawn.github.io/landingtest/neurones.html
- https://cloudspawn.github.io/landingtest/parallax-galaxy-v2.html
- https://cloudspawn.github.io/landingtest/parallax-galaxy-v3.html
- https://cloudspawn.github.io/landingtest/parallax-galaxy-vf.html


# Parallax Galaxy - Documentation & Prompt Réutilisable

## 🎯 Concept

Un site one-page immersif avec effet parallax spatial. L'utilisateur scrolle à travers des sections plein écran tandis qu'un réseau neuronal/constellation anime l'arrière-plan, créant un sentiment de voyage et de progression.

---

## 🔧 Architecture Technique

### 1. Structure des Couches (Z-Index)

```
┌─────────────────────────────────────┐
│  Navigation fixe (z: 1000)          │
├─────────────────────────────────────┤
│  Contenu des sections (z: 5)        │
├─────────────────────────────────────┤
│  Canvas réseau neural (z: 1)        │
├─────────────────────────────────────┤
│  Étoiles proches (z: -1)            │
│  Étoiles moyennes (z: -1)           │
│  Étoiles lointaines (z: -1)         │
│  Nébuleuse (z: -2)                  │
│  Fond dégradé (z: -2)               │
└─────────────────────────────────────┘
```

### 2. Système Parallax Multi-Couches

**3 couches d'étoiles** avec des vitesses différentes :
- **Far (lointain)** : bouge lentement (×0.15 du scroll)
- **Mid (moyen)** : vitesse moyenne (×0.3 du scroll)
- **Near (proche)** : bouge vite (×0.5 du scroll)

Chaque couche réagit aussi à la souris pour un effet de profondeur.

### 3. Réseau Neural / Constellation

**Chemin principal** : Nœuds positionnés de manière non-linéaire (pas en ligne droite) pour créer un parcours "serpentant" à travers les sections.

**Filaments tremblants** : Courbes de Bézier avec oscillation sinusoïdale multi-fréquence :
```javascript
trembleX = sin(time * 3 + t * 8) * 2 + sin(time * 5 + t * 12) * 1
trembleY = cos(time * 2.5 + t * 6) * 1.5 + cos(time * 4 + t * 10) * 0.8
```

**Constellations de fond** : Groupes de nœuds sur les côtés, connectés entre eux, suggérant des "chemins non pris".

### 4. Système de Scroll

- `scroll-snap-type: y mandatory` pour accrocher chaque section
- Le réseau neural se décale verticalement avec le scroll
- Les éléments de contenu apparaissent progressivement (reveal on scroll)

---

## 📐 Paramètres Clés à Ajuster

| Paramètre | Valeur par défaut | Description |
|-----------|-------------------|-------------|
| `mainNodes[].x` | 0.3-0.6 | Position horizontale des nœuds (0=gauche, 1=droite) |
| `mainNodes[].section` | 0.5, 1.5, 2.5... | Position verticale (1 = 1 section) |
| Opacité filaments | 0.15-0.18 | Transparence des connexions principales |
| Opacité constellations | 0.3-0.6 | Visibilité des chemins alternatifs |
| Tremblement | ×2, ×1 | Amplitude de l'oscillation |

---

## 🎨 Palette de Couleurs

```css
--cyan: #00d4ff      /* Accent principal, filaments */
--purple: #7b2ff7    /* Accent secondaire, halos */
--dark: #050510      /* Fond */
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.7)
```

---

## 📝 PROMPT RÉUTILISABLE

Copie ce prompt et remplace les `[PLACEHOLDERS]` par ton contenu :

---

```
Crée un site web one-page immersif avec effet parallax spatial et réseau neuronal animé.

## STYLE VISUEL
- Thème : espace/cosmos sombre avec nébuleuses subtiles
- Palette : fond très sombre (#050510), accents cyan (#00d4ff) et violet (#7b2ff7)
- Typographie : serif élégante pour les titres (style Cormorant Garamond), sans-serif légère pour le corps (style Outfit)
- Ambiance : sobre, élégante, immersive

## STRUCTURE
- Navigation fixe en haut avec logo et liens
- Sections plein écran avec scroll-snap
- Bouton d'action circulaire en fin de parcours

## SECTIONS (à personnaliser)

### Hero (Section 0)
- Titre principal : [TITRE_HERO]
- Sous-titre : [SOUS_TITRE_HERO]

### Section 1
- Titre : [TITRE_SECTION_1]
- Paragraphe 1 : [TEXTE_1_SECTION_1]
- Paragraphe 2 : [TEXTE_2_SECTION_1]

### Section 2
- Titre : [TITRE_SECTION_2]
- Paragraphe 1 : [TEXTE_1_SECTION_2]
- Paragraphe 2 : [TEXTE_2_SECTION_2]

### Section 3
- Titre : [TITRE_SECTION_3]
- Paragraphe 1 : [TEXTE_1_SECTION_3]
- Paragraphe 2 : [TEXTE_2_SECTION_3]

### Section 4
- Titre : [TITRE_SECTION_4]
- Paragraphe 1 : [TEXTE_1_SECTION_4]
- Paragraphe 2 : [TEXTE_2_SECTION_4]

### Section Finale
- Titre : [TITRE_FINAL]
- Texte : [TEXTE_FINAL]
- Bouton : [TEXTE_BOUTON]

## EFFETS PARALLAX

### Fond étoilé (3 couches)
- Couche lointaine : petites étoiles, mouvement lent
- Couche moyenne : étoiles moyennes, mouvement modéré
- Couche proche : grosses étoiles, mouvement rapide
- Certaines étoiles scintillent (animation twinkle)
- Réaction à la souris pour effet de profondeur

### Réseau neural / Constellation
- Un filament principal qui serpente de section en section (pas en ligne droite)
- Position des nœuds principaux alternant gauche/droite de manière irrégulière
- Filaments tremblants (oscillation subtile multi-fréquence)
- Opacité faible (0.15-0.20) pour rester discret
- Le filament se termine par un point pulsant au-dessus du bouton final

### Constellations de fond (chemins alternatifs)
- Groupes de 3-5 nœuds positionnés sur les côtés de chaque section
- Connexions visibles entre les nœuds d'un même groupe
- Suggère visuellement d'autres chemins possibles
- Plus discret que le filament principal mais visible

## ANIMATIONS
- Hero : révélation du titre avec fadeUp décalé
- Sections : contenu apparaît au scroll (opacity + translateX/Y)
- Navigation : apparaît après l'animation hero
- Bouton final : apparaît avec scale quand la section est visible
- Tout le réseau neural : animation permanente (oscillation, scintillement)

## RESPONSIVE
- Menu burger sur mobile
- Tailles de police adaptatives (clamp)
- Réduction du nombre de nœuds sur mobile pour performance

## TECHNIQUE
- HTML/CSS/JS vanilla (pas de framework)
- Canvas 2D pour le réseau neural
- requestAnimationFrame pour les animations fluides
- scroll-snap pour la navigation entre sections
```

---

## 💡 EXEMPLE D'UTILISATION

```
### Section 1
- Titre : Notre Histoire
- Paragraphe 1 : Fondée en 2020, notre entreprise est née d'une passion commune pour l'innovation digitale et l'excellence créative.
- Paragraphe 2 : Depuis, nous accompagnons des marques ambitieuses dans leur transformation numérique.

### Section 2
- Titre : Nos Services
- Paragraphe 1 : Du design UI/UX au développement full-stack, nous offrons une gamme complète de services digitaux.
- Paragraphe 2 : Chaque projet est une opportunité de repousser les limites du possible.

### Section 3
- Titre : Notre Approche
- Paragraphe 1 : Nous croyons en une collaboration étroite avec nos clients, basée sur la transparence et l'écoute.
- Paragraphe 2 : Votre vision devient notre mission.

### Section 4
- Titre : Contactez-nous
- Paragraphe 1 : Prêt à donner vie à votre projet ? Notre équipe est à votre écoute.
- Paragraphe 2 : Ensemble, créons quelque chose d'extraordinaire.

### Section Finale
- Titre : Commençons l'aventure
- Texte : Votre projet mérite le meilleur.
- Bouton : Démarrer
```

---

## 📁 Fichiers de Référence

Le fichier `parallax-galaxy-vf.html` contient l'implémentation complète et fonctionnelle que tu peux utiliser comme base.

---

## ⚠️ Points d'Attention

1. **Performance** : Sur mobile, réduire le nombre de nœuds et constellations
2. **Accessibilité** : Respecter `prefers-reduced-motion` pour désactiver les animations
3. **Lisibilité** : Le contenu texte doit toujours rester prioritaire sur les effets
4. **Équilibre** : Les constellations de fond doivent être visibles mais pas distrayantes
