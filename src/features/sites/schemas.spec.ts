import { describe, expect, it } from 'vitest'

import { normalizeDomain, siteSchema } from './schemas'

describe('normalizeDomain', () => {
  it.each([
    ['monsite.fr', 'monsite.fr'],
    ['  MonSite.FR ', 'monsite.fr'],
    ['https://www.mon-site.fr/blog?x=1#top', 'mon-site.fr'],
    ['http://boutique.mon-site.fr:8080', 'boutique.mon-site.fr'],
    ['www.example.com.', 'example.com'],
  ])('%s → %s', (raw, expected) => {
    expect(normalizeDomain(raw)).toBe(expected)
  })
})

describe('siteSchema', () => {
  it('keeps the bare domain and a trimmed name', () => {
    expect(siteSchema.parse({ name: ' Mon blog ', domain: 'https://www.blog.example/' })).toEqual({
      name: 'Mon blog',
      domain: 'blog.example',
    })
  })

  it.each(['', 'localhost', 'mon site.fr', '-abc.fr', 'abc.f', 'https://'])(
    'refuses the domain "%s"',
    (domain) => {
      expect(siteSchema.safeParse({ name: 'Site', domain }).success).toBe(false)
    },
  )

  it('needs a name', () => {
    const result = siteSchema.safeParse({ name: '  ', domain: 'blog.example' })
    expect(result.error?.issues[0]?.message).toBe('Donnez un nom au site.')
  })
})
