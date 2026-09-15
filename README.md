# Jad Besri — Conciergerie Bruxelles

Site vitrine statique (HTML / CSS / JS, sans dépendance ni build).

```
conciergerie-bruxelles/
├── index.html      # page unique
├── css/style.css   # styles (variables de couleurs en tête de fichier)
├── js/main.js      # WhatsApp, quartiers, simulateur, formulaire
└── images/hero.jpg # photo d'accueil (à déposer)
```

## Contact
Tous les boutons ouvrent WhatsApp (+32 495 82 56 94). Le formulaire de contact
compose le message puis ouvre WhatsApp : aucun serveur nécessaire.
Numéro à modifier dans `js/main.js` (`WHATSAPP_NUMBER`).

## Personnaliser
- Photo d'accueil : déposer `images/hero.jpg` (paysage, ≥ 1600 px de large).
- Quartiers, prix/nuit, occupation, loyers : tableau `ZONES` dans `js/main.js`.
- Couleurs / polices : variables `:root` dans `css/style.css`.

## Lancer en local
```bash
ruby -run -e httpd . -p 8000
```
puis ouvrir http://localhost:8000
