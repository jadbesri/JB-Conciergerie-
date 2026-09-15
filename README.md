# Maison Ambre — Site vitrine conciergerie Bruxelles

Site statique (HTML / CSS / JS vanilla, aucune dépendance ni étape de build).

```
conciergerie-bruxelles/
├── index.html      # Structure de la page (header, hero, services, zones, simulateur, tarifs, contact, footer)
├── css/style.css   # Styles mobile-first, variables de thème en tête de fichier
└── js/main.js      # Données quartiers, simulateur, menu, onglets, validation formulaire
```

## Lancer en local
Ouvrez simplement `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000
```

## Personnaliser
- **Couleurs / polices** : variables `:root` en haut de `css/style.css`.
- **Quartiers, prix / nuit, occupation, loyers** : tableau `ZONES` en haut de `js/main.js`.
- **Modèle du simulateur** (commission, multiplicateurs, calibration) : objet `MODEL` dans `js/main.js`.
- **Envoi du formulaire de contact** : remplacer le bloc `setTimeout` (section 8 de `js/main.js`) par un appel `fetch` vers Formspree, Netlify Forms ou votre API.
- **Coordonnées / mentions légales** : sections `#contact` et `<footer>` dans `index.html`.

## Déploiement
Dossier statique : déposable tel quel sur Netlify, Vercel, GitHub Pages, OVH, Combell, etc.
