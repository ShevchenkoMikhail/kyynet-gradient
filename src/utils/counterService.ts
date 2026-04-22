/**
 * Simple global counter service backed by the free public API
 * https://abacus.jasoncameron.dev (no auth, no setup).
 *
 * Three counters are tracked:
 *   - `visits`    — page loads (incremented once per browser tab via sessionStorage)
 *   - `gradients` — times a gradient was applied to text
 *   - `copies`    — times an output card was successfully copied
 *
 * Values are cached in localStorage so the UI can show the last known count
 * instantly on revisits, even before the API responds.
 */

const BASE_URL = 'https://abacus.jasoncameron.dev'
const NAMESPACE = 'kyynet-gradient'
const TIMEOUT_MS = 6000

export type CounterKey = 'visits' | 'gradients' | 'copies'

const LS_KEY = (key: CounterKey) => `kyynet-gradient:counter-${key}`

type Listener = (count: number) => void

class CounterService {
  private listeners: Map<CounterKey, Set<Listener>> = new Map()
  private cache: Map<CounterKey, number> = new Map()

  constructor() {
    // Warm cache from localStorage so subscribers see last-known values
    // even before the first API round-trip completes.
    if (typeof window === 'undefined') return
    const keys: CounterKey[] = ['visits', 'gradients', 'copies']
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(LS_KEY(key))
        if (!raw) continue
        const n = parseInt(raw, 10)
        if (Number.isFinite(n) && n >= 0) this.cache.set(key, n)
      } catch {
        // ignore localStorage read errors
      }
    }
  }

  /** Increment and return the new count. Silent on failure. */
  async hit(key: CounterKey): Promise<number | null> {
    return this.call(`${BASE_URL}/hit/${NAMESPACE}/${key}`, key)
  }

  /** Read the current count without incrementing. Silent on failure. */
  async read(key: CounterKey): Promise<number | null> {
    return this.call(`${BASE_URL}/get/${NAMESPACE}/${key}`, key)
  }

  /** Returns last-known count (from memory or localStorage) — sync. */
  getCached(key: CounterKey): number | null {
    return this.cache.get(key) ?? null
  }

  /** Subscribe to updates for a single counter. Returns unsubscribe fn. */
  subscribe(key: CounterKey, listener: Listener): () => void {
    let set = this.listeners.get(key)
    if (!set) {
      set = new Set()
      this.listeners.set(key, set)
    }
    set.add(listener)
    return () => {
      set?.delete(listener)
    }
  }

  private async call(url: string, key: CounterKey): Promise<number | null> {
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) return null
      const data = (await res.json()) as { value?: number }
      if (typeof data.value === 'number' && data.value >= 0) {
        this.setCount(key, data.value)
        return data.value
      }
      return null
    } catch {
      // network / CORS / abort — keep last-known value
      return null
    }
  }

  private setCount(key: CounterKey, value: number): void {
    this.cache.set(key, value)
    this.listeners.get(key)?.forEach(l => l(value))
    try {
      localStorage.setItem(LS_KEY(key), String(value))
    } catch {
      // ignore
    }
  }
}

export const counterService = new CounterService()
