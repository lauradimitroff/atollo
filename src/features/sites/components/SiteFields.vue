<script setup lang="ts">
import BaseField from '@/shared/ui/BaseField.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import type { SiteInput } from '../types'

/** Name and domain of a site: shared by the "add" form and the "edit" dialog. */
defineProps<{ errors: Partial<Record<keyof SiteInput, string>> }>()
const values = defineModel<SiteInput>({ required: true })
</script>

<template>
  <BaseField v-slot="field" label="Nom du site" :error="errors.name">
    <BaseInput
      :id="field.id"
      v-model="values.name"
      autocomplete="off"
      placeholder="Mon blog"
      :aria-describedby="field.describedBy"
      :invalid="field.invalid"
    />
  </BaseField>
  <BaseField
    v-slot="field"
    label="Domaine"
    hint="Sans https:// ni chemin. Vous pouvez aussi coller l’adresse du site."
    :error="errors.domain"
  >
    <BaseInput
      :id="field.id"
      v-model="values.domain"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      inputmode="url"
      placeholder="monsite.fr"
      :aria-describedby="field.describedBy"
      :invalid="field.invalid"
    />
  </BaseField>
</template>
