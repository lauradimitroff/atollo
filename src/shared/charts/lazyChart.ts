import { defineAsyncComponent, type Component } from 'vue'

import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import ChartLoadError from './ChartLoadError.vue'

/**
 * Loads a chart component (and ECharts with it) as a separate chunk, after the rest
 * of the page. If the download fails, it retries twice, then shows an explicit error
 * instead of an empty space.
 */
export function lazyChart<T extends Component>(loader: () => Promise<{ default: T }>) {
  return defineAsyncComponent({
    loader,
    loadingComponent: BaseSkeleton,
    errorComponent: ChartLoadError,
    onError: (error, retry, fail, attempts) => {
      if (attempts <= 2) return retry()
      // Visible in the browser console: tells whether it is a network or blocker issue.
      console.error('[Atollo] Le code du graphique n’a pas pu être chargé :', error)
      fail()
    },
  })
}
