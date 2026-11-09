import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // Lazy-loaded: each page becomes its own chunk.
      component: () => import('@/views/HomeView.vue'),
    },
  ],
})

export default router
