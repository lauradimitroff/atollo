<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarDays, Menu } from '@lucide/vue'
import { subDays, subMilliseconds } from 'date-fns'

import { usePeriod } from '@/features/analytics/composables/usePeriod'
import {
  MAX_HISTORY_DAYS,
  toDayString,
  type PeriodPreset,
} from '@/features/analytics/domain/period'
import { formatDateRange } from '@/shared/lib/format'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseDateRangePicker, { type DayRange } from '@/shared/ui/BaseDateRangePicker.vue'
import BaseSegmentedControl from '@/shared/ui/BaseSegmentedControl.vue'
import ThemeMenu from './ThemeMenu.vue'

defineEmits<{ openMenu: [] }>()

const route = useRoute()
const { period, range, setPreset, setPeriod } = usePeriod()

// Pages driven by the period: a site's analytics, and the multi-site overview.
const showPeriod = computed(() => typeof route.params.siteId === 'string' || route.name === 'sites')

const periodOptions: { value: PeriodPreset; label: string }[] = [
  { value: 'today', label: 'Aujourd’hui' },
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
  { value: '90d', label: '90 j' },
  { value: '12m', label: '12 mois' },
]

// Bridges the URL period and the segmented control.
// A custom range (chosen in the calendar) simply leaves no preset checked.
const presetModel = computed({
  get: () => period.value.preset,
  set: (value) => {
    if (value !== 'custom') setPreset(value)
  },
})

const rangeLabel = computed(() => formatDateRange(range.value))

// Calendar: opens on the displayed range; selectable over the last year, up to today.
const displayedDays = computed<DayRange>(() => ({
  from: toDayString(range.value.start),
  to: toDayString(subMilliseconds(range.value.end, 1)),
}))
const today = toDayString(new Date())
const oldestDay = toDayString(subDays(new Date(), MAX_HISTORY_DAYS))

function applyCustomRange({ from, to }: DayRange) {
  setPeriod({ preset: 'custom', from, to })
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-md sm:px-7 lg:min-h-15"
  >
    <BaseButton
      icon-only
      variant="ghost"
      class="-ml-1.5 lg:hidden"
      aria-label="Ouvrir la navigation"
      @click="$emit('openMenu')"
    >
      <Menu aria-hidden="true" />
    </BaseButton>

    <h1 class="mr-auto truncate text-[15px] font-semibold tracking-tight">
      {{ route.meta.title }}
    </h1>

    <!-- Wrapper needed: ThemeMenu renders no root element of its own to carry the class. -->
    <div class="order-2 sm:order-3">
      <ThemeMenu />
    </div>

    <!-- Full-width second row on phones, inline from `sm` up. -->
    <div
      v-if="showPeriod"
      class="order-3 flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 sm:order-2 sm:w-auto"
    >
      <BaseSegmentedControl v-model="presetModel" :options="periodOptions" label="Période" />
      <BaseDateRangePicker
        :initial="displayedDays"
        :min="oldestDay"
        :max="today"
        @apply="applyCustomRange"
      >
        <template #trigger>
          <BaseButton
            size="sm"
            :variant="period.preset === 'custom' ? 'secondary' : 'ghost'"
            :aria-label="`Période personnalisée, actuellement ${rangeLabel}`"
          >
            <CalendarDays aria-hidden="true" />
            <span class="font-mono font-normal">{{ rangeLabel }}</span>
          </BaseButton>
        </template>
      </BaseDateRangePicker>
      <!-- Announced by screen readers when the period changes. -->
      <p class="sr-only" aria-live="polite">Période : {{ rangeLabel }}</p>
    </div>
  </header>
</template>
