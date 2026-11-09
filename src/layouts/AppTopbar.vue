<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseSegmentedControl from '@/shared/ui/BaseSegmentedControl.vue'
import ThemeMenu from './ThemeMenu.vue'

defineEmits<{ openMenu: [] }>()

const route = useRoute()

const isAnalyticsPage = computed(() => typeof route.params.siteId === 'string')

// Local state for now: in step 2 the period moves to the URL (?period=30d)
// and drives the data shown on every analytics page.
const periodOptions = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
  { value: '90d', label: '90 j' },
] as const
const period = ref<(typeof periodOptions)[number]['value']>('30d')
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
    <div v-if="isAnalyticsPage" class="order-3 w-full overflow-x-auto sm:order-2 sm:w-auto">
      <BaseSegmentedControl v-model="period" :options="periodOptions" label="Période" />
    </div>
  </header>
</template>
