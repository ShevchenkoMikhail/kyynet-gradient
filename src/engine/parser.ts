import type { Gradient, Segment, StyleFlags } from './types'
import { emptyStyles } from './types'
import { isLegacyColorCode, hexForLegacyCode } from './minecraft/legacyPalette'
import { isStyleCode, isResetCode, flagForStyleCode } from './minecraft/styleCodes'
import { colorsForN } from './gradient/interpolate'

type ParserState = {
  color: string | null
  styles: StyleFlags
}

const GRADIENT_OPEN_RE = /^§\{(g\d+)\}/
const HEX6_RE = /^&#([0-9a-fA-F]{6})/

export function parse(
  rawText: string,
  gradients: Record<string, Gradient> = {},
): Segment[] {
  const segments: Segment[] = []
  const state: ParserState = { color: null, styles: emptyStyles() }
  let i = 0
  while (i < rawText.length) {
    // Gradient open marker
    if (rawText[i] === '§' && rawText[i + 1] === '{' && rawText[i + 2] === 'g') {
      const openMatch = rawText.slice(i).match(GRADIENT_OPEN_RE)
      if (openMatch) {
        const gid = openMatch[1]
        const openLen = openMatch[0].length
        const closeTag = `§{/${gid}}`
        const closeIdx = rawText.indexOf(closeTag, i + openLen)
        if (closeIdx !== -1) {
          const inner = rawText.slice(i + openLen, closeIdx)
          const gradient = gradients[gid]
          parseGradientSpan(inner, state, gradient, gid, segments)
          i = closeIdx + closeTag.length
          continue
        }
        // no close found: fall through and emit literals
      }
    }
    // & codes
    if (rawText[i] === '&') {
      const consumed = applyAmpersandCode(rawText, i, state)
      if (consumed > 0) {
        i += consumed
        continue
      }
    }
    // Literal codepoint (surrogate-pair aware)
    const gr = nextCodePoint(rawText, i)
    segments.push({
      char: gr,
      color: state.color,
      styles: { ...state.styles },
    })
    i += gr.length
  }
  return segments
}

function applyAmpersandCode(
  rawText: string,
  i: number,
  state: ParserState,
): number {
  // &#rrggbb
  if (rawText[i + 1] === '#') {
    const m = rawText.slice(i).match(HEX6_RE)
    if (m) {
      state.color = `#${m[1].toLowerCase()}`
      return 1 + 1 + 6
    }
  }
  const next = rawText[i + 1]?.toLowerCase()
  if (!next) return 0
  if (isLegacyColorCode(next)) {
    state.color = hexForLegacyCode(next)
    return 2
  }
  if (isStyleCode(next)) {
    state.styles[flagForStyleCode(next)] = true
    return 2
  }
  if (isResetCode(next)) {
    state.color = null
    state.styles.bold = false
    state.styles.italic = false
    state.styles.underline = false
    state.styles.strikethrough = false
    state.styles.obfuscated = false
    return 2
  }
  return 0
}

function parseGradientSpan(
  inner: string,
  outerState: ParserState,
  gradient: Gradient | undefined,
  gid: string,
  segments: Segment[],
): void {
  // Walk inner; styles flow from outer, color is overridden by gradient.
  const state: ParserState = { color: outerState.color, styles: { ...outerState.styles } }
  const localSegments: Segment[] = []
  let i = 0
  while (i < inner.length) {
    if (inner[i] === '&') {
      const next = inner[i + 1]?.toLowerCase()
      if (next === '#') {
        // Hex: consume but ignore (gradient owns color)
        const m = inner.slice(i).match(HEX6_RE)
        if (m) {
          i += 8
          continue
        }
      }
      if (next && isLegacyColorCode(next)) {
        // Consume but ignore color
        i += 2
        continue
      }
      if (next && isStyleCode(next)) {
        state.styles[flagForStyleCode(next)] = true
        i += 2
        continue
      }
      if (next && isResetCode(next)) {
        // Reset styles; color still from gradient
        state.styles.bold = false
        state.styles.italic = false
        state.styles.underline = false
        state.styles.strikethrough = false
        state.styles.obfuscated = false
        i += 2
        continue
      }
    }
    const gr = nextCodePoint(inner, i)
    localSegments.push({
      char: gr,
      color: null,
      styles: { ...state.styles },
      gradientId: gid,
    })
    i += gr.length
  }
  // Sync outer styles (color ignored for outer)
  outerState.styles = state.styles

  const n = localSegments.length
  if (n === 0) return
  const stops = gradient?.stops ?? []
  const colors = stops.length >= 2 ? colorsForN(stops, n) : Array(n).fill('#ffffff')
  for (let k = 0; k < n; k++) {
    localSegments[k].color = colors[k]
  }
  segments.push(...localSegments)
}

function nextCodePoint(s: string, i: number): string {
  const code = s.charCodeAt(i)
  if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
    const next = s.charCodeAt(i + 1)
    if (next >= 0xdc00 && next <= 0xdfff) return s.slice(i, i + 2)
  }
  return s[i]
}
