<script setup lang="ts">
import { CalendarSearch, FilterX } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import { useFilters } from '../composables/useFilters'
import { usePeriod } from '../composables/usePeriod'

/**
 * "No visit" message shared by every analytics page, with the most useful way out:
 * fewer filters if some are active, otherwise a longer period.
 */
defineProps<{ bare?: boolean }>()

const { filters, clear } = useFilters()
const { period, setPreset } = usePeriod()
</script>

<template>
  <EmptyState
    v-if="filters.length"
    :bare
    :icon="FilterX"
    title="Aucune visite ne correspond à ces filtres"
    description="Retirez un filtre ou élargissez la période pour retrouver des données."
  >
    <BaseButton variant="primary" @click="clear()">Effacer les filtres</BaseButton>
  </EmptyState>
  <EmptyState
    v-else
    :bare
    :icon="CalendarSearch"
    title="Aucune visite sur cette période"
    description="Le site n’a encore reçu aucune visite sur cette période."
  >
    <BaseButton v-if="period.preset !== '30d'" variant="primary" @click="setPreset('30d')">
      Voir les 30 derniers jours
    </BaseButton>
  </EmptyState>
</template>
