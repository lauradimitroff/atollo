<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Info } from '@lucide/vue'

import { useAuthStore } from '@/features/auth/auth.store'
import BaseButton from '@/shared/ui/BaseButton.vue'

/** Explains why the settings of the shared demo account are locked, and how to try them. */
const auth = useAuthStore()
const router = useRouter()
const leaving = ref(false)

async function createAccount() {
  leaving.value = true
  await auth.signOut()
  await router.push({ name: 'register' })
}
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
    role="note"
  >
    <p class="flex items-start gap-2.5 text-[13px]">
      <Info class="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <span>
        <strong class="font-medium">Compte de démonstration :</strong>
        il est partagé, ses réglages sont donc verrouillés. Créez un compte gratuit pour les
        essayer.
      </span>
    </p>
    <BaseButton class="shrink-0" :loading="leaving" @click="createAccount">
      Créer un compte
    </BaseButton>
  </div>
</template>
