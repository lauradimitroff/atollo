<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

import BaseButton from '@/shared/ui/BaseButton.vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

/**
 * Application shell.
 * - From `lg` (1024 px): fixed sidebar + content.
 * - Below: the same sidebar opens in a drawer. Reka's Dialog traps focus inside it,
 *   closes on Escape / overlay click and gives focus back to the menu button.
 */
const drawerOpen = ref(false)

// Close the drawer after navigating from it.
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)
</script>

<template>
  <a
    href="#main"
    class="sr-only z-50 rounded-lg bg-surface px-3 py-2 shadow-pop focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
  >
    Aller au contenu
  </a>

  <div class="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
    <aside class="hidden border-r border-line lg:block">
      <div class="sticky top-0 h-dvh overflow-y-auto">
        <AppSidebar />
      </div>
    </aside>

    <DialogRoot v-model:open="drawerOpen">
      <DialogPortal>
        <DialogOverlay
          class="fixed inset-0 z-40 bg-fg/30 backdrop-blur-[2px] motion-safe:data-[state=open]:animate-[fade-in_150ms_ease-out] lg:hidden"
        />
        <DialogContent
          class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-canvas shadow-pop motion-safe:data-[state=open]:animate-[drawer-in_200ms_ease-out] lg:hidden"
        >
          <DialogTitle class="sr-only">Navigation</DialogTitle>
          <DialogClose as-child>
            <BaseButton
              icon-only
              variant="ghost"
              class="absolute top-4 right-3"
              aria-label="Fermer la navigation"
            >
              <X aria-hidden="true" />
            </BaseButton>
          </DialogClose>
          <AppSidebar />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <div class="flex min-w-0 flex-col">
      <AppTopbar @open-menu="drawerOpen = true" />
      <main id="main" tabindex="-1" class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-7">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
  }
}
@keyframes drawer-in {
  from {
    transform: translateX(-100%);
  }
}
</style>
