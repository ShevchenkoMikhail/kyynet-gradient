import type { Gradient, Segment } from '../engine/types'

export type ShareableDoc = {
  segments: Segment[]
  gradients: Record<string, Gradient>
}

const SHARE_VERSION = 1

/**
 * Encode a doc to a URL-safe base64 payload suitable for location.hash.
 * Compact run-length encoding keeps long texts under ~2KB.
 */
export function encodeDocToHash(doc: ShareableDoc): string {
  const compact = {
    v: SHARE_VERSION,
    t: doc.segments.map(s => s.char).join(''),
    r: segmentsToRuns(doc.segments),
    g: doc.gradients,
  }
  const json = JSON.stringify(compact)
  return toUrlSafeBase64(json)
}

export function decodeDocFromHash(hash: string): ShareableDoc | null {
  try {
    const json = fromUrlSafeBase64(hash)
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.v !== SHARE_VERSION) return null
    if (typeof parsed.t !== 'string' || !Array.isArray(parsed.r)) return null
    const segments = runsToSegments(parsed.t, parsed.r)
    const gradients = parsed.g ?? {}
    return { segments, gradients }
  } catch {
    return null
  }
}

type Run = {
  l: number // length
  c?: string | null // color
  f?: number // bitfield of styles: bold=1, italic=2, underline=4, strikethrough=8, obfuscated=16
  gi?: string // gradientId
}

function segmentsToRuns(segments: Segment[]): Run[] {
  const runs: Run[] = []
  for (const seg of segments) {
    const fFlag = flagsToBits(seg.styles)
    const last = runs[runs.length - 1]
    if (
      last &&
      last.c === seg.color &&
      (last.f ?? 0) === fFlag &&
      last.gi === seg.gradientId
    ) {
      last.l += 1
    } else {
      const run: Run = { l: 1 }
      if (seg.color !== null) run.c = seg.color
      if (fFlag !== 0) run.f = fFlag
      if (seg.gradientId) run.gi = seg.gradientId
      runs.push(run)
    }
  }
  return runs
}

function runsToSegments(text: string, runs: Run[]): Segment[] {
  const chars = Array.from(text)
  const segs: Segment[] = []
  let idx = 0
  for (const run of runs) {
    const styles = bitsToFlags(run.f ?? 0)
    for (let i = 0; i < run.l && idx < chars.length; i++) {
      const seg: Segment = {
        char: chars[idx],
        color: run.c ?? null,
        styles: { ...styles },
      }
      if (run.gi) seg.gradientId = run.gi
      segs.push(seg)
      idx += 1
    }
  }
  // Any leftover chars (run count mismatch) get plain segments
  while (idx < chars.length) {
    segs.push({
      char: chars[idx],
      color: null,
      styles: { bold: false, italic: false, underline: false, strikethrough: false, obfuscated: false },
    })
    idx += 1
  }
  return segs
}

function flagsToBits(f: Segment['styles']): number {
  return (
    (f.bold ? 1 : 0) |
    (f.italic ? 2 : 0) |
    (f.underline ? 4 : 0) |
    (f.strikethrough ? 8 : 0) |
    (f.obfuscated ? 16 : 0)
  )
}

function bitsToFlags(n: number): Segment['styles'] {
  return {
    bold: (n & 1) !== 0,
    italic: (n & 2) !== 0,
    underline: (n & 4) !== 0,
    strikethrough: (n & 8) !== 0,
    obfuscated: (n & 16) !== 0,
  }
}

function toUrlSafeBase64(input: string): string {
  if (typeof btoa === 'undefined') return ''
  // Support Unicode (e.g. Cyrillic) via TextEncoder → base64
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromUrlSafeBase64(input: string): string {
  if (typeof atob === 'undefined') return ''
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}
