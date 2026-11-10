<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseField from '@/shared/ui/BaseField.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BasePasswordInput from '@/shared/ui/BasePasswordInput.vue'
import { useAuthStore } from '../auth.store'
import AuthCard from '../components/AuthCard.vue'
import FormAlert from '../components/FormAlert.vue'
import { authErrorMessage } from '../messages'
import { safeRedirect } from '../redirect'
import { PASSWORD_MIN_LENGTH, signUpSchema } from '../schemas'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const { values, errors, formError, submitting, handleSubmit } = useZodForm(
  signUpSchema,
  { name: '', email: '', password: '' },
  { errorMessage: authErrorMessage },
)

const onSubmit = handleSubmit(async (data) => {
  await auth.signUp(data)
  await router.replace(safeRedirect(route.query.redirect) ?? { name: 'sites' })
})
</script>

<template>
  <AuthCard title="Créer un compte" description="Gratuit, sans carte bancaire, sans cookies.">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <FormAlert v-if="formError">{{ formError }}</FormAlert>

      <BaseField v-slot="field" label="Nom" :error="errors.name">
        <BaseInput
          :id="field.id"
          v-model="values.name"
          autocomplete="name"
          :aria-describedby="field.describedBy"
          :invalid="field.invalid"
        />
      </BaseField>

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

      <BaseField
        v-slot="field"
        label="Mot de passe"
        :hint="`${PASSWORD_MIN_LENGTH} caractères minimum. Une phrase facile à retenir fonctionne très bien.`"
        :error="errors.password"
      >
        <BasePasswordInput
          :id="field.id"
          v-model="values.password"
          autocomplete="new-password"
          :aria-describedby="field.describedBy"
          :invalid="field.invalid"
        />
      </BaseField>

      <BaseButton type="submit" variant="primary" class="mt-1 h-9 w-full" :loading="submitting">
        Créer mon compte
      </BaseButton>
    </form>

    <template #footer>
      Déjà un compte ?
      <RouterLink
        :to="{ name: 'login', query: route.query }"
        class="font-medium text-fg underline-offset-4 hover:underline"
      >
        Se connecter
      </RouterLink>
    </template>
  </AuthCard>
</template>
