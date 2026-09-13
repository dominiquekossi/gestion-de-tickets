# Règles du projet

Exercice technique. Budget : 3 heures. La simplicité est un objectif explicite,
pas une contrainte subie.

Ce fichier fixe les décisions d'architecture avant l'écriture du code. Il sert de
cadre à l'assistant : les décisions viennent du développeur, l'assistant les applique.

## Décisions d'architecture (à respecter, ne pas « améliorer »)

- Un dépôt, deux packages indépendants : `server/` et `client/`. Pas de workspaces npm.
- Le `package.json` racine ne contient que des scripts, aucune dépendance.
- Organisation par fonctionnalité des deux côtés : `src/features/tickets/`.
- Pas de dossier `shared/`, `lib/` ou `utils/`. Pas de fichiers `index.ts` de réexport.
- Le type `Ticket` est volontairement dupliqué dans les deux packages.
- **Validation serveur avec Zod.** C'est la seule validation qui fait autorité :
  le serveur ne fait jamais confiance au client.
- **Côté client, pas de Zod.** Une vérification inline suffit pour empêcher
  l'envoi d'un titre vide. C'est de l'ergonomie, pas de la sécurité.
- **État serveur côté client : TanStack Query.** Pas de Redux, pas de SWR,
  pas de librairie d'état supplémentaire.
- **Après création, le cache est mis à jour avec `setQueryData`**, pas invalidé :
  le `POST` renvoie déjà le ticket créé par le serveur, une seconde requête
  serait inutile.
- **Pas de CORS : le serveur de développement Vite fait proxy de `/api`**
  vers le serveur Express. Le navigateur reste sur une seule origine.
  Ne pas installer `cors`.
- Serveur sur le port 3000, client sur le port 5173.
- `app.ts` construit l'application, `server.ts` l'écoute. Deux fichiers distincts.
- Stockage en mémoire dans un seul module `store.ts`. Pas d'interface de dépôt,
  pas de couche service, pas d'injection de dépendances.
- Aucune librairie d'interface ni framework CSS. CSS simple et minimal :
  l'énoncé précise que le design visuel n'est pas évalué.
- Tests placés à côté du code qu'ils couvrent.

## Contrat d'API

- `GET /api/tickets` : 200, tableau de `Ticket` (éventuellement vide).
- `POST /api/tickets` : corps `{ title }`, 201 avec le `Ticket` créé,
  ou 400 en cas de titre invalide.
- Toute réponse d'erreur a la même forme : `{ error: string }`,
  message en français destiné à l'utilisateur.
- `Ticket` : `id` (uuid), `title`, `status` (`open` | `closed`),
  `createdAt` (ISO 8601). Les trois derniers sont générés par le serveur.

## Conventions

- Code et identifiants **en anglais**.
- Commentaires **en français** : ils s'adressent à l'équipe, pas au compilateur.
- Textes visibles par l'utilisateur **en français**.
- Messages de commit **en anglais**, selon la convention Conventional Commits.
- Commits conventionnels. Aucun attribut d'IA dans les messages de commit.
- Commentaires uniquement là où le code ne peut pas se suffire. Pas de bannières
  de section, pas de JSDoc sur des fonctions évidentes.

## Périmètre

Uniquement ce que la demande en cours réclame. Ne jamais ajouter une
fonctionnalité, une route, une dépendance, un fichier de configuration ou une
abstraction qui n'a pas été demandée, même si elle paraît utile.
S'il manque quelque chose, le signaler au lieu de l'ajouter.