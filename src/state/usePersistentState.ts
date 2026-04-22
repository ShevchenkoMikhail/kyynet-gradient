import { useEffect, useRef, useState } from 'react'

export function usePersistentState<T>(
  key: string,
  initial: T,
  options: { version?: number; debounceMs?: number } = {},
): [T, (next: T | ((prev: T) => T)) => void] {
  const { version = 1, debounceMs = 500 } = options

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      const parsed = JSON.parse(raw)
      if (parsed && parsed.__v === version && 'data' in parsed) {
        return parsed.data as T
      }
      return initial
    } catch {
      return initial
    }
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ __v: version, data: state, savedAt: Date.now() }),
        )
      } catch {
        // ignore (quota, privacy mode, etc.)
      }
    }, debounceMs)
    return () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    }
  }, [state, key, version, debounceMs])

  return [state, setState]
}
