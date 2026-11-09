<script setup lang="ts">
import { useTheme, type ThemePreference } from '@/shared/composables/useTheme'
import BaseSegmentedControl from '@/shared/ui/BaseSegmentedControl.vue'

const { preference } = useTheme()

const options: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'auto', label: 'Système' },
]
</script>

<template>
  <section class="rounded-xl border border-line bg-surface shadow-xs">
    <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-[13px] font-medium">Thème</h2>
        <p class="mt-1 text-[13px] text-fg-muted">
          « Système » suit automatiquement le réglage de votre appareil.
        </p>
      </div>
      <BaseSegmentedControl v-model="preference" :options label="Thème" />
    </div>
  </section>
</template>
