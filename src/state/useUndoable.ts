import { useCallback, useRef, useState } from 'react'

type HistoryState<T> = {
  past: T[]
  present: T
  future: T[]
}

export type UndoableStore<T> = {
  value: T
  set: (next: T | ((prev: T) => T)) => void
  /** Replace present without recording a history entry (for programmatic loads). */
  replace: (next: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const MAX_HISTORY = 60

export function useUndoable<T>(initial: T): UndoableStore<T> {
  const [state, setState] = useState<HistoryState<T>>(() => ({
    past: [],
    present: initial,
    future: [],
  }))
  const presentRef = useRef(state.present)
  presentRef.current = state.present

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState(s => {
      const nextVal = typeof next === 'function'
        ? (next as (p: T) => T)(s.present)
        : next
      if (Object.is(nextVal, s.present)) return s
      const newPast = s.past.length >= MAX_HISTORY
        ? [...s.past.slice(1), s.present]
        : [...s.past, s.present]
      return { past: newPast, present: nextVal, future: [] }
    })
  }, [])

  const replace = useCallback((next: T) => {
    setState(s => ({ ...s, present: next, future: [] }))
  }, [])

  const undo = useCallback(() => {
    setState(s => {
      if (s.past.length === 0) return s
      const newPast = [...s.past]
      const prev = newPast.pop()!
      return { past: newPast, present: prev, future: [...s.future, s.present] }
    })
  }, [])

  const redo = useCallback(() => {
    setState(s => {
      if (s.future.length === 0) return s
      const newFuture = [...s.future]
      const next = newFuture.pop()!
      return { past: [...s.past, s.present], present: next, future: newFuture }
    })
  }, [])

  return {
    value: state.present,
    set,
    replace,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
