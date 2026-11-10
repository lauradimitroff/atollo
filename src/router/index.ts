import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/features/auth/auth.store'
import { useSitesStore } from '@/features/sites/sites.store'

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

/** Signed-out pages, in their own light layout. */
const authRoutes: RouteRecordRaw[] = [
  {
    path: 'login',
    name: 'login',
    component: () => import('@/features/auth/views/LoginView.vue'),
    meta: { title: 'Connexion' },
  },
  {
    path: 'register',
    name: 'register',
    component: () => import('@/features/auth/views/RegisterView.vue'),
    meta: { title: 'Créer un compte' },
  },
  {
    path: 'forgot-password',
    name: 'forgot-password',
    component: () => import('@/features/auth/views/ForgotPasswordView.vue'),
    meta: { title: 'Mot de passe oublié' },
  },
]

const routes: RouteRecordRaw[] = [
  // Public home page, for everyone: signed-in users find a link to their dashboard there.
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/landing/LandingView.vue'),
    meta: { documentTitle: 'Atollo · Statistiques web multi-sites, simples et lisibles' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: authRoutes,
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
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
  // Back/forward: where the user was. Anchor (#fonctionnalites): that section. Else: top.
  scrollBehavior: (to, _from, saved) =>
    saved ?? (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }),
})

// Access: the app needs a session, the sign-in pages need none.
// `to.meta` merges the meta of every matched route, so children inherit the flags.
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Remember the page asked for (a shared link…) to open it right after signing in.
    const redirect = to.fullPath === '/sites' ? undefined : to.fullPath
    return { name: 'login', query: redirect ? { redirect } : {} }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'sites' }
  // Every app page shows the sites of the account (switcher, home…): load them first.
  if (to.meta.requiresAuth) await useSitesStore().load()
})

// Site id unknown, or of another account → 404 instead of an empty dashboard.
// A global guard (not `beforeEnter`) because `beforeEnter` does not run again
// when only the params change, e.g. /s/site-a/overview → /s/site-b/overview.
router.beforeEach((to) => {
  const { siteId } = to.params
  if (typeof siteId === 'string' && !useSitesStore().find(siteId)) {
    return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }
  }
})

router.afterEach((to) => {
  document.title = to.meta.documentTitle ?? (to.meta.title ? `${to.meta.title} · Atollo` : 'Atollo')
})

export default router
