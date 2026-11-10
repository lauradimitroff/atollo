<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronsUpDown, LogOut, Settings, UserRound } from '@lucide/vue'

import { useAuthStore } from '@/features/auth/auth.store'
import BaseDropdownMenu from '@/shared/ui/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/shared/ui/BaseDropdownMenuItem.vue'
import BaseDropdownMenuLabel from '@/shared/ui/BaseDropdownMenuLabel.vue'

/** Who is signed in, and the way out. */
const auth = useAuthStore()
const router = useRouter()

const user = computed(() => auth.user)

/** "Laure Martin" → "LM"; one word → its first letter. */
const initials = computed(() =>
  (user.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join(''),
)

async function signOut() {
  await auth.signOut()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <BaseDropdownMenu v-if="user" match-trigger-width>
    <template #trigger>
      <button
        type="button"
        class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-muted data-[state=open]:bg-surface-muted"
        aria-label="Menu du compte"
      >
        <span
          class="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface-muted text-[11px] font-semibold text-fg-muted"
          aria-hidden="true"
        >
          {{ user.isDemo ? 'D' : initials }}
        </span>
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block truncate text-[13px] font-medium">{{ user.name }}</span>
          <span class="block truncate text-xs text-fg-muted">
            {{ user.isDemo ? 'Données fictives' : user.email }}
          </span>
        </span>
        <ChevronsUpDown class="size-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
      </button>
    </template>

    <BaseDropdownMenuLabel>
      {{ user.isDemo ? 'Compte de démonstration' : 'Mon compte' }}
    </BaseDropdownMenuLabel>
    <BaseDropdownMenuItem @select="router.push({ name: 'settings-profile' })">
      <UserRound aria-hidden="true" />
      Profil
    </BaseDropdownMenuItem>
    <BaseDropdownMenuItem @select="router.push({ name: 'settings-account' })">
      <Settings aria-hidden="true" />
      Paramètres du compte
    </BaseDropdownMenuItem>
    <BaseDropdownMenuItem danger @select="signOut">
      <LogOut aria-hidden="true" />
      {{ user.isDemo ? 'Quitter la démo' : 'Se déconnecter' }}
    </BaseDropdownMenuItem>
  </BaseDropdownMenu>
</template>
