import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AppLayout from '@/layouts/AppLayout.vue'
import { findSite } from '@/features/sites/demo-sites'

/** Analytics pages, all scoped to a site: /s/:siteId/<page>. */
const analyticsRoutes: RouteRecordRaw[] = [
  {
    path: 'overview',
    name: 'overview',
    component: () => import('@/features/analytics/views/OverviewView.vue'),
    meta: { title: 'Vue d’ensemble' },
  },
  {
    path: 'traffic',
    name: 'traffic',
    component: () => import('@/features/analytics/views/TrafficView.vue'),
    meta: { title: 'Trafic' },
  },
  {
    path: 'pages',
    name: 'pages',
    component: () => import('@/features/analytics/views/PagesView.vue'),
    meta: { title: 'Pages' },
  },
  {
    path: 'locations',
    name: 'locations',
    component: () => import('@/features/analytics/views/LocationsView.vue'),
    meta: { title: 'Localisation' },
  },
  {
    path: 'devices',
    name: 'devices',
    component: () => import('@/features/analytics/views/DevicesView.vue'),
    meta: { title: 'Appareils' },
  },
]

const settingsRoutes: RouteRecordRaw[] = [
  { path: '', redirect: { name: 'settings-profile' } },
  {
    path: 'profile',
    name: 'settings-profile',
    component: () => import('@/features/settings/views/ProfileSettingsView.vue'),
  },
  {
    path: 'account',
    name: 'settings-account',
    component: () => import('@/features/settings/views/AccountSettingsView.vue'),
  },
  {
    path: 'sites',
    name: 'settings-sites',
    component: () => import('@/features/settings/views/SitesSettingsView.vue'),
  },
  {
    path: 'appearance',
    name: 'settings-appearance',
    component: () => import('@/features/settings/views/AppearanceSettingsView.vue'),
  },
]

const routes: RouteRecordRaw[] = [
  // The multi-site overview is the home of the app (a public landing page may come later).
  { path: '/', redirect: { name: 'sites' } },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 's/:siteId',
        children: [{ path: '', redirect: { name: 'overview' } }, ...analyticsRoutes],
      },
      {
        path: 'sites',
        name: 'sites',
        component: () => import('@/features/sites/views/SitesView.vue'),
        meta: { title: 'Tous les sites' },
      },
      {
        path: 'settings',
        component: () => import('@/features/settings/views/SettingsView.vue'),
        meta: { title: 'Paramètres' },
        children: settingsRoutes,
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Page introuvable' },
      },
    ],
  },
]

// Living style guide, only available in development.
if (import.meta.env.DEV) {
  routes.unshift({
    path: '/design-system',
    name: 'design-system',
    component: () => import('@/views/DesignSystemView.vue'),
    meta: { title: 'Design system' },
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

// Unknown site id → 404 instead of an empty dashboard.
// A global guard (not `beforeEnter`) because `beforeEnter` does not run again
// when only the params change, e.g. /s/site-a/overview → /s/site-b/overview.
router.beforeEach((to) => {
  const { siteId } = to.params
  if (typeof siteId === 'string' && !findSite(siteId)) {
    return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Atollo` : 'Atollo'
})

export default router
