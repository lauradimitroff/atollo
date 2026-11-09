<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu } from '@lucide/vue'

import { usePeriod } from '@/features/analytics/composables/usePeriod'
import type { PeriodPreset } from '@/features/analytics/domain/period'
import { formatDateRange } from '@/shared/lib/format'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseSegmentedControl from '@/shared/ui/BaseSegmentedControl.vue'
import ThemeMenu from './ThemeMenu.vue'

defineEmits<{ openMenu: [] }>()

const route = useRoute()
const { period, range, setPreset } = usePeriod()

const isAnalyticsPage = computed(() => typeof route.params.siteId === 'string')

const periodOptions: { value: PeriodPreset; label: string }[] = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
  { value: '90d', label: '90 j' },
]

// Bridges the URL period and the segmented control.
// A custom range (calendar, step 3) simply leaves no preset checked.
const presetModel = computed({
  get: () => period.value.preset,
  set: (value) => {
    if (value !== 'custom') setPreset(value)
  },
})

const rangeLabel = computed(() => formatDateRange(range.value))
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
      v-if="isAnalyticsPage"
      class="order-3 flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 sm:order-2 sm:w-auto"
    >
      <BaseSegmentedControl v-model="presetModel" :options="periodOptions" label="Période" />
      <!-- Announced by screen readers when the period changes. -->
      <p class="font-mono text-xs whitespace-nowrap text-fg-muted" aria-live="polite">
        {{ rangeLabel }}
      </p>
    </div>
  </header>
</template>
