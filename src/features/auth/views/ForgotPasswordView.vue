<script setup lang="ts">
import { ref } from 'vue'

import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseField from '@/shared/ui/BaseField.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import { useAuthStore } from '../auth.store'
import AuthCard from '../components/AuthCard.vue'
import FormAlert from '../components/FormAlert.vue'
import { authErrorMessage } from '../messages'
import { passwordResetSchema } from '../schemas'

const auth = useAuthStore()
const sentTo = ref<string | null>(null)

const { values, errors, formError, submitting, handleSubmit } = useZodForm(
  passwordResetSchema,
  { email: '' },
  { errorMessage: authErrorMessage },
)

const onSubmit = handleSubmit(async ({ email }) => {
  await auth.requestPasswordReset(email)
  sentTo.value = email
})
</script>

<template>
  <AuthCard
    title="Mot de passe oublié"
    description="Indiquez votre e-mail, nous vous enverrons un lien pour en choisir un nouveau."
  >
    <!-- Same answer whether the account exists or not: the page reveals nothing. -->
    <div v-if="sentTo" class="flex flex-col gap-4">
      <FormAlert tone="success">
        Si un compte existe pour <strong class="font-medium">{{ sentTo }}</strong
        >, un lien de réinitialisation vient d’être envoyé.
      </FormAlert>
      <p class="text-xs text-fg-muted">
        Version de démonstration : aucun e-mail n’est réellement envoyé.
      </p>
      <BaseButton class="h-9 w-full" @click="sentTo = null">Utiliser une autre adresse</BaseButton>
    </div>

    <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <FormAlert v-if="formError">{{ formError }}</FormAlert>

      <BaseField v-slot="field" label="Adresse e-mail" :error="errors.email">
        <BaseInput
          :id="field.id"
          v-model="values.email"
          type="email"
          autocomplete="email"
          inputmode="email"
          :aria-describedby="field.describedBy"
          :invalid="field.invalid"
        />
      </BaseField>

      <BaseButton type="submit" variant="primary" class="h-9 w-full" :loading="submitting">
        Envoyer le lien
      </BaseButton>
    </form>

    <template #footer>
      <RouterLink
        :to="{ name: 'login' }"
        class="font-medium text-fg underline-offset-4 hover:underline"
      >
        Retour à la connexion
      </RouterLink>
    </template>
  </AuthCard>
</template>
