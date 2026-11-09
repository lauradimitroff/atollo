import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { nextSort, useTableState, type SortState } from './useTableState'

interface Row {
  path: string
  visitors: number
  time: number | null
}

const rows: Row[] = [
  { path: '/blog/vue', visitors: 30, time: 120 },
  { path: '/', visitors: 100, time: 40 },
  { path: '/contact', visitors: 30, time: null },
  { path: '/blog/css', visitors: 10, time: 200 },
]

function setup(initial: SortState<'path' | 'visitors' | 'time'>, pageSize = 10) {
  const sort = ref(initial)
  const state = useTableState(rows, {
    columns: { path: (r) => r.path, visitors: (r) => r.visitors, time: (r) => r.time },
    searchText: (r) => r.path,
    sort,
    pageSize,
    tieBreaker: (a, b) => a.path.localeCompare(b.path),
  })
  return { sort, ...state }
}

const paths = (list: readonly Row[]) => list.map((r) => r.path)

describe('useTableState', () => {
  it('sorts numbers, with a stable tie-breaker', () => {
    const { visible } = setup({ key: 'visitors', order: 'desc' })
    expect(paths(visible.value)).toEqual(['/', '/blog/vue', '/contact', '/blog/css'])
  })

  it('sorts text in French alphabetical order', () => {
    const { visible } = setup({ key: 'path', order: 'asc' })
    expect(paths(visible.value)).toEqual(['/', '/blog/css', '/blog/vue', '/contact'])
  })

  it('always puts missing values last', () => {
    const asc = setup({ key: 'time', order: 'asc' })
    const desc = setup({ key: 'time', order: 'desc' })
    const last = (list: readonly Row[]) => list[list.length - 1]!.path
    expect(last(asc.visible.value)).toBe('/contact')
    expect(last(desc.visible.value)).toBe('/contact')
  })

  it('searches case-insensitively and counts the matches', async () => {
    const { search, visible, total } = setup({ key: 'visitors', order: 'desc' })
    search.value = 'BLOG'
    await nextTick()
    expect(paths(visible.value)).toEqual(['/blog/vue', '/blog/css'])
    expect(total.value).toBe(2)
  })

  it('pages the rows and goes back to page 1 on a new search', async () => {
    const { page, pageCount, visible, search } = setup({ key: 'visitors', order: 'desc' }, 3)
    expect(pageCount.value).toBe(2)

    page.value = 2
    expect(paths(visible.value)).toEqual(['/blog/css'])

    search.value = '/'
    await nextTick()
    expect(page.value).toBe(1)
  })
})

describe('nextSort', () => {
  it('flips the order on the same column and starts descending on a new one', () => {
    expect(nextSort({ key: 'visitors', order: 'desc' }, 'visitors')).toEqual({
      key: 'visitors',
      order: 'asc',
    })
    expect(nextSort({ key: 'visitors', order: 'asc' }, 'path')).toEqual({
      key: 'path',
      order: 'desc',
    })
  })
})
