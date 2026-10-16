import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { COMPARE_FULL_MESSAGE, useCompareStore } from '../../app/stores/compare'

// The store calls Nuxt's `useCookie` auto-import when instantiated (not at
// import time), so stubbing it here — before any `useCompareStore()` call —
// lets the store run in the node (unit) environment: no Nuxt runtime, no
// happy-dom. One shared ref is fine: every test resets it and gets a fresh
// Pinia.
const cookieRef = ref<unknown>(null)
vi.stubGlobal('useCookie', () => cookieRef)

describe('useCompareStore — the 3-product limit (F6)', () => {
  beforeEach(() => {
    cookieRef.value = null
    setActivePinia(createPinia())
  })

  it('adds up to 3 products', () => {
    const compare = useCompareStore()
    compare.add(1)
    compare.add(2)
    compare.add(3)
    expect([...compare.ids]).toEqual([1, 2, 3])
    expect(compare.isFull).toBe(true)
  })

  it('refuses the 4th product and announces instead', async () => {
    const compare = useCompareStore()
    compare.replace([1, 2, 3])

    compare.add(4)

    // Nothing added…
    expect([...compare.ids]).toEqual([1, 2, 3])
    // …and the full message is announced. `announceFull` clears then re-sets
    // the text on the next microtask so screen readers re-fire it, so wait a
    // tick before asserting.
    await Promise.resolve()
    expect(compare.announcement).toBe(COMPARE_FULL_MESSAGE)
  })

  it('clears the announcement and accepts a product once a slot frees up', async () => {
    const compare = useCompareStore()
    compare.replace([1, 2, 3])
    compare.add(4)
    await Promise.resolve()
    expect(compare.announcement).toBe(COMPARE_FULL_MESSAGE)

    compare.remove(2)
    expect(compare.announcement).toBe('')

    compare.add(4)
    expect([...compare.ids]).toEqual([1, 3, 4])
  })

  it('does not announce when toggling an already-selected product off', () => {
    const compare = useCompareStore()
    compare.replace([1, 2, 3])
    compare.toggle(2) // removes, frees a slot
    expect([...compare.ids]).toEqual([1, 3])
    expect(compare.announcement).toBe('')
  })
})
