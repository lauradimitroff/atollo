<script setup lang="ts">
import { ref, useId } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import type { BreakdownTab } from './breakdown'
import BreakdownList from './BreakdownList.vue'

/**
 * A card with a title and tabs (Canaux / Référents / Campagnes…).
 * Reka Tabs give the expected keyboard behavior (arrows between tabs) and ARIA wiring.
 */
const props = defineProps<{ title: string; tabs: readonly BreakdownTab[] }>()

const active = ref(props.tabs[0]!.key)
const titleId = useId()
</script>

<template>
  <section class="rounded-xl border border-line bg-surface shadow-xs" :aria-labelledby="titleId">
    <TabsRoot v-model="active">
      <div class="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h2 :id="titleId" class="text-[13px] font-medium">{{ title }}</h2>
        <TabsList v-if="tabs.length > 1" class="flex gap-3.5" :aria-label="`Vues de ${title}`">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.key"
            :value="tab.key"
            class="rounded-sm text-xs text-fg-muted transition-colors hover:text-fg data-[state=active]:font-medium data-[state=active]:text-fg"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent v-for="tab in tabs" :key="tab.key" :value="tab.key" class="outline-none">
        <BreakdownList :tab="tab" />
      </TabsContent>
    </TabsRoot>
  </section>
</template>
