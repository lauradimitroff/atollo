<script setup lang="ts">
import { ref } from 'vue'

import FormAlert from '@/features/auth/components/FormAlert.vue'
import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseDialog from '@/shared/ui/BaseDialog.vue'
import { sitesErrorMessage } from '../messages'
import { siteSchema } from '../schemas'
import { useSitesStore } from '../sites.store'
import type { Site } from '../types'
import SiteFields from './SiteFields.vue'

/** Rename a site or fix its domain. Its id, so its tracking code, does not change. */
const props = defineProps<{ site: Site; disabled?: boolean }>()

const store = useSitesStore()
const open = ref(false)

const { values, errors, formError, submitting, dirty, reset, handleSubmit } = useZodForm(
  siteSchema,
  { name: props.site.name, domain: props.site.domain },
  { errorMessage: sitesErrorMessage },
)

// Each opening starts from the saved site, not from an edit left unfinished.
function onOpenChange(value: boolean) {
  if (value) reset({ name: props.site.name, domain: props.site.domain })
  open.value = value
}

const onSubmit = handleSubmit(async (data) => {
  await store.update(props.site.id, data)
  open.value = false
})
</script>

<template>
  <BaseDialog
    :open
    :title="`Modifier ${site.name}`"
    description="Le code de suivi reste le même : rien à changer sur le site."
    @update:open="onOpenChange"
  >
    <template #trigger>
      <BaseButton size="sm" :disabled>Modifier</BaseButton>
    </template>

    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <FormAlert v-if="formError">{{ formError }}</FormAlert>
      <SiteFields v-model="values" :errors />
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <BaseButton @click="open = false">Annuler</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="submitting" :disabled="!dirty">
          Enregistrer
        </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>
