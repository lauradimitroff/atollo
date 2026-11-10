<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Sparkles } from '@lucide/vue'

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
import { signInSchema } from '../schemas'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

/** Back to the page that was asked for before signing in, if any. */
const goToApp = () => router.replace(safeRedirect(route.query.redirect) ?? { name: 'sites' })

const { values, errors, formError, submitting, handleSubmit } = useZodForm(
  signInSchema,
  { email: '', password: '' },
  { errorMessage: authErrorMessage },
)

const onSubmit = handleSubmit(async (data) => {
  await auth.signIn(data)
  await goToApp()
})

const demoLoading = ref(false)
const demoError = ref<string | null>(null)

async function openDemo() {
  demoLoading.value = true
  demoError.value = null
  try {
    await auth.signInAsDemo()
    await goToApp()
  } catch (error) {
    demoError.value = authErrorMessage(error)
  } finally {
    demoLoading.value = false
  }
}
</script>

<template>
  <AuthCard
    title="Bienvenue sur Atollo"
    description="Analytics multi-sites, sans cookies ni pistage."
  >
    <!-- The demo first: most visitors of this portfolio project have no account. -->
    <template #before>
      <section class="rounded-xl bg-brand-gradient p-px shadow-pop" aria-labelledby="demo-title">
        <div class="flex flex-col gap-4 rounded-[11px] bg-surface p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white"
              aria-hidden="true"
            >
              <Sparkles class="size-4.5" />
            </span>
            <div>
              <h2 id="demo-title" class="text-[15px] font-semibold tracking-tight">
                Découvrir Atollo sans inscription
              </h2>
              <p class="mt-1 text-[13px] text-fg-muted">
                8 sites fictifs et toutes les fonctionnalités, en un clic.
              </p>
            </div>
          </div>

          <FormAlert v-if="demoError">{{ demoError }}</FormAlert>
          <BaseButton
            variant="primary"
            class="h-10 w-full text-sm"
            :loading="demoLoading"
            @click="openDemo"
          >
            Explorer la démo
            <ArrowRight aria-hidden="true" />
          </BaseButton>
        </div>
      </section>

      <div class="flex items-center gap-3 text-xs text-fg-subtle">
        <span class="h-px flex-1 bg-line" aria-hidden="true" />
        Vous avez déjà un compte ?
        <span class="h-px flex-1 bg-line" aria-hidden="true" />
      </div>
    </template>

    <FormAlert v-if="route.query.deleted" tone="success" class="mb-4">
      Votre compte a bien été supprimé.
    </FormAlert>

    <!-- novalidate: our own messages, consistent across browsers and read by screen readers. -->
    <form class="flex flex-col gap-4" novalidate aria-label="Connexion" @submit.prevent="onSubmit">
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

      <BaseField v-slot="field" label="Mot de passe" :error="errors.password">
        <BasePasswordInput
          :id="field.id"
          v-model="values.password"
          autocomplete="current-password"
          :aria-describedby="field.describedBy"
          :invalid="field.invalid"
        />
      </BaseField>

      <RouterLink
        :to="{ name: 'forgot-password' }"
        class="-mt-1 w-fit text-xs text-fg-muted underline-offset-4 hover:text-fg hover:underline"
      >
        Mot de passe oublié ?
      </RouterLink>

      <BaseButton type="submit" class="h-9 w-full" :loading="submitting"> Se connecter </BaseButton>
    </form>

    <template #footer>
      Pas encore de compte ?
      <RouterLink
        :to="{ name: 'register', query: route.query }"
        class="font-medium text-fg underline-offset-4 hover:underline"
      >
        Créer un compte
      </RouterLink>
    </template>
  </AuthCard>
</template>
