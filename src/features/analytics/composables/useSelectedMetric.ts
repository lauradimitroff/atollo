import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { METRICS, type MetricKey } from '../domain/metrics'

const DEFAULT_METRIC: MetricKey = 'visitors'

function isMetricKey(value: unknown): value is MetricKey {
  return typeof value === 'string' && value in METRICS
}

/**
 * Metric shown on the overview chart, kept in the URL (?metric=bounceRate) like the
 * period: a shared link opens on the same chart.
 * `replace` instead of `push`: switching metric should not fill the back-button history.
 */
export function useSelectedMetric() {
  const route = useRoute()
  const router = useRouter()

  return computed<MetricKey>({
    get: () => (isMetricKey(route.query.metric) ? route.query.metric : DEFAULT_METRIC),
    set: (metric) => {
      const { metric: _previous, ...rest } = route.query
      void router.replace({
        query: metric === DEFAULT_METRIC ? rest : { ...rest, metric },
      })
    },
  })
}
