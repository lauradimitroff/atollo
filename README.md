# Atollo

Dashboard d'analytics web multi-sites — Vue 3, TypeScript, Pinia, Tailwind CSS.

> Projet en cours de construction, étape par étape.

## Prérequis

- Node.js 24 (`nvm use` lit le fichier `.nvmrc`)

## Commandes

| Commande             | Rôle                                             |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Serveur de développement (http://localhost:5173) |
| `npm run build`      | Vérification des types + build de production     |
| `npm run preview`    | Sert le build de production localement           |
| `npm run type-check` | Vérification TypeScript (vue-tsc)                |
| `npm run lint`       | Oxlint puis ESLint, avec correction automatique  |
| `npm run format`     | Formatage Prettier (classes Tailwind triées)     |
| `npm test`           | Tests unitaires (Vitest, une passe)              |
| `npm run test:unit`  | Tests unitaires en mode watch                    |
| `npm run test:e2e`   | Tests end-to-end (Playwright)                    |

## Conventions

- Les tests unitaires sont placés à côté du fichier testé : `Foo.vue` → `Foo.spec.ts`.
- Les tests end-to-end sont dans `e2e/`.
- L'alias `@/` pointe vers `src/`.
- Les dossiers (`features/`, `shared/`, `layouts/`…) sont créés au fil des étapes, quand ils reçoivent leur premier fichier.
