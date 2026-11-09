<script setup lang="ts">
/**
 * Temporary page: previews the design tokens (1a) and base components (1b).
 * It is replaced by the application layout in step 1c.
 */
import { ref } from 'vue'
import { ChevronsUpDown, Copy, LogOut, Plus, Settings, Trash2 } from '@lucide/vue'

import { useTheme, type ThemePreference } from '@/shared/composables/useTheme'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseDropdownMenu from '@/shared/ui/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/shared/ui/BaseDropdownMenuItem.vue'
import BaseDropdownMenuLabel from '@/shared/ui/BaseDropdownMenuLabel.vue'
import BaseField from '@/shared/ui/BaseField.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseSegmentedControl from '@/shared/ui/BaseSegmentedControl.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'

const { preference, resolved } = useTheme()

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'auto', label: 'Système' },
]

// Demo state for the component previews
const periodOptions = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
  { value: '90d', label: '90 j' },
] as const
const period = ref<(typeof periodOptions)[number]['value']>('30d')

const siteName = ref('Atelier Nord')
const domain = ref('atelier nord')
const domainError = ref('Saisissez un domaine valide, par exemple atelier-nord.example')
const loading = ref(false)
const lastAction = ref('—')

function simulateSave() {
  loading.value = true
  setTimeout(() => (loading.value = false), 1500)
}

const groups = [
  {
    title: 'Surfaces',
    tokens: [
      { name: 'canvas', class: 'bg-canvas' },
      { name: 'surface', class: 'bg-surface' },
      { name: 'surface-muted', class: 'bg-surface-muted' },
      { name: 'line', class: 'bg-line' },
      { name: 'line-strong', class: 'bg-line-strong' },
    ],
  },
  {
    title: 'Texte',
    tokens: [
      { name: 'fg', class: 'bg-fg' },
      { name: 'fg-muted', class: 'bg-fg-muted' },
      { name: 'fg-subtle', class: 'bg-fg-subtle' },
    ],
  },
  {
    title: 'Marque',
    tokens: [
      { name: 'grad-a', class: 'bg-grad-a' },
      { name: 'grad-b / accent', class: 'bg-grad-b' },
      { name: 'grad-c', class: 'bg-grad-c' },
      { name: 'accent-soft', class: 'bg-accent-soft' },
    ],
  },
  {
    title: 'Sémantique',
    tokens: [
      { name: 'up', class: 'bg-up' },
      { name: 'down', class: 'bg-down' },
    ],
  },
]

const typeScale = [
  { size: 'text-4xl', px: 36, sample: '38 412', mono: true },
  { size: 'text-[28px]', px: 28, sample: '141 236', mono: true },
  { size: 'text-xl', px: 20, sample: 'Vue d’ensemble', mono: false },
  { size: 'text-base', px: 16, sample: 'Visiteurs uniques par jour', mono: false },
  { size: 'text-sm', px: 14, sample: 'Corps de texte de l’interface', mono: false },
  { size: 'text-xs', px: 12, sample: '/blog/design-tokens', mono: true },
]
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="grid size-7 place-items-center rounded-lg bg-brand-gradient">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M1 10 L4 5 L7 7.5 L11 1.5"
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <div>
          <h1 class="text-base font-semibold tracking-tight">Atollo</h1>
          <p class="text-xs text-fg-muted">Design system — palette Lagon</p>
        </div>
      </div>

      <BaseSegmentedControl v-model="preference" :options="themeOptions" label="Thème" />
    </header>

    <p class="mt-2 text-xs text-fg-subtle">
      Thème affiché : <span class="font-mono">{{ resolved }}</span>
    </p>

    <!-- ===================== Composants (1b) ===================== -->
    <section class="mt-10">
      <h2 class="text-label">Boutons</h2>
      <div
        class="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-5"
      >
        <BaseButton variant="primary"><Plus aria-hidden="true" />Ajouter un site</BaseButton>
        <BaseButton>Annuler</BaseButton>
        <BaseButton variant="ghost">Voir tout</BaseButton>
        <BaseButton :loading="loading" variant="primary" @click="simulateSave">
          {{ loading ? 'Enregistrement…' : 'Enregistrer (clic = chargement)' }}
        </BaseButton>
        <BaseButton disabled>Désactivé</BaseButton>
        <BaseButton size="sm">Petit</BaseButton>
        <BaseButton icon-only aria-label="Paramètres"><Settings aria-hidden="true" /></BaseButton>
        <BaseButton icon-only variant="ghost" aria-label="Copier">
          <Copy aria-hidden="true" />
        </BaseButton>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-label">Contrôle segmenté</h2>
      <div
        class="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-5"
      >
        <BaseSegmentedControl v-model="period" :options="periodOptions" label="Période" />
        <span class="text-xs text-fg-muted">
          Valeur : <span class="font-mono text-fg">{{ period }}</span> — essayez les flèches du
          clavier
        </span>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-label">Formulaire</h2>
      <div class="mt-3 grid gap-5 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
        <BaseField
          v-slot="{ id, describedBy, invalid }"
          label="Nom du site"
          hint="Visible par vous seul."
        >
          <BaseInput :id v-model="siteName" :aria-describedby="describedBy" :invalid />
        </BaseField>
        <BaseField v-slot="{ id, describedBy, invalid }" label="Domaine" :error="domainError">
          <BaseInput
            :id
            v-model="domain"
            :aria-describedby="describedBy"
            :invalid
            placeholder="exemple.fr"
            @input="domainError = ''"
          />
        </BaseField>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-label">Menu déroulant</h2>
      <div
        class="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-5"
      >
        <BaseDropdownMenu match-trigger-width>
          <template #trigger>
            <button
              type="button"
              class="flex w-60 items-center gap-2.5 rounded-lg border border-line bg-surface p-2 text-left shadow-xs transition-colors hover:bg-surface-muted"
            >
              <span
                class="grid size-6 place-items-center rounded-md border border-line bg-surface-muted text-[11px] font-semibold text-fg-muted"
                >A</span
              >
              <span class="flex-1 leading-tight">
                <span class="block text-[13px] font-medium">Atelier Nord</span>
                <span class="block text-xs text-fg-muted">atelier-nord.example</span>
              </span>
              <ChevronsUpDown class="size-4 text-fg-subtle" aria-hidden="true" />
            </button>
          </template>
          <BaseDropdownMenuLabel>Mes sites</BaseDropdownMenuLabel>
          <BaseDropdownMenuItem @select="lastAction = 'Atelier Nord'"
            >Atelier Nord</BaseDropdownMenuItem
          >
          <BaseDropdownMenuItem @select="lastAction = 'Studio Brume'"
            >Studio Brume</BaseDropdownMenuItem
          >
          <BaseDropdownMenuItem @select="lastAction = 'La Mie Céleste'">
            La Mie Céleste
          </BaseDropdownMenuItem>
          <BaseDropdownMenuLabel separated>Actions</BaseDropdownMenuLabel>
          <BaseDropdownMenuItem @select="lastAction = 'Ajouter un site'">
            <Plus aria-hidden="true" />Ajouter un site
          </BaseDropdownMenuItem>
        </BaseDropdownMenu>

        <BaseDropdownMenu align="end">
          <template #trigger>
            <BaseButton icon-only aria-label="Options du compte">
              <Settings aria-hidden="true" />
            </BaseButton>
          </template>
          <BaseDropdownMenuItem @select="lastAction = 'Paramètres'">
            <Settings aria-hidden="true" />Paramètres
          </BaseDropdownMenuItem>
          <BaseDropdownMenuItem danger @select="lastAction = 'Supprimer'">
            <Trash2 aria-hidden="true" />Supprimer le site
          </BaseDropdownMenuItem>
          <BaseDropdownMenuItem disabled>
            <LogOut aria-hidden="true" />Déconnexion (désactivé)
          </BaseDropdownMenuItem>
        </BaseDropdownMenu>

        <span class="text-xs text-fg-muted">
          Dernière action : <span class="font-mono text-fg">{{ lastAction }}</span>
        </span>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-label">Chargement (skeleton)</h2>
      <div
        class="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
      >
        <div v-for="n in 4" :key="n" class="flex flex-col gap-3 bg-surface p-5">
          <BaseSkeleton class="h-3 w-24" />
          <BaseSkeleton class="h-7 w-20" />
          <BaseSkeleton class="h-3 w-12" />
        </div>
      </div>
    </section>

    <!-- ===================== Tokens (1a) ===================== -->

    <section v-for="group in groups" :key="group.title" class="mt-10">
      <h2 class="text-label">{{ group.title }}</h2>
      <ul class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <li
          v-for="token in group.tokens"
          :key="token.name"
          class="overflow-hidden rounded-xl border border-line bg-surface shadow-xs"
        >
          <div class="h-16 border-b border-line" :class="token.class" />
          <p class="px-3 py-2 font-mono text-xs">{{ token.name }}</p>
        </li>
      </ul>
    </section>

    <section class="mt-10">
      <h2 class="text-label">Dégradé signature</h2>
      <div class="mt-3 h-2 rounded-full bg-brand-gradient" />
    </section>

    <section class="mt-10">
      <h2 class="text-label">Typographie</h2>
      <ul class="mt-3 divide-y divide-line rounded-xl border border-line bg-surface shadow-xs">
        <li
          v-for="item in typeScale"
          :key="item.px"
          class="flex items-baseline justify-between gap-4 px-4 py-3"
        >
          <span
            class="truncate tracking-tight"
            :class="[item.size, item.mono ? 'font-mono font-medium' : 'font-sans']"
          >
            {{ item.sample }}
          </span>
          <span class="shrink-0 font-mono text-xs text-fg-subtle">
            {{ item.px }} px · {{ item.mono ? 'Geist Mono' : 'Geist' }}
          </span>
        </li>
      </ul>
    </section>

    <section class="mt-10">
      <h2 class="text-label">Variations</h2>
      <div class="mt-3 flex gap-6 font-mono text-sm">
        <span class="text-up">↗ 12,4 %</span>
        <span class="text-down">↘ 4,2 %</span>
      </div>
    </section>
  </main>
</template>
