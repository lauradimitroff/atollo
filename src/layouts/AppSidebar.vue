<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'
import {
  Activity,
  FileText,
  Globe,
  LayoutGrid,
  List,
  MonitorSmartphone,
  Settings,
} from '@lucide/vue'

import { usePeriod } from '@/features/analytics/composables/usePeriod'
import SiteSwitcher from '@/features/sites/components/SiteSwitcher.vue'
import { useCurrentSite } from '@/features/sites/composables/useCurrentSite'
import AppLogo from './AppLogo.vue'

interface NavItem {
  label: string
  icon: Component
  to: RouteLocationRaw
  /** Path prefix that keeps the item active on all its sub-pages (e.g. every settings tab). */
  activePrefix?: string
}

const { site } = useCurrentSite()
const { query: periodQuery } = usePeriod()
const route = useRoute()

function isActive(item: NavItem, linkActive: boolean) {
  return item.activePrefix ? route.path.startsWith(item.activePrefix) : linkActive
}

const sections = computed<{ title: string; items: NavItem[] }[]>(() => {
  const params = { siteId: site.value.id }
  // Analytics links carry the period, so moving between pages keeps it.
  const query = periodQuery.value
  return [
    {
      title: 'Analyse',
      items: [
        { label: 'Vue d’ensemble', icon: LayoutGrid, to: { name: 'overview', params, query } },
        { label: 'Trafic', icon: Activity, to: { name: 'traffic', params, query } },
        { label: 'Pages', icon: FileText, to: { name: 'pages', params, query } },
        { label: 'Localisation', icon: Globe, to: { name: 'locations', params, query } },
        {
          label: 'Appareils',
          icon: MonitorSmartphone,
          to: { name: 'devices', params, query },
        },
      ],
    },
    {
      title: 'Espace',
      items: [
        { label: 'Mes sites', icon: List, to: { name: 'sites' } },
        {
          label: 'Paramètres',
          icon: Settings,
          to: { name: 'settings-profile' },
          activePrefix: '/settings',
        },
      ],
    },
  ]
})
</script>

<template>
  <div class="flex h-full flex-col gap-5 px-3 py-5">
    <RouterLink
      :to="{ name: 'overview', params: { siteId: site.id } }"
      class="w-fit rounded-md px-2"
    >
      <AppLogo />
    </RouterLink>

    <SiteSwitcher />

    <nav class="flex flex-col gap-5" aria-label="Navigation principale">
      <div v-for="section in sections" :key="section.title">
        <p class="px-2 pb-1.5 text-label text-[10px] text-fg-subtle">{{ section.title }}</p>
        <ul class="flex flex-col gap-0.5">
          <li v-for="item in section.items" :key="item.label">
            <!-- `custom` + slot props: we decide what "active" means and set aria-current. -->
            <RouterLink v-slot="{ href, navigate, isActive: linkActive }" :to="item.to" custom>
              <a
                :href="href"
                :aria-current="isActive(item, linkActive) ? 'page' : undefined"
                class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg aria-[current=page]:bg-surface-muted aria-[current=page]:font-medium aria-[current=page]:text-fg"
                @click="navigate"
              >
                <component :is="item.icon" class="size-4 shrink-0" aria-hidden="true" />
                {{ item.label }}
              </a>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <RouterLink
      :to="{ name: 'settings-profile' }"
      class="mt-auto flex items-center gap-2.5 rounded-lg border-t border-line px-2 pt-4 transition-colors hover:text-fg"
    >
      <span
        class="grid size-7 place-items-center rounded-full border border-line bg-surface-muted text-[11px] font-semibold text-fg-muted"
        aria-hidden="true"
      >
        D
      </span>
      <span class="min-w-0 leading-tight">
        <span class="block truncate text-[13px] font-medium">Compte démo</span>
        <span class="block text-xs text-fg-muted">Espace démo</span>
      </span>
    </RouterLink>
  </div>
</template>
