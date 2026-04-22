import type { Gradient } from '../types'
import { colorsForN } from './interpolate'

const SPAN_RE = /§\{(g\d+)\}([\s\S]*?)§\{\/\1\}/g

/**
 * Replace each §{gN}...§{/gN} span in rawText with a flattened sequence of
 * &#rrggbb-prefixed characters that express the gradient colors inline.
 *
 * After flattening, the span is no longer editable as a gradient unit —
 * it is just plain text with hex color codes per visible character.
 */
export function flattenGradients(
  rawText: string,
  gradients: Record<string, Gradient>,
): string {
  return rawText.replace(SPAN_RE, (_full, gid: string, inner: string) => {
    const gradient = gradients[gid]
    if (!gradient || gradient.stops.length < 2) return inner

    const visibleChars = extractVisibleChars(inner)
    const n = visibleChars.length
    if (n === 0) return ''
    const colors = colorsForN(gradient.stops, n)

    let out = ''
    let visibleIdx = 0
    let i = 0
    while (i < inner.length) {
      if (inner[i] === '&' && inner[i + 1]) {
        const next = inner[i + 1].toLowerCase()
        if (next === '#' && /^&#[0-9a-fA-F]{6}/.test(inner.slice(i))) {
          // Drop — gradient owns color
          i += 8
          continue
        }
        if (/[0-9a-f]/.test(next)) {
          // Drop legacy color
          i += 2
          continue
        }
        if (/[klmnor]/.test(next)) {
          // Keep style/reset codes through
          out += inner.slice(i, i + 2)
          i += 2
          continue
        }
      }
      const gr = nextCodePoint(inner, i)
      out += `&${colors[visibleIdx]}${gr}`
      visibleIdx += 1
      i += gr.length
    }
    return out
  })
}

function extractVisibleChars(inner: string): string[] {
  const out: string[] = []
  let i = 0
  while (i < inner.length) {
    if (inner[i] === '&' && inner[i + 1]) {
      const next = inner[i + 1].toLowerCase()
      if (next === '#' && /^&#[0-9a-fA-F]{6}/.test(inner.slice(i))) {
        i += 8
        continue
      }
      if (/[0-9a-fklmnor]/.test(next)) {
        i += 2
        continue
      }
    }
    const gr = nextCodePoint(inner, i)
    out.push(gr)
    i += gr.length
  }
  return out
}

function nextCodePoint(s: string, i: number): string {
  const code = s.charCodeAt(i)
  if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
    const nextCode = s.charCodeAt(i + 1)
    if (nextCode >= 0xdc00 && nextCode <= 0xdfff) return s.slice(i, i + 2)
  }
  return s[i]
}
