# Gitflow et Bonnes Pratiques de Commits

Ce document décrit une organisation Git simple et efficace (Gitflow simplifié), ainsi que les bonnes pratiques pour rédiger des commits clairs et professionnels sur GitHub.

---

## 1. Principes généraux

- Une branche = un objectif clair
- Un commit = une seule idée
- Pas de commit massif "tout-en-un"
- Toujours passer par des Pull Requests (PR)
- Historique lisible et maintenable dans le temps

---

## 2. Branches principales (Protégées)

### `main`

- Branche **stable**
- Contient uniquement du code prêt pour la production
- Aucun commit direct
- Mise à jour uniquement via Pull Request
- **Protection GitHub activée** — merge bloqué sans PR + CI/CD vert

### `develop`

- Branche principale de développement
- Toutes les fonctionnalités y sont fusionnées
- Peut être instable temporairement

> Les commits directs sur `main` et `develop` sont **interdits**.  
> Toute modification doit passer par une Pull Request.

---

## 3. Branches temporaires

| Type    | Convention de nommage        | Usage                                                              |
|---------|------------------------------|--------------------------------------------------------------------|
| Feature | `feature/nom-fonctionnalite` | Nouvelle fonctionnalité — créées depuis `develop`                  |
| Bugfix  | `bugfix/nom-du-bug`          | Correction de bug                                                  |
| Release | `release/x.y.z`              | Préparation d'une release — fusionnées dans `main` et `develop`    |
| Hotfix  | `hotfix/urgent`              | Correctif rapide en production — créées depuis `main`              |

**Règles :**

- Une branche = une seule fonctionnalité ou correction
- La branche est supprimée après le merge

---

## 4. Convention de commits (Conventional Commits)

### Principe

Le projet utilise la convention **Conventional Commits** afin de garantir :

- un historique lisible
- une compréhension rapide des changements
- une meilleure collaboration (même en solo)

Chaque message de commit doit décrire **clairement l'intention du changement**.

### Format

```
type(scope): description courte à l'infinitif
```

- **`type`** : nature du changement
- **`scope`** *(optionnel)* : partie concernée du projet
- **`description`** : action claire et concise

### Types courants

| Type       | Usage                                               |
|------------|-----------------------------------------------------|
| `feat`     | Ajout d'une nouvelle fonctionnalité                 |
| `fix`      | Correction de bug                                   |
| `chore`    | Configuration, infrastructure, outillage            |
| `docs`     | Documentation                                       |
| `test`     | Ajout ou modification de tests                      |
| `refactor` | Amélioration du code sans changement fonctionnel    |
| `style`    | Mise en forme, indentation (pas de logique)         |

### Scopes du projet Pocketman

| Scope         | Usage                                              |
|---------------|----------------------------------------------------|
| `electron`    | Configuration Electron (main, preload, fenêtre)    |
| `frontend`    | Interface utilisateur, layout, style               |
| `request`     | Envoi et gestion des requêtes HTTP                 |
| `response`    | Affichage et formatage de la réponse               |
| `history`     | Historique des requêtes                            |
| `collections` | Sauvegarde et gestion des collections              |
| `backend`     | Serveur Express, routes, controllers, services     |
| `db`          | SQLite, migrations, connexion                      |
| `ipc`         | Communication main ↔ renderer via contextBridge    |
| `ci`          | Pipeline GitHub Actions                            |
| `test`        | Tests unitaires et d'intégration                   |
| `docs`        | Documentation                                      |

### Exemples

```bash
chore(electron): initialize electron project structure
chore(db): setup sqlite connection and run migrations
feat(backend): create express server with base routes
feat(request): build request form UI with method selector
feat(history): save and display request history in sidebar
feat(collections): implement collection CRUD via express api
fix(response): handle non-JSON response body gracefully
test(history): add unit tests for history service
docs(readme): add installation and usage instructions
```

> Les messages vagues comme `update`, `test`, `wip` ou `fix bug` sont à éviter.

---

## 5. Règle des ~5 commits par branche feature

### Objectif

Lorsqu'une fonctionnalité est suffisamment technique ou structurante, elle doit être découpée en plusieurs commits afin de :

- structurer le développement par étapes
- faciliter la revue de code
- permettre un revert simple
- conserver un historique propre et compréhensible

L'objectif est de viser **environ 5 commits par branche feature**, chacun correspondant à une étape logique.

### Exemple — branche `feature/collections`

```bash
chore(collections): initialize collections routes and files
feat(collections): create collections table migration
feat(collections): implement collections service and controller
feat(collections): build collections UI in sidebar
test(collections): add integration tests for collections api
```

Chaque commit représente **une intention unique et cohérente**.

> Cette règle n'est pas stricte. Pour des changements simples ou purement documentaires, un nombre réduit de commits peut être plus pertinent.

---

## 6. Workflow Gitflow concret

### Initialisation

```bash
git init
git checkout -b main
git commit -m "chore: initial commit"
git checkout -b develop
git push -u origin develop
```

### Exemple de commits sur une branche feature

```bash
# Créer la branche depuis develop
git checkout develop
git checkout -b feature/collections

git add .
git commit -m "chore(collections): initialize collections routes and files"

git add .
git commit -m "feat(collections): create collections table migration"

git add .
git commit -m "feat(collections): implement collections service and controller"

git add .
git commit -m "feat(collections): build collections UI in sidebar"

git add .
git commit -m "test(collections): add integration tests for collections api"

# Ouvrir une Pull Request vers develop sur GitHub
```

---

## 7. Pipeline CI/CD

Le pipeline GitHub Actions s'exécute automatiquement et conditionne les merges.

| Déclencheur        | Actions                                              |
|--------------------|------------------------------------------------------|
| PR vers `develop`  | Lint + tests unitaires + tests d'intégration         |
| Merge sur `main`   | Lint + tous les tests + build Electron (package)     |

> Un CI/CD rouge bloque le merge. Ne jamais forcer un merge avec des tests en échec.

---

## 8. Récapitulatif

| Branche      | Rôle                        |
|--------------|-----------------------------|
| `main`       | Production                  |
| `develop`    | Développement               |
| `feature/*`  | Nouvelles fonctionnalités   |
| `bugfix/*`   | Corrections de bugs         |
| `hotfix/*`   | Correctifs urgents en prod  |
| `release/*`  | Préparation de release      |

**À retenir :**

- Commits petits, clairs et typés
- ~5 commits par fonctionnalité
- Pull Requests obligatoires
- CI/CD vert avant tout merge

---

## 9. Bonnes habitudes

- Tester avant de commiter
- Relire ses messages de commit
- Ne jamais commiter du code cassé
- Préférer plusieurs petits commits à un gros
- Fermer les issues GitHub avec les commits (`closes #N`)
