<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

import { useAuthStore } from '@/features/auth/auth.store'
import FormAlert from '@/features/auth/components/FormAlert.vue'
import { authErrorMessage } from '@/features/auth/messages'
import { accountDeletionSchema } from '@/features/auth/schemas'
import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseField from '@/shared/ui/BaseField.vue'
import BasePasswordInput from '@/shared/ui/BasePasswordInput.vue'

/**
 * Account deletion, confirmed in an alert dialog: Reka's AlertDialog traps focus,
 * starts on "Annuler" (the safe choice) and is not closed by a click outside.
 * The password is asked again: deleting is the most destructive action there is.
 */
defineProps<{ disabled?: boolean }>()

const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

const { values, errors, formError, submitting, reset, handleSubmit } = useZodForm(
  accountDeletionSchema,
  { currentPassword: '' },
  { errorMessage: authErrorMessage },
)

const onSubmit = handleSubmit(async (data) => {
  await auth.deleteAccount(data)
  open.value = false
  await router.replace({ name: 'login', query: { deleted: '1' } })
})

function onOpenChange(value: boolean) {
  open.value = value
  if (!value) reset()
}
</script>

<template>
  <AlertDialogRoot :open @update:open="onOpenChange">
    <AlertDialogTrigger as-child>
      <BaseButton variant="danger" :disabled>Supprimer mon compte</BaseButton>
    </AlertDialogTrigger>

    <AlertDialogPortal>
      <AlertDialogOverlay
        class="fixed inset-0 z-40 bg-fg/30 backdrop-blur-[2px] motion-safe:data-[state=open]:animate-[fade-in_150ms_ease-out]"
      />
      <AlertDialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-pop sm:p-6"
      >
        <AlertDialogTitle class="text-base font-semibold tracking-tight">
          Supprimer définitivement votre compte ?
        </AlertDialogTitle>
        <AlertDialogDescription class="mt-2 text-[13px] text-fg-muted">
          Votre profil et vos sites seront effacés. Cette action est irréversible.
        </AlertDialogDescription>

        <form class="mt-5 flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
          <FormAlert v-if="formError">{{ formError }}</FormAlert>

          <BaseField
            v-slot="field"
            label="Mot de passe actuel, pour confirmer"
            :error="errors.currentPassword"
          >
            <BasePasswordInput
              :id="field.id"
              v-model="values.currentPassword"
              autocomplete="current-password"
              :aria-describedby="field.describedBy"
              :invalid="field.invalid"
            />
          </BaseField>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel as-child>
              <BaseButton>Annuler</BaseButton>
            </AlertDialogCancel>
            <BaseButton type="submit" variant="danger" :loading="submitting">
              Supprimer définitivement
            </BaseButton>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
