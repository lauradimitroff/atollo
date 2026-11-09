<script setup lang="ts">
import { X } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import { useFilters } from '../composables/useFilters'
import { FILTER_DIMENSION_LABELS, filterValueLabel } from '../domain/labels'

/** Active cross filters as removable chips. Hidden when nothing is filtered. */
const { filters, remove, clear } = useFilters()
</script>

<template>
  <div
    v-if="filters.length"
    class="flex flex-wrap items-center gap-2"
    role="region"
    aria-label="Filtres actifs"
  >
    <span class="text-xs text-fg-muted">Filtré par</span>
    <TransitionGroup
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
      enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
    >
      <button
        v-for="filter in filters"
        :key="filter.dimension"
        type="button"
        class="inline-flex h-7 items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft pr-2 pl-3 text-xs transition-colors hover:border-accent"
        :aria-label="`Retirer le filtre ${FILTER_DIMENSION_LABELS[filter.dimension]} : ${filterValueLabel(filter)}`"
        @click="remove(filter.dimension)"
      >
        <span class="text-fg-muted">{{ FILTER_DIMENSION_LABELS[filter.dimension] }}</span>
        <span class="font-medium">{{ filterValueLabel(filter) }}</span>
        <X class="size-3.5 text-fg-muted" aria-hidden="true" />
      </button>
    </TransitionGroup>
    <BaseButton v-if="filters.length > 1" size="sm" variant="ghost" @click="clear()">
      Tout effacer
    </BaseButton>
  </div>
</template>
