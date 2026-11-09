<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

import { DEMO_SITES } from '../demo-sites'
import SiteFavicon from '../components/SiteFavicon.vue'
</script>

<template>
  <!-- Stats per site (sparkline, visitors) come with the data layer in step 2. -->
  <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <li v-for="site in DEMO_SITES" :key="site.id">
      <RouterLink
        :to="{ name: 'overview', params: { siteId: site.id } }"
        class="group flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-xs transition-colors hover:border-line-strong"
      >
        <SiteFavicon :name="site.name" />
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block truncate font-medium">{{ site.name }}</span>
          <span class="block truncate text-xs text-fg-muted">{{ site.domain }}</span>
        </span>
        <ArrowUpRight
          class="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          aria-hidden="true"
        />
      </RouterLink>
    </li>
  </ul>
</template>
