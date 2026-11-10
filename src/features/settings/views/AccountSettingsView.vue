<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/features/auth/auth.store'
import FormAlert from '@/features/auth/components/FormAlert.vue'
import { authErrorMessage } from '@/features/auth/messages'
import {
  emailChangeSchema,
  PASSWORD_MIN_LENGTH,
  passwordChangeSchema,
} from '@/features/auth/schemas'
import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseField from '@/shared/ui/BaseField.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BasePasswordInput from '@/shared/ui/BasePasswordInput.vue'
import DeleteAccountDialog from '../components/DeleteAccountDialog.vue'
import DemoNotice from '../components/DemoNotice.vue'
import SettingsSection from '../components/SettingsSection.vue'

const auth = useAuthStore()
const isDemo = computed(() => auth.user?.isDemo ?? false)

const emailForm = useZodForm(
  emailChangeSchema,
  { email: '', currentPassword: '' },
  { errorMessage: authErrorMessage },
)
const onEmailSubmit = emailForm.handleSubmit(async (data) => {
  await auth.updateEmail(data)
  emailForm.reset()
})

const passwordForm = useZodForm(
  passwordChangeSchema,
  { currentPassword: '', newPassword: '' },
  { errorMessage: authErrorMessage },
)
const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
  await auth.updatePassword(data)
  passwordForm.reset()
})

// Destructured for the template: refs inside a plain object are not unwrapped there.
const { values: email, errors: emailErrors } = emailForm
const { values: password, errors: passwordErrors } = passwordForm
</script>

<template>
  <div class="flex flex-col gap-5">
    <DemoNotice v-if="isDemo" />

    <form novalidate @submit.prevent="onEmailSubmit">
      <SettingsSection
        title="Adresse e-mail"
        description="Elle sert à vous connecter et à recevoir les liens de réinitialisation."
      >
        <p class="text-[13px]">
          Adresse actuelle : <strong class="font-medium">{{ auth.user?.email }}</strong>
        </p>
        <FormAlert v-if="emailForm.formError.value">{{ emailForm.formError.value }}</FormAlert>

        <fieldset :disabled="isDemo" class="grid gap-4 sm:grid-cols-2">
          <BaseField v-slot="field" label="Nouvelle adresse" :error="emailErrors.email">
            <BaseInput
              :id="field.id"
              v-model="email.email"
              type="email"
              autocomplete="email"
              inputmode="email"
              :aria-describedby="field.describedBy"
              :invalid="field.invalid"
            />
          </BaseField>
          <BaseField
            v-slot="field"
            label="Mot de passe actuel"
            :error="emailErrors.currentPassword"
          >
            <BasePasswordInput
              :id="field.id"
              v-model="email.currentPassword"
              autocomplete="current-password"
              :aria-describedby="field.describedBy"
              :invalid="field.invalid"
            />
          </BaseField>
        </fieldset>

        <template #footer>
          <span v-if="emailForm.succeeded.value" role="status" class="text-[13px] text-up">
            Adresse e-mail mise à jour.
          </span>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="emailForm.submitting.value"
            :disabled="isDemo"
          >
            Changer l’adresse
          </BaseButton>
        </template>
      </SettingsSection>
    </form>

    <form novalidate @submit.prevent="onPasswordSubmit">
      <SettingsSection
        title="Mot de passe"
        description="Une phrase longue et facile à retenir est plus sûre qu’un mot court et compliqué."
      >
        <FormAlert v-if="passwordForm.formError.value">
          {{ passwordForm.formError.value }}
        </FormAlert>

        <fieldset :disabled="isDemo" class="grid gap-4 sm:grid-cols-2">
          <BaseField
            v-slot="field"
            label="Mot de passe actuel"
            :error="passwordErrors.currentPassword"
          >
            <BasePasswordInput
              :id="field.id"
              v-model="password.currentPassword"
              autocomplete="current-password"
              :aria-describedby="field.describedBy"
              :invalid="field.invalid"
            />
          </BaseField>
          <BaseField
            v-slot="field"
            label="Nouveau mot de passe"
            :hint="`${PASSWORD_MIN_LENGTH} caractères minimum.`"
            :error="passwordErrors.newPassword"
          >
            <BasePasswordInput
              :id="field.id"
              v-model="password.newPassword"
              autocomplete="new-password"
              :aria-describedby="field.describedBy"
              :invalid="field.invalid"
            />
          </BaseField>
        </fieldset>

        <template #footer>
          <span v-if="passwordForm.succeeded.value" role="status" class="text-[13px] text-up">
            Mot de passe modifié.
          </span>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="passwordForm.submitting.value"
            :disabled="isDemo"
          >
            Changer le mot de passe
          </BaseButton>
        </template>
      </SettingsSection>
    </form>

    <SettingsSection
      title="Supprimer le compte"
      description="Efface votre profil et tous vos sites. Il n’y a pas de retour possible."
      danger
    >
      <div>
        <DeleteAccountDialog :disabled="isDemo" />
      </div>
    </SettingsSection>
  </div>
</template>
