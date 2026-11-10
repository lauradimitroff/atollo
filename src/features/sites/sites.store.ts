import { shallowRef } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from '@/features/auth/auth.store'
import { sitesService } from './data'
import type { Site, SiteInput } from './types'

/**
 * The sites of the signed-in account. Global like the user: the router guard, the
 * sidebar, the home page and the settings all read the same list.
 * Loaded once per account; switching account (sign out, sign in) loads the new list.
 */
export const useSitesStore = defineStore('sites', () => {
  const auth = useAuthStore()
  const sites = shallowRef<Site[]>([])
  let loadedFor: string | null = null
  let loading: Promise<void> = Promise.resolve()

  function ownerId() {
    const id = auth.user?.id
    if (!id) throw new Error('No signed-in account')
    return id
  }

  /** Makes sure the list belongs to the signed-in account; cheap when it already does. */
  function load() {
    const owner = auth.user?.id ?? null
    if (owner === loadedFor) return loading
    loadedFor = owner
    sites.value = []
    if (owner === null) return (loading = Promise.resolve())
    loading = sitesService.list(owner).then(
      (list) => {
        if (loadedFor === owner) sites.value = list
      },
      (error: unknown) => {
        loadedFor = null
        throw error
      },
    )
    return loading
  }

  const find = (id: string) => sites.value.find((site) => site.id === id)

  async function create(input: SiteInput) {
    const site = await sitesService.create(ownerId(), input)
    sites.value = [...sites.value, site]
    return site
  }

  async function update(id: string, input: SiteInput) {
    const site = await sitesService.update(ownerId(), id, input)
    sites.value = sites.value.map((current) => (current.id === id ? site : current))
    return site
  }

  async function remove(id: string) {
    await sitesService.remove(ownerId(), id)
    sites.value = sites.value.filter((site) => site.id !== id)
  }

  /** After the account itself is deleted: its sites go with it. */
  async function removeAllOf(owner: string) {
    await sitesService.removeAll(owner)
    if (loadedFor === owner) sites.value = []
  }

  return { sites, load, find, create, update, remove, removeAllOf }
})
