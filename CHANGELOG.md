# Changelog

## [1.0.3] — 2026-05-18

### Corrections

- Base de données SQLite stockée dans `~/.config/pocketman/` au lieu du répertoire de l'AppImage (lecture seule) — l'app s'ouvre désormais correctement depuis l'AppImage

---

## [1.0.2] — 2026-05-18

### Corrections

- Build CI : désactivation de la publication automatique d'electron-builder (`--publish never`)

---

## [1.0.1] — 2026-05-18

### Corrections

- Pipeline CI/CD : build Electron limité à Linux, checks lint + tests visibles sur les PRs vers `main`
- Actions GitHub mises à jour v4 → v5 (dépréciation Node.js 20)

---

## [1.0.0] — 2026-05-18

Première version stable de Pocketman.

### Fonctionnalités

- **Envoi de requêtes HTTP** — méthodes GET, POST, PUT, DELETE, PATCH avec headers et body JSON personnalisables
- **Affichage de la réponse** — status code colorisé, headers, body formaté, indicateur de temps de réponse en ms
- **Historique** — sauvegarde automatique de chaque requête, rechargement au clic, suppression individuelle ou totale
- **Collections** — sauvegarde manuelle de requêtes dans des collections nommées, organisation, ajout et suppression d'items, confirmation avant suppression d'une collection
- **Mode clair / sombre** — toggle persistant entre les deux thèmes

### Infrastructure

- Serveur Express local lancé et arrêté par Electron
- Persistance SQLite via `better-sqlite3` — aucune donnée ne quitte la machine
- 96 tests Jest (unitaires + intégration), couverture > 80 %
- Pipeline GitHub Actions (lint + tests sur chaque PR)
