import { useEffect, useState } from 'react'

let listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | undefined
let visibilityHandler: (() => void) | undefined

const TICK_MS = 60

function ensureRunning() {
  if (intervalId !== undefined) return
  intervalId = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    listeners.forEach(l => l())
  }, TICK_MS)
  if (typeof document !== 'undefined' && !visibilityHandler) {
    visibilityHandler = () => {}
    document.addEventListener('visibilitychange', visibilityHandler)
  }
}

function stopIfIdle() {
  if (listeners.size === 0 && intervalId !== undefined) {
    clearInterval(intervalId)
    intervalId = undefined
  }
}

export function useObfuscatedTick(): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const notify = () => setTick(t => t + 1)
    listeners.add(notify)
    ensureRunning()
    return () => {
      listeners.delete(notify)
      stopIfIdle()
    }
  }, [])
  return tick
}
