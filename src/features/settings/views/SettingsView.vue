<script setup lang="ts">
const tabs = [
  { label: 'Profil', to: { name: 'settings-profile' } },
  { label: 'Compte', to: { name: 'settings-account' } },
  { label: 'Sites', to: { name: 'settings-sites' } },
  { label: 'Apparence', to: { name: 'settings-appearance' } },
] as const
</script>

<template>
  <div class="flex flex-col gap-6">
    <nav aria-label="Sections des paramètres" class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul class="flex gap-5 border-b border-line">
        <li v-for="tab in tabs" :key="tab.label">
          <RouterLink
            :to="tab.to"
            class="-mb-px block border-b-2 border-transparent pb-2.5 text-[13px] whitespace-nowrap text-fg-muted transition-colors hover:text-fg [&.router-link-exact-active]:border-accent [&.router-link-exact-active]:font-medium [&.router-link-exact-active]:text-fg"
          >
            {{ tab.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <RouterView />
  </div>
</template>
