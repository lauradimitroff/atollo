<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/features/auth/auth.store'
import FormAlert from '@/features/auth/components/FormAlert.vue'
import { initials } from '@/features/auth/initials'
import { authErrorMessage } from '@/features/auth/messages'
import { profileSchema } from '@/features/auth/schemas'
import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseField from '@/shared/ui/BaseField.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import DemoNotice from '../components/DemoNotice.vue'
import SettingsSection from '../components/SettingsSection.vue'

const auth = useAuthStore()
const isDemo = computed(() => auth.user?.isDemo ?? false)

const { values, errors, formError, submitting, succeeded, dirty, reset, handleSubmit } = useZodForm(
  profileSchema,
  { name: auth.user?.name ?? '' },
  { errorMessage: authErrorMessage },
)

const onSubmit = handleSubmit(async (data) => {
  await auth.updateProfile(data)
  reset({ name: auth.user?.name ?? data.name })
})

// The avatar follows the name being typed: a live preview of the change.
const preview = computed(() => initials(values.value.name) || '?')
</script>

<template>
  <div class="flex flex-col gap-5">
    <DemoNotice v-if="isDemo" />

    <form novalidate @submit.prevent="onSubmit">
      <SettingsSection title="Profil" description="Votre nom apparaît dans le menu du compte.">
        <FormAlert v-if="formError">{{ formError }}</FormAlert>

        <!-- A disabled fieldset disables every field inside it at once. -->
        <fieldset :disabled="isDemo" class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <span
              class="grid size-14 shrink-0 place-items-center rounded-full bg-brand-gradient text-lg font-semibold text-white"
              aria-hidden="true"
            >
              {{ isDemo ? 'D' : preview }}
            </span>
            <p class="text-xs text-fg-muted">
              Votre avatar reprend vos initiales : aucune photo n’est stockée.
            </p>
          </div>

          <BaseField v-slot="field" label="Nom" :error="errors.name">
            <BaseInput
              :id="field.id"
              v-model="values.name"
              autocomplete="name"
              class="max-w-sm"
              :aria-describedby="field.describedBy"
              :invalid="field.invalid"
            />
          </BaseField>

          <div class="text-[13px]">
            <p class="font-medium">Adresse e-mail</p>
            <p class="mt-1 text-fg-muted">
              {{ auth.user?.email }}
              <template v-if="!isDemo">
                ·
                <RouterLink
                  :to="{ name: 'settings-account' }"
                  class="text-fg underline-offset-4 hover:underline"
                >
                  modifier
                </RouterLink>
              </template>
            </p>
          </div>
        </fieldset>

        <template #footer>
          <span v-if="succeeded" role="status" class="text-[13px] text-up">
            Profil enregistré.
          </span>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="submitting"
            :disabled="isDemo || !dirty"
          >
            Enregistrer
          </BaseButton>
        </template>
      </SettingsSection>
    </form>
  </div>
</template>
