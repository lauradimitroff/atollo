<script setup lang="ts">
import { computed, ref } from 'vue'
import { CircleCheck, X } from '@lucide/vue'

import { useAuthStore } from '@/features/auth/auth.store'
import FormAlert from '@/features/auth/components/FormAlert.vue'
import DeleteSiteDialog from '@/features/sites/components/DeleteSiteDialog.vue'
import EditSiteDialog from '@/features/sites/components/EditSiteDialog.vue'
import SiteFavicon from '@/features/sites/components/SiteFavicon.vue'
import SiteFields from '@/features/sites/components/SiteFields.vue'
import TrackingSnippet from '@/features/sites/components/TrackingSnippet.vue'
import { sitesErrorMessage } from '@/features/sites/messages'
import { siteSchema } from '@/features/sites/schemas'
import { useSitesStore } from '@/features/sites/sites.store'
import { useZodForm } from '@/shared/composables/useZodForm'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseDialog from '@/shared/ui/BaseDialog.vue'
import DemoNotice from '../components/DemoNotice.vue'
import SettingsSection from '../components/SettingsSection.vue'

const auth = useAuthStore()
const store = useSitesStore()
const isDemo = computed(() => auth.user?.isDemo ?? false)

/**
 * The site just added: its tracking code is shown right away, it is the next step.
 * Read from the list, so a rename or a deletion right after shows here too.
 */
const createdId = ref<string | null>(null)
const created = computed(() => (createdId.value ? store.find(createdId.value) : undefined))

const { values, errors, formError, submitting, reset, handleSubmit } = useZodForm(
  siteSchema,
  { name: '', domain: '' },
  { errorMessage: sitesErrorMessage },
)

const onSubmit = handleSubmit(async (data) => {
  createdId.value = (await store.create(data)).id
  reset()
})

const countLabel = computed(() => {
  const n = store.sites.length
  return n === 0 ? 'Aucun site pour l’instant.' : n === 1 ? '1 site suivi.' : `${n} sites suivis.`
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <DemoNotice v-if="isDemo" />

    <form novalidate @submit.prevent="onSubmit">
      <SettingsSection
        title="Ajouter un site"
        description="Atollo vous donne ensuite le code de suivi à installer sur le site."
      >
        <FormAlert v-if="formError">{{ formError }}</FormAlert>

        <!-- The confirmation leads straight to the next step: installing the code. -->
        <div v-if="created" class="flex flex-col gap-3 rounded-lg border border-up/30 bg-up/5 p-4">
          <div class="flex items-start justify-between gap-3">
            <p class="flex items-start gap-2 text-[13px]" role="status">
              <CircleCheck class="mt-0.5 size-4 shrink-0 text-up" aria-hidden="true" />
              <span>
                <strong class="font-medium">{{ created.name }}</strong> est ajouté. Installez ce
                code pour recevoir ses premières visites.
              </span>
            </p>
            <BaseButton
              variant="ghost"
              size="sm"
              icon-only
              aria-label="Masquer ce message"
              class="-mt-1 -mr-1"
              @click="createdId = null"
            >
              <X aria-hidden="true" />
            </BaseButton>
          </div>
          <TrackingSnippet :site="created" />
          <RouterLink
            :to="{ name: 'overview', params: { siteId: created.id } }"
            class="w-fit text-[13px] font-medium underline-offset-4 hover:underline"
          >
            Ouvrir son tableau de bord →
          </RouterLink>
        </div>

        <fieldset :disabled="isDemo" class="grid gap-4 sm:grid-cols-2">
          <SiteFields v-model="values" :errors />
        </fieldset>

        <template #footer>
          <BaseButton type="submit" variant="primary" :loading="submitting" :disabled="isDemo">
            Ajouter le site
          </BaseButton>
        </template>
      </SettingsSection>
    </form>

    <SettingsSection title="Vos sites" :description="countLabel">
      <ul v-if="store.sites.length" class="-my-2 divide-y divide-line">
        <li
          v-for="site in store.sites"
          :key="site.id"
          class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <RouterLink
            :to="{ name: 'overview', params: { siteId: site.id } }"
            class="flex min-w-0 items-center gap-2.5 rounded-md"
          >
            <SiteFavicon :name="site.name" />
            <span class="min-w-0 leading-tight">
              <span class="block truncate text-[13px] font-medium">{{ site.name }}</span>
              <span class="block truncate text-xs text-fg-muted">{{ site.domain }}</span>
            </span>
          </RouterLink>

          <div class="flex shrink-0 gap-1.5">
            <BaseDialog
              :title="`Code de suivi de ${site.name}`"
              description="Collez cette ligne une seule fois, dans le modèle commun à toutes les pages du site."
            >
              <template #trigger>
                <BaseButton size="sm">Code de suivi</BaseButton>
              </template>
              <TrackingSnippet :site />
            </BaseDialog>
            <EditSiteDialog :site :disabled="isDemo" />
            <DeleteSiteDialog :site :disabled="isDemo" />
          </div>
        </li>
      </ul>
    </SettingsSection>
  </div>
</template>
