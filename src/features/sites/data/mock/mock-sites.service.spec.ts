// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'

import { DEMO_SITES } from '../../demo-sites'
import { SitesError } from '../sites.service'
import { createMockSitesService, SITES_KEY } from './mock-sites.service'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  }
}

let storage: Storage
let sites: ReturnType<typeof createMockSitesService>
const LAURE = 'user-laure'
const OTHER = 'user-other'
const BLOG = { name: 'Mon blog', domain: 'blog.example' }

beforeEach(() => {
  storage = memoryStorage()
  sites = createMockSitesService({ storage, latency: 0 })
})

describe('mock sites service', () => {
  it('starts a new account with no site', async () => {
    expect(await sites.list(LAURE)).toEqual([])
  })

  it('gives the demo account the demo sites, read-only', async () => {
    expect(await sites.list('demo')).toEqual(DEMO_SITES)
    await expect(sites.create('demo', BLOG)).rejects.toEqual(new SitesError('demo-readonly'))
    await expect(sites.remove('demo', DEMO_SITES[0]!.id)).rejects.toEqual(
      new SitesError('demo-readonly'),
    )
  })

  it('adds sites with a short url-safe id, in order', async () => {
    const blog = await sites.create(LAURE, BLOG)
    const shop = await sites.create(LAURE, { name: 'Boutique', domain: 'shop.example' })
    expect(blog.id).toMatch(/^[a-z0-9]{10}$/)
    expect(await sites.list(LAURE)).toEqual([blog, shop])
  })

  it('only shows an account its own sites', async () => {
    await sites.create(LAURE, BLOG)
    const theirs = await sites.create(OTHER, BLOG)
    expect(await sites.list(OTHER)).toEqual([theirs])
    // Same domain, other account: allowed. Same account: refused.
    await expect(sites.create(LAURE, BLOG)).rejects.toEqual(new SitesError('domain-taken'))
  })

  it('edits a site, keeping its id', async () => {
    const blog = await sites.create(LAURE, BLOG)
    const edited = await sites.update(LAURE, blog.id, { name: 'Carnet', domain: 'blog.example' })
    expect(edited).toEqual({ id: blog.id, name: 'Carnet', domain: 'blog.example' })
    expect(await sites.list(LAURE)).toEqual([edited])
  })

  it('never lets an account touch the site of another', async () => {
    const theirs = await sites.create(OTHER, BLOG)
    await expect(sites.update(LAURE, theirs.id, BLOG)).rejects.toEqual(new SitesError('not-found'))
    await expect(sites.remove(LAURE, theirs.id)).rejects.toEqual(new SitesError('not-found'))
  })

  it('removes one site, or all of them with the account', async () => {
    const blog = await sites.create(LAURE, BLOG)
    await sites.create(LAURE, { name: 'Boutique', domain: 'shop.example' })
    await sites.create(OTHER, BLOG)

    await sites.remove(LAURE, blog.id)
    expect(await sites.list(LAURE)).toHaveLength(1)

    await sites.removeAll(LAURE)
    expect(await sites.list(LAURE)).toEqual([])
    expect(await sites.list(OTHER)).toHaveLength(1)
    expect(JSON.parse(storage.getItem(SITES_KEY) ?? '[]')).toHaveLength(1)
  })
})
