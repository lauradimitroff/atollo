<script setup lang="ts">
import { Check, Monitor, Moon, Sun } from '@lucide/vue'

import { useTheme, type ThemePreference } from '@/shared/composables/useTheme'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseDropdownMenu from '@/shared/ui/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/shared/ui/BaseDropdownMenuItem.vue'

const { preference, isDark } = useTheme()

const options = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'auto', label: 'Système', icon: Monitor },
] as const satisfies readonly { value: ThemePreference; label: string; icon: unknown }[]
</script>

<template>
  <BaseDropdownMenu align="end">
    <template #trigger>
      <BaseButton icon-only aria-label="Changer de thème">
        <Moon v-if="isDark" aria-hidden="true" />
        <Sun v-else aria-hidden="true" />
      </BaseButton>
    </template>

    <BaseDropdownMenuItem
      v-for="option in options"
      :key="option.value"
      @select="preference = option.value"
    >
      <component :is="option.icon" aria-hidden="true" />
      <span class="flex-1">{{ option.label }}</span>
      <Check v-if="preference === option.value" class="text-accent!" aria-label="Sélectionné" />
    </BaseDropdownMenuItem>
  </BaseDropdownMenu>
</template>
