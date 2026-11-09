# Atollo

Dashboard d'analytics web multi-sites, pensé pour les freelances et les agences qui suivent plusieurs sites clients. Interface sobre, statistiques lisibles, respect de la vie privée.

> Projet personnel de portfolio, construit étape par étape. Toutes les données affichées sont **fictives** (voir [Données de démonstration](#données-de-démonstration)).

## Fonctionnalités

- **Vue multi-sites** (page d'accueil) : tous les sites sur la même période, avec visiteurs, évolution et mini-graphique de tendance.
- **Vue d'ensemble** d'un site : visiteurs uniques, visites, pages vues, taux de rebond et durée moyenne, avec l'évolution par rapport à la période précédente.
- **Graphique d'évolution** superposé à la période de comparaison, pour la métrique choisie.
- **Répartitions** : sources (canaux, référents, campagnes), pages (populaires, entrées, sorties), pays et villes, appareils, navigateurs et systèmes.
- **Filtres croisés** : un clic sur une ligne (« Recherche organique », « Mobile »…) filtre tout le tableau de bord.
- **État dans l'URL** : période, métrique et filtres se partagent par simple lien et suivent le bouton retour.
- **Périodes** : aujourd'hui, 7, 30 ou 90 jours, 12 mois (comparés à l'année précédente) ou période personnalisée via un calendrier.
- Thème clair, sombre ou système, interface responsive et navigable au clavier, états de chargement, vides et d'erreur.

## Stack technique

Vue 3 (Composition API) · TypeScript strict · Vite · Vue Router · Pinia · Tailwind CSS v4 · Reka UI · Apache ECharts · VueUse · date-fns · Vitest · Playwright

## Données de démonstration

Les statistiques sont calculées à partir de visites **générées** : un générateur déterministe produit, jour par jour, des visites réalistes (croissance, week-ends, heures de pointe, sources, appareils…). Aucune donnée réelle n'est collectée ni affichée.

Les huit sites de démonstration (Atelier Nord, Studio Brume, La Mie Céleste, Vélo Comète, Les Jardins de Sorbe, Yoga Lumen, Ostrea Avocats, Maison Tilleul) sont **des entreprises imaginaires**, chacune avec son propre profil d'audience. Leurs adresses utilisent le domaine réservé `.example` ([RFC 2606](https://www.rfc-editor.org/rfc/rfc2606)), qui ne peut appartenir à personne. Les grandes plateformes citées comme sources de trafic (moteurs de recherche, réseaux sociaux…) le sont uniquement à titre d'exemple.

## Démarrer

Prérequis : Node.js 24 (`nvm use` lit le fichier `.nvmrc`).

```bash
npm install
npm run dev
```

L'application est disponible sur http://localhost:5173.

| Commande             | Rôle                                            |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Serveur de développement                        |
| `npm run build`      | Vérification des types + build de production    |
| `npm run preview`    | Sert le build de production localement          |
| `npm run type-check` | Vérification TypeScript (vue-tsc)               |
| `npm run lint`       | Oxlint puis ESLint, avec correction automatique |
| `npm run format`     | Formatage Prettier                              |
| `npm test`           | Tests unitaires (Vitest)                        |
| `npm run test:e2e`   | Tests de bout en bout (Playwright, port 5191)   |

## Organisation du code

```
src/
├─ features/          un dossier par domaine fonctionnel
│  ├─ analytics/      calculs, période, filtres, accès aux données, vues
│  ├─ sites/          sites suivis et changement de site
│  └─ settings/       paramètres
├─ shared/            composants d'interface, graphiques, utilitaires
├─ layouts/           structure de l'application (barre latérale, barre du haut)
└─ router/            routes
```

- Les tests unitaires sont placés à côté du fichier testé (`Foo.vue` → `Foo.spec.ts`), les tests de bout en bout dans `e2e/`.
- L'interface ne connaît qu'un contrat de données (`AnalyticsRepository`) : la source fictive actuelle pourra être remplacée par une vraie API sans modifier les composants.

## Crédits et licences

Atollo s'appuie sur ces projets open source :

| Projet                                                                                                | Usage                                              | Licence                   |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------- |
| [Vue.js](https://vuejs.org), [Vue Router](https://router.vuejs.org), [Pinia](https://pinia.vuejs.org) | Framework, routage, état                           | MIT                       |
| [VueUse](https://vueuse.org)                                                                          | Utilitaires Vue                                    | MIT                       |
| [Reka UI](https://reka-ui.com)                                                                        | Composants accessibles (menus, onglets, dialogues) | MIT                       |
| [Tailwind CSS](https://tailwindcss.com)                                                               | Styles                                             | MIT                       |
| [Apache ECharts](https://echarts.apache.org)                                                          | Graphiques                                         | Apache 2.0                |
| [vue-echarts](https://github.com/ecomfe/vue-echarts)                                                  | Intégration d'ECharts dans Vue                     | MIT                       |
| [Lucide](https://lucide.dev)                                                                          | Icônes                                             | ISC                       |
| [date-fns](https://date-fns.org)                                                                      | Calculs de dates                                   | MIT                       |
| [Geist et Geist Mono](https://vercel.com/font) (via [Fontsource](https://fontsource.org))             | Polices                                            | SIL Open Font License 1.1 |
| [Vite](https://vite.dev), [Vitest](https://vitest.dev)                                                | Outillage, tests unitaires                         | MIT                       |
| [Playwright](https://playwright.dev)                                                                  | Tests de bout en bout                              | Apache 2.0                |
| [TypeScript](https://www.typescriptlang.org)                                                          | Typage                                             | Apache 2.0                |

Les textes complets de ces licences sont fournis avec chaque paquet (dossier `node_modules` après `npm install`).

Le design s'inspire de l'esthétique sobre d'outils comme Linear, Vercel ou Plausible ; aucun code, logo ni ressource graphique de ces produits n'a été repris.

## Auteure

Laura Dimitroff — [github.com/lauradimitroff](https://github.com/lauradimitroff)

© 2026 Laura Dimitroff. Code publié à titre de démonstration, tous droits réservés.
