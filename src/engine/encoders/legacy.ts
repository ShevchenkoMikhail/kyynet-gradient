import type { EncoderWarning, Segment, StyleFlags } from '../types'
import { emptyStyles, STYLE_KEYS } from '../types'
import {
  exactLegacyCodeFor,
  hexForLegacyCode,
  nearestLegacyCode,
} from '../minecraft/legacyPalette'
import { styleCodeForFlag } from '../minecraft/styleCodes'

type EncodeState = {
  color: string | null
  styles: StyleFlags
}

export function encodeLegacy(segments: Segment[]): {
  text: string
  warnings: EncoderWarning[]
} {
  const warnings: EncoderWarning[] = []
  let out = ''
  const state: EncodeState = { color: null, styles: emptyStyles() }

  for (const seg of segments) {
    const needsReset = stylesRemoved(state.styles, seg.styles) ||
      (state.color !== null && seg.color === null)

    if (needsReset) {
      out += '&r'
      state.color = null
      state.styles = emptyStyles()
    }

    if (seg.color !== null && seg.color !== state.color) {
      const exact = exactLegacyCodeFor(seg.color)
      if (exact) {
        out += '&' + exact
      } else {
        const near = nearestLegacyCode(seg.color)
        out += '&' + near.code
        warnings.push({
          kind: 'legacy.approximated',
          fromHex: seg.color,
          toCode: near.code,
        })
      }
      // Track the palette hex so we don't re-emit the same code
      state.color = exactLegacyCodeFor(seg.color)
        ? seg.color
        : hexForLegacyCode(nearestLegacyCode(seg.color).code)
    }

    for (const k of STYLE_KEYS) {
      if (seg.styles[k] && !state.styles[k]) {
        out += '&' + styleCodeForFlag(k)
        state.styles[k] = true
      }
    }

    out += seg.char
  }

  return { text: out, warnings }
}

function stylesRemoved(prev: StyleFlags, next: StyleFlags): boolean {
  return STYLE_KEYS.some(k => prev[k] && !next[k])
}
