<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Check, Copy } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import type { Site } from '../types'

/** The line to paste in the <head> of the site, with a copy button. */
const props = defineProps<{ site: Site }>()

const code = computed(
  () =>
    `<script defer data-site="${props.site.id}" src="https://cdn.atollo.example/a.js"><` +
    `/script>`,
)

// `legacy`: falls back to the old copy command where the Clipboard API is missing.
const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2000, legacy: true })
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="relative rounded-lg border border-line bg-surface-muted">
      <pre
        class="overflow-x-auto px-3 py-2.5 pr-12 font-mono text-xs leading-relaxed"
        tabindex="0"
        aria-label="Code de suivi"
      ><code>{{ code }}</code></pre>
      <BaseButton
        v-if="isSupported"
        class="absolute top-1.5 right-1.5"
        size="sm"
        icon-only
        :aria-label="copied ? 'Code copié' : 'Copier le code'"
        @click="copy(code)"
      >
        <Check v-if="copied" class="text-up" aria-hidden="true" />
        <Copy v-else aria-hidden="true" />
      </BaseButton>
    </div>
    <p class="text-xs text-fg-muted">
      À coller dans la balise <code class="font-mono">&lt;head&gt;</code> de chaque page. Le script
      de suivi sans cookies arrive dans une prochaine version d’Atollo.
    </p>
    <p class="sr-only" role="status">{{ copied ? 'Code copié dans le presse-papiers.' : '' }}</p>
  </div>
</template>
