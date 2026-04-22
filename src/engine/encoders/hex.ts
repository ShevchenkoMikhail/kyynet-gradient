import type { Segment, StyleFlags } from '../types'
import { emptyStyles, STYLE_KEYS } from '../types'
import { styleCodeForFlag } from '../minecraft/styleCodes'

export function encodeHex(segments: Segment[]): string {
  let out = ''
  let color: string | null = null
  let styles: StyleFlags = emptyStyles()

  for (const seg of segments) {
    const needsReset = STYLE_KEYS.some(k => styles[k] && !seg.styles[k]) ||
      (color !== null && seg.color === null)

    if (needsReset) {
      out += '&r'
      color = null
      styles = emptyStyles()
    }

    if (seg.color !== null && seg.color !== color) {
      out += `&${seg.color}`
      color = seg.color
    }

    for (const k of STYLE_KEYS) {
      if (seg.styles[k] && !styles[k]) {
        out += '&' + styleCodeForFlag(k)
        styles[k] = true
      }
    }

    out += seg.char
  }

  return out
}
