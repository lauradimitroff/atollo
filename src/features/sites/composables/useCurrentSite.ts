import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { withoutFilters } from '@/features/analytics/domain/filters'
import { useSitesStore } from '../sites.store'

/**
 * The site being viewed, derived from the URL (`/s/:siteId/...`).
 * The URL is the source of truth: reload, share or go back and the right site shows.
 * Outside a site page (settings, sites list) it falls back to the first site of the
 * account, and to null for an account that has none yet.
 */
export function useCurrentSite() {
  const route = useRoute()
  const router = useRouter()
  const store = useSitesStore()

  const sites = computed(() => store.sites)

  const site = computed(() => {
    const id = route.params.siteId
    return (typeof id === 'string' && store.find(id)) || store.sites[0] || null
  })

  /**
   * Opens another site, staying on the same analytics page with the same period.
   * Filters are dropped: "/tarifs" or a campaign of one site means nothing on another.
   */
  function switchSite(siteId: string) {
    const isSitePage = typeof route.params.siteId === 'string' && route.name
    return router.push({
      name: isSitePage ? route.name : 'overview',
      params: { siteId },
      query: isSitePage ? withoutFilters(route.query) : undefined,
    })
  }

  return { sites, site, switchSite }
}
