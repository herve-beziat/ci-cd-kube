# Pocketman

Testeur d'API REST léger, style Postman, pour desktop. Entièrement local — aucune donnée ne quitte la machine.

---

## Fonctionnalités

- Envoi de requêtes HTTP (GET, POST, PUT, DELETE, PATCH)
- Headers et body JSON personnalisables
- Affichage de la réponse : status code, headers, body formaté et colorisé, temps de réponse
- Historique automatique des requêtes avec rechargement au clic
- Collections de requêtes nommées et persistantes (ajout, suppression, organisation)
- Mode clair / sombre avec persistance du choix

---

## Stack

| Couche   | Technologie |
|----------|-------------|
| Desktop  | Electron |
| Frontend | HTML / CSS / JavaScript (vanilla) |
| Backend  | Express (serveur local lancé par Electron) |
| Base de données | SQLite via `better-sqlite3` |
| Tests    | Jest |
| CI/CD    | GitHub Actions |

---

## Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- npm v9 ou supérieur

---

## Installation

```bash
git clone https://github.com/herve-beziat/electron-pocketman.git
cd electron-pocketman
npm install
```

---

## Lancer l'application

```bash
npm start
```

Electron démarre, lance un serveur Express local sur un port libre, puis ouvre la fenêtre de l'application. Le serveur s'arrête automatiquement à la fermeture.

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lance l'application Electron |
| `npm test` | Exécute tous les tests Jest |
| `npm run test:unit` | Tests unitaires uniquement |
| `npm run test:integration` | Tests d'intégration uniquement |
| `npm run lint` | Vérifie le style du code |

---

## Structure du projet

```
electron-pocketman/
├── main.js               ← Process principal Electron (fenêtre + démarrage Express)
├── preload.js            ← Expose le port Express au renderer via contextBridge
├── frontend/             ← Interface utilisateur (HTML / CSS / JS vanilla)
├── backend/              ← Serveur Express (routes / controllers / services)
├── db/                   ← Connexion SQLite, migrations, fichier pocketman.db
└── tests/                ← Tests unitaires et d'intégration
```

Le renderer ne communique jamais directement avec SQLite. Il appelle les routes Express via `fetch`, qui délèguent aux controllers, puis aux services — seule couche qui touche la base de données.

---

## Contribuer

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les conventions de commits, la stratégie Git (Gitflow) et le workflow de développement.

---

## Licence

Usage personnel.
