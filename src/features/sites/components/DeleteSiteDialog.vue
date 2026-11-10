<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'reka-ui'

import FormAlert from '@/features/auth/components/FormAlert.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { sitesErrorMessage } from '../messages'
import { useSitesStore } from '../sites.store'
import type { Site } from '../types'

/**
 * Deleting a site loses its statistics: confirmed in an alert dialog, focus on
 * "Annuler". No password here, unlike the account: the account stays safe.
 */
const props = defineProps<{ site: Site; disabled?: boolean }>()

const store = useSitesStore()
const open = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)

function onOpenChange(value: boolean) {
  open.value = value
  error.value = null
}

async function confirm() {
  deleting.value = true
  error.value = null
  try {
    await store.remove(props.site.id)
    open.value = false
  } catch (failure) {
    error.value = sitesErrorMessage(failure)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <AlertDialogRoot :open @update:open="onOpenChange">
    <AlertDialogTrigger as-child>
      <BaseButton size="sm" variant="ghost" class="text-down hover:text-down" :disabled>
        Supprimer
      </BaseButton>
    </AlertDialogTrigger>

    <AlertDialogPortal>
      <AlertDialogOverlay
        class="fixed inset-0 z-40 bg-fg/30 backdrop-blur-[2px] motion-safe:data-[state=open]:animate-[fade-in_150ms_ease-out]"
      />
      <AlertDialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-pop sm:p-6"
      >
        <AlertDialogTitle class="text-base font-semibold tracking-tight">
          Supprimer {{ site.name }} ?
        </AlertDialogTitle>
        <AlertDialogDescription class="mt-2 text-[13px] text-fg-muted">
          Le site et toutes ses statistiques seront effacés. Cette action est irréversible.
        </AlertDialogDescription>

        <FormAlert v-if="error" class="mt-4">{{ error }}</FormAlert>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel as-child>
            <BaseButton>Annuler</BaseButton>
          </AlertDialogCancel>
          <BaseButton variant="danger" :loading="deleting" @click="confirm">
            Supprimer le site
          </BaseButton>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
