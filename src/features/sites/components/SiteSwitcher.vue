<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Check, ChevronsUpDown, LayoutGrid, Plus } from '@lucide/vue'

import { useAuthStore } from '@/features/auth/auth.store'
import BaseDropdownMenu from '@/shared/ui/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/shared/ui/BaseDropdownMenuItem.vue'
import BaseDropdownMenuLabel from '@/shared/ui/BaseDropdownMenuLabel.vue'
import { useCurrentSite } from '../composables/useCurrentSite'
import SiteFavicon from './SiteFavicon.vue'

const { sites, site, switchSite } = useCurrentSite()
const router = useRouter()
const auth = useAuthStore()
const canAdd = computed(() => !auth.user?.isDemo)
</script>

<template>
  <BaseDropdownMenu v-if="site" match-trigger-width>
    <template #trigger>
      <button
        type="button"
        class="flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface p-2 text-left shadow-xs transition-colors hover:bg-surface-muted"
        :aria-label="`Site actuel : ${site.name}. Changer de site`"
      >
        <SiteFavicon :name="site.name" />
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block truncate text-[13px] font-medium">{{ site.name }}</span>
          <span class="block truncate text-xs text-fg-muted">{{ site.domain }}</span>
        </span>
        <ChevronsUpDown class="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
      </button>
    </template>

    <BaseDropdownMenuLabel>Mes sites</BaseDropdownMenuLabel>
    <BaseDropdownMenuItem v-for="item in sites" :key="item.id" @select="switchSite(item.id)">
      <SiteFavicon :name="item.name" size="sm" />
      <span class="flex-1 truncate">{{ item.name }}</span>
      <Check v-if="item.id === site.id" class="text-accent!" aria-label="Site actuel" />
    </BaseDropdownMenuItem>

    <BaseDropdownMenuLabel separated>Espace</BaseDropdownMenuLabel>
    <BaseDropdownMenuItem @select="router.push({ name: 'sites' })">
      <LayoutGrid aria-hidden="true" />Tous les sites
    </BaseDropdownMenuItem>
    <BaseDropdownMenuItem v-if="canAdd" @select="router.push({ name: 'settings-sites' })">
      <Plus aria-hidden="true" />Ajouter un site
    </BaseDropdownMenuItem>
  </BaseDropdownMenu>

  <!-- A new account has no site yet: the switcher becomes the way to add one. -->
  <RouterLink
    v-else
    :to="{ name: 'settings-sites' }"
    class="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-line-strong p-2 text-[13px] text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
  >
    <span class="grid size-6 place-items-center rounded-md border border-line bg-surface">
      <Plus class="size-3.5" aria-hidden="true" />
    </span>
    Ajouter un site
  </RouterLink>
</template>
