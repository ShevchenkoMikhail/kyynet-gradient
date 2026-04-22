import { useEffect, useState } from 'react'
import { counterService, type CounterKey } from '../utils/counterService'

/**
 * Subscribes to a single global counter. Returns the current value or `null`
 * if no value has been loaded yet (first-ever visit, API still in flight).
 */
export function useCounter(key: CounterKey): number | null {
  const [value, setValue] = useState<number | null>(() => counterService.getCached(key))

  useEffect(() => {
    return counterService.subscribe(key, setValue)
  }, [key])

  return value
}
