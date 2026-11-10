<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

import BaseInput from './BaseInput.vue'

/**
 * Password field with a show / hide button: typing a long passphrase blind,
 * on a phone especially, is where most typos come from.
 */
defineOptions({ inheritAttrs: false })
defineProps<{ invalid?: boolean }>()

const model = defineModel<string>({ default: '' })
const visible = ref(false)
</script>

<template>
  <div class="relative">
    <!-- id, autocomplete, aria-describedby… go to the input itself. -->
    <BaseInput
      v-model="model"
      v-bind="$attrs"
      :type="visible ? 'text' : 'password'"
      :invalid
      class="pr-10"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-lg text-fg-subtle transition-colors hover:text-fg"
      :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <EyeOff v-if="visible" class="size-4" aria-hidden="true" />
      <Eye v-else class="size-4" aria-hidden="true" />
    </button>
  </div>
</template>
