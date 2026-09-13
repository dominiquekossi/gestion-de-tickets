# Gestion de tickets

Exercice technique : consulter et créer des tickets. React et TypeScript côté client, Node, Express et TypeScript côté serveur, données en mémoire.

Le périmètre obligatoire est complet. Les éléments facultatifs non réalisés sont décrits plus bas.

## Installation et démarrage

Prérequis : Node 20 ou plus récent.

```bash
npm run setup        # installe les dépendances des deux packages
```

Puis, dans deux terminaux :

```bash
npm run dev:server   # API sur http://localhost:3000
npm run dev:client   # interface sur http://localhost:5173
```

Si le port 5173 est occupé, Vite en choisit un autre et l'affiche au démarrage.

```bash
npm test             # tests serveur et client
npm run typecheck    # types des deux packages
```

## Structure du projet

```
server/src/
  app.ts                  construction de l'application Express
  server.ts               démarrage sur le port 3000
  features/tickets/       types, store, validation, routes, tests
client/src/
  main.tsx                QueryClient et point d'entrée
  App.tsx                 assemblage et états de l'interface
  features/tickets/       types, api, useTickets, TicketForm, TicketList
```

Chaque package est indépendant : ses propres dépendances, son propre `tsconfig`. La racine ne contient que des scripts.

## Contrat d'API

Réponses en JSON. Toute erreur a la même forme : `{ "error": "<message en français>" }`.

| Champ de `Ticket` | Type | Généré par |
|---|---|---|
| `id` | `string` (UUID) | le serveur |
| `title` | `string`, 1 à 200 caractères | le client |
| `status` | `"open"` \| `"closed"` | le serveur (`"open"` à la création) |
| `createdAt` | `string` (ISO 8601) | le serveur |

`GET /api/tickets` : `200` avec un tableau de `Ticket`, éventuellement vide. Aucun paramètre de requête.

`POST /api/tickets` : corps `{ "title": string }`, nettoyé de ses espaces de bord. `201` avec le `Ticket` créé, ou `400` si le titre est absent, vide ou trop long.

Route inconnue : `404`. Erreur inattendue : `500`, via un middleware unique.

## Choix techniques

**Un dépôt, deux packages indépendants, sans workspaces.** Pour deux packages sans code partagé, l'outillage de monorepo coûterait plus qu'il ne rapporterait.

**Organisation par fonctionnalité des deux côtés.** La frontière est le domaine, pas la couche technique : ajouter un domaine ne touche à rien de l'existant.

**Type `Ticket` dupliqué.** Un package partagé imposerait une étape de build pour quelques lignes. Le contrat ci-dessus est la référence commune aux deux copies.

**Validation Zod côté serveur, vérification simple côté client.** Le client empêche l'envoi d'un titre vide par confort. Le serveur valide parce qu'il ne fait jamais confiance au client. En revanche, je ne valide pas la réponse du serveur au runtime : c'est un risque distinct de la validation d'entrée, et c'est là que Zod côté client aurait du sens.

**TanStack Query côté client.** Deux appels seulement, mais une mutation qui doit se refléter dans la liste : c'est le seuil à partir duquel gérer l'état serveur à la main devient du travail répété.

**Cache mis à jour avec `setQueryData`, sans invalidation.** Le `POST` renvoie déjà le ticket construit par le serveur ; le redemander serait redondant.

**Pas de CORS.** Le serveur de développement relaie `/api`, le navigateur reste sur une seule origine. En production, soit le front est servi par la même origine, soit le CORS devient nécessaire côté serveur.

**Stockage en mémoire isolé dans `store.ts`.** Les routes ne connaissent que `list()` et `create()` : le remplacer par une base de données ne toucherait qu'un fichier.

**Les messages d'erreur `4xx` viennent du serveur.** Il est le seul à connaître la règle enfreinte, et la règle et son libellé restent au même endroit. Un modèle à base de codes traduits côté client serait préférable dès qu'il y a plusieurs langues ou plusieurs clients.

## États de l'interface

| État | Comment le déclencher |
|---|---|
| Chargement | Ralentir le réseau (DevTools, Network, Slow 3G) puis recharger. |
| Erreur de chargement | Arrêter le serveur, puis recharger. Le bouton « Réessayer » relance la requête et reste désactivé pendant la nouvelle tentative. |
| Liste vide | Vider le tableau initial dans `server/src/features/tickets/store.ts`. |
| Création en cours | Réseau ralenti, puis soumettre : le bouton se désactive et son libellé change. |
| Échec de création | Soumettre un titre de plus de 200 caractères, ou soumettre serveur arrêté. |

Une `4xx` affiche le message du serveur. Une `5xx`, une réponse illisible ou une requête qui n'aboutit pas affichent un message générique écrit côté client : le texte d'une `5xx` n'est jamais relayé, et aucun code HTTP n'atteint l'utilisateur.

En cas d'échec, le champ conserve sa saisie, et le message disparaît dès que l'utilisateur modifie le titre.

## Tests

Les tests automatisés font partie des éléments facultatifs de l'énoncé. Deux niveaux : des tests d'API sur la validation et les codes HTTP, et un test client sur le parcours de création. Ce dernier vérifie aussi que la liste n'est demandée qu'une seule fois, puisque le cache est mis à jour sans seconde requête.

Un test end-to-end avec Cypress serait la suite logique : il vérifierait l'intégration réelle entre le client et le serveur, ce que le test client, avec son API simulée, ne couvre pas.

## Ce qui n'est pas fait

L'énoncé place la qualité du noyau avant le nombre de fonctionnalités, et c'est la priorité que j'ai suivie.

**Modification du statut.** `PATCH /api/tickets/:id` avec validation du statut et `404` si l'identifiant est inconnu ; côté client, un bouton par ligne et une mise à jour du cache comme pour la création.

**Recherche par titre.** Paramètre de requête sur le `GET`, filtrage dans le store.

**Pagination.** `limit` et `offset`, avec une réponse enveloppée incluant le total. C'est le point où la forme de la réponse change, donc je ne l'ai pas improvisée.

### Améliorations techniques envisagées

**Un test par état de l'interface**, en commençant par une régression sur le
message d'erreur qui doit disparaître dès que l'utilisateur modifie le titre.
C'est le bug que j'ai trouvé en testant à la main, et il mérite un filet.

**Un tri de la liste par date décroissante.** L'énoncé ne le demande pas, mais
au-delà de quelques tickets, un nouvel élément ajouté en fin de liste devient
invisible sans défilement. Le tri se ferait à l'affichage, dans `TicketList`,
sans toucher au cache.

**Une réinitialisation du stockage réservée aux tests**, pour pouvoir affirmer
le contenu exact de la liste plutôt que sa seule taille minimale. Les tests
d'API partagent aujourd'hui le même tableau en mémoire.

**Un chemin de production côté serveur** (compilation puis exécution du
résultat) et un script `lint` à la racine : le linter est configuré côté
client mais n'est atteint par aucune commande documentée.

## Utilisation de l'IA

**Outils utilisés :** Claude (conversation) et Claude Code.

**Tâches :** j'ai fixé les contraintes et tranché les décisions techniques.
Chaque dépendance est un choix qui m'appartient : pour Zod, pour TanStack
Query, et pour la mise à jour du cache par `setQueryData` plutôt que par invalidation, l'assistant a exposé le gain, le coût et les effets de bord de chaque option, et j'ai décidé. C'est à partir de ces décisions et de ces contraintes qu'il a rédigé le `CLAUDE.md`, qui a encadré toute la suite du travail.
Ensuite : implémentation dans le dépôt à partir de décisions déjà arrêtées, tests compris ; revue des différences à chaque étape ; et rédaction d'une partie de ce README.

**Ce que j'ai personnellement vérifié, modifié ou corrigé :**

- J'ai testé les cinq états de l'interface à la main : c'est ainsi que j'ai
  trouvé le message d'erreur de création qui restait affiché après que
  l'utilisateur avait corrigé le champ, et fait corriger.
- J'ai vérifié dans l'onglet réseau qu'aucune requête ne suit la création :
  c'est ce qui valide la mise à jour du cache plutôt qu'une invalidation.
- J'ai relu chaque différence avant chaque commit et retiré ce qui n'avait
  pas été demandé.
- J'ai fait remplacer un `useEffect` qui déduisait le succès d'une création
  d'une transition d'état par un appel explicite, pour supprimer une
  dépendance à l'ordre des rendus de React.
- J'ai refusé `strictPort` côté client : si le port est occupé, Vite doit en
  choisir un autre plutôt que d'échouer chez celui qui clone le dépôt.- J'ai vérifié le contrat d'API cas par cas avec curl : codes de retour,
  forme des réponses et messages d'erreur, y compris le corps JSON malformé
  qui répond 400 et non 500.
- J'ai vérifié qu'un clone neuf s'installe et démarre avec les seules
  instructions du README.

Je suis en mesure d'expliquer l'intégralité du code soumis ainsi que chacun
des choix ci-dessus.

**Répartition du travail**

- Décisions : problème, architecture, compromis, périmètre des tests. Moi.
- Écriture du code : assistance IA, encadrée par le `CLAUDE.md`.
- Vérification manuelle des cinq états, revue de chaque diff, corrections : moi.

Avant d'écrire la moindre ligne de code, j'ai arrêté les décisions d'architecture et je les ai consignées dans un `CLAUDE.md` à la racine. Ce fichier a servi de cadre pendant tout l'exercice : il liste ce qui est décidé et ce qu'il est interdit d'ajouter.

## Temps passé

Environ 3 heures pour l'implémentation, plus le temps consacré en amont aux
décisions d'architecture et, en cours de route, à la vérification manuelle
et à la revue.
