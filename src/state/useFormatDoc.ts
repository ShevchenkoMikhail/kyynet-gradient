import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useUndoable } from './useUndoable'
import { encodeAll } from '../engine/encoders'
import type { Gradient, Segment, StyleFlags } from '../engine/types'
import { emptyStyles } from '../engine/types'
import { colorsForN } from '../engine/gradient/interpolate'
import { takeNextGradientIdFromExisting } from '../engine/gradient/apply'
import { PERSIST_KEY } from '../constants/defaults'
import { decodeDocFromHash, encodeDocToHash } from '../utils/share'

type PersistedDoc = {
  segments: Segment[]
  gradients: Record<string, Gradient>
}

const PERSIST_VERSION = 2
const HASH_PREFIX = '#d='

function seedSegments(): Segment[] {
  const seed = 'Привет мир Minecraft!'
  return Array.from(seed, char => ({
    char,
    color: null,
    styles: emptyStyles(),
  }))
}

const INITIAL: PersistedDoc = {
  segments: seedSegments(),
  gradients: {},
}

function readInitialDoc(): PersistedDoc {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash
    if (hash.startsWith(HASH_PREFIX)) {
      const payload = hash.slice(HASH_PREFIX.length)
      const decoded = decodeDocFromHash(payload)
      if (decoded) return decoded
    }
  }
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return INITIAL
    const parsed = JSON.parse(raw)
    if (parsed?.__v === PERSIST_VERSION && parsed.data) {
      return parsed.data as PersistedDoc
    }
  } catch {
    // ignore
  }
  return INITIAL
}

export function useFormatDoc() {
  const initial = useMemo(() => readInitialDoc(), [])
  const history = useUndoable<PersistedDoc>(initial)
  const doc = history.value

  // Persist to localStorage (debounced)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (persistTimerRef.current !== undefined) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          PERSIST_KEY,
          JSON.stringify({ __v: PERSIST_VERSION, data: doc, savedAt: Date.now() }),
        )
      } catch {
        // ignore (quota, private mode, etc.)
      }
    }, 400)
    return () => {
      if (persistTimerRef.current !== undefined) clearTimeout(persistTimerRef.current)
    }
  }, [doc])

  // Sync URL hash (throttled)
  const hashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (hashTimerRef.current !== undefined) clearTimeout(hashTimerRef.current)
    hashTimerRef.current = setTimeout(() => {
      try {
        const hash = HASH_PREFIX + encodeDocToHash(doc)
        if (window.location.hash !== hash) {
          window.history.replaceState(null, '', hash)
        }
      } catch {
        // ignore
      }
    }, 600)
    return () => {
      if (hashTimerRef.current !== undefined) clearTimeout(hashTimerRef.current)
    }
  }, [doc])

  const text = useMemo(
    () => doc.segments.map(s => s.char).join(''),
    [doc.segments],
  )

  const setText = useCallback(
    (nextText: string) =>
      history.set(prev => ({
        ...prev,
        segments: syncSegmentsToText(prev.segments, nextText),
      })),
    [history],
  )

  const applyToRange = useCallback(
    (
      start: number,
      end: number,
      updater: (seg: Segment, indexInRange: number, rangeLen: number) => Segment,
    ) => {
      history.set(prev => {
        const segs = prev.segments
        const s = Math.max(0, Math.min(segs.length, start))
        const e = Math.max(s, Math.min(segs.length, end))
        if (e <= s) return prev
        const next = [...segs]
        for (let i = s; i < e; i++) {
          next[i] = updater(next[i], i - s, e - s)
        }
        return { ...prev, segments: next }
      })
    },
    [history],
  )

  const applyColor = useCallback(
    (start: number, end: number, hex: string | null) => {
      applyToRange(start, end, seg => {
        const { gradientId: _gid, ...rest } = seg
        return { ...rest, color: hex }
      })
    },
    [applyToRange],
  )

  const applyStyleToggle = useCallback(
    (start: number, end: number, key: keyof StyleFlags) => {
      history.set(prev => {
        const segs = prev.segments
        const s = Math.max(0, Math.min(segs.length, start))
        const e = Math.max(s, Math.min(segs.length, end))
        if (e <= s) return prev
        const allHave = segs.slice(s, e).every(seg => seg.styles[key])
        const next = [...segs]
        for (let i = s; i < e; i++) {
          next[i] = {
            ...next[i],
            styles: { ...next[i].styles, [key]: !allHave },
          }
        }
        return { ...prev, segments: next }
      })
    },
    [history],
  )

  const applyResetRange = useCallback(
    (start: number, end: number) => {
      applyToRange(start, end, seg => ({
        char: seg.char,
        color: null,
        styles: emptyStyles(),
      }))
    },
    [applyToRange],
  )

  const applyGradient = useCallback(
    (start: number, end: number, stops: Gradient['stops']) => {
      const n = end - start
      if (n <= 0 || stops.length < 2) return
      history.set(prev => {
        const gid = takeNextGradientIdFromExisting(prev.gradients)
        const segs = prev.segments
        const s = Math.max(0, Math.min(segs.length, start))
        const e = Math.max(s, Math.min(segs.length, end))
        if (e <= s) return prev
        const colors = colorsForN(stops, e - s)
        const next = [...segs]
        for (let i = s; i < e; i++) {
          next[i] = {
            ...next[i],
            color: colors[i - s],
            gradientId: gid,
          }
        }
        return {
          segments: next,
          gradients: {
            ...prev.gradients,
            [gid]: { id: gid, stops: stops.map(p => ({ ...p })) },
          },
        }
      })
    },
    [history],
  )

  const clearAllFormatting = useCallback(() => {
    history.set(prev => ({
      gradients: {},
      segments: prev.segments.map(s => ({
        char: s.char,
        color: null,
        styles: emptyStyles(),
      })),
    }))
  }, [history])

  const replaceSegments = useCallback(
    (segments: Segment[], gradients: Record<string, Gradient> = {}) => {
      history.set(() => ({ segments, gradients }))
    },
    [history],
  )

  const outputs = useMemo(
    () => encodeAll(doc.segments, doc.gradients),
    [doc.segments, doc.gradients],
  )

  return {
    text,
    setText,
    segments: doc.segments,
    gradients: doc.gradients,
    outputs,
    applyColor,
    applyStyleToggle,
    applyResetRange,
    applyGradient,
    clearAllFormatting,
    replaceSegments,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  }
}

export function syncSegmentsToText(
  oldSegments: Segment[],
  newText: string,
): Segment[] {
  const oldChars = oldSegments.map(s => s.char)
  const oldLen = oldChars.length
  const newLen = newText.length

  let L = 0
  while (L < oldLen && L < newLen && oldChars[L] === newText[L]) L++

  let R = 0
  while (
    R < oldLen - L &&
    R < newLen - L &&
    oldChars[oldLen - 1 - R] === newText[newLen - 1 - R]
  ) R++

  const keepEnd = oldLen - R
  const insertedChars = newText.slice(L, newLen - R)

  const inheritSeg =
    oldSegments[L - 1] ??
    oldSegments[L] ??
    { char: '', color: null, styles: emptyStyles() }

  const newFromInsert: Segment[] = Array.from(insertedChars, char => ({
    char,
    color: inheritSeg.color,
    styles: { ...inheritSeg.styles },
    ...(inheritSeg.gradientId ? { gradientId: inheritSeg.gradientId } : {}),
  }))

  return [
    ...oldSegments.slice(0, L),
    ...newFromInsert,
    ...oldSegments.slice(keepEnd),
  ]
}
