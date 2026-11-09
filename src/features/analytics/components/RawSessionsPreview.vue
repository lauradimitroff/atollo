<script setup lang="ts">
/**
 * TEMPORARY (step 2b): shows the raw generated sessions so the data can be checked
 * by eye. Removed in step 3, when the overview displays real computed statistics.
 */
import { computed } from 'vue'

import { useCurrentSite } from '@/features/sites/composables/useCurrentSite'
import { formatDuration, formatNumber } from '@/shared/lib/format'
import { getSessions } from '../data/mock/sessions'
import { usePeriod } from '../composables/usePeriod'
import { CHANNEL_LABELS, DEVICE_LABELS } from '../domain/labels'

const { site } = useCurrentSite()
const { range } = usePeriod()

const result = computed(() => {
  const started = performance.now()
  const sessions = getSessions(site.value.id, range.value)
  return { sessions, ms: Math.round(performance.now() - started) }
})

const pageviews = computed(() =>
  result.value.sessions.reduce((total, s) => total + s.pageviews.length, 0),
)
const latest = computed(() => result.value.sessions.slice(-12).reverse())

const time = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
</script>

<template>
  <section class="rounded-xl border border-line bg-surface shadow-xs">
    <header class="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line px-5 py-4">
      <h2 class="mr-auto text-[13px] font-medium">
        Données brutes générées
        <span class="ml-2 text-xs font-normal text-fg-subtle">aperçu temporaire · étape 2b</span>
      </h2>
      <p class="text-xs text-fg-muted">
        <span class="font-mono text-fg">{{ formatNumber(result.sessions.length) }}</span> visites
      </p>
      <p class="text-xs text-fg-muted">
        <span class="font-mono text-fg">{{ formatNumber(pageviews) }}</span> pages vues
      </p>
      <p class="text-xs text-fg-muted">
        lecture <span class="font-mono text-fg">{{ result.ms }} ms</span>
      </p>
    </header>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-[13px]">
        <caption class="sr-only">
          Les 12 visites les plus récentes de la période
        </caption>
        <thead class="text-label text-[10px] text-fg-subtle">
          <tr>
            <th scope="col" class="px-5 py-2.5 font-medium">Début</th>
            <th scope="col" class="px-3 py-2.5 font-medium">Source</th>
            <th scope="col" class="px-3 py-2.5 font-medium">Lieu</th>
            <th scope="col" class="px-3 py-2.5 font-medium">Appareil</th>
            <th scope="col" class="px-3 py-2.5 font-medium">Parcours</th>
            <th scope="col" class="px-5 py-2.5 text-right font-medium">Durée</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="session in latest" :key="session.id" class="align-top">
            <td class="px-5 py-2.5 font-mono text-xs whitespace-nowrap text-fg-muted">
              {{ time.format(session.startedAt) }}
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap">
              {{ CHANNEL_LABELS[session.channel] }}
              <span class="block text-xs text-fg-muted">
                {{ session.utm?.campaign ?? session.referrer ?? '—' }}
              </span>
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap">
              {{ session.city }}
              <span class="font-mono text-xs text-fg-muted">{{ session.country }}</span>
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap">
              {{ DEVICE_LABELS[session.device] }}
              <span class="block text-xs text-fg-muted">
                {{ session.browser }} · {{ session.os }}
              </span>
            </td>
            <td class="px-3 py-2.5 font-mono text-xs">
              {{ session.pageviews.map((p) => p.path).join(' → ') }}
            </td>
            <td class="px-5 py-2.5 text-right font-mono text-xs whitespace-nowrap">
              {{ session.pageviews.length === 1 ? 'rebond' : formatDuration(session.durationS) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
