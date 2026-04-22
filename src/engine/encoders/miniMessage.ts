import type { Gradient, Segment, StyleFlags } from '../types'
import { STYLE_KEYS, stylesEqual } from '../types'

type Run = {
  text: string
  color: string | null
  gradientId: string | null
  styles: StyleFlags
}

export function encodeMiniMessage(
  segments: Segment[],
  gradients: Record<string, Gradient> = {},
): string {
  const runs = groupRuns(segments)
  let out = ''

  for (const run of runs) {
    const opens: string[] = []
    const closes: string[] = []

    if (run.gradientId) {
      const g = gradients[run.gradientId]
      if (g && g.stops.length >= 2) {
        const colors = [...g.stops]
          .sort((a, b) => a.position - b.position)
          .map(s => s.color)
          .join(':')
        opens.push(`<gradient:${colors}>`)
        closes.unshift('</gradient>')
      } else if (run.color) {
        opens.push(`<color:${run.color}>`)
        closes.unshift('</color>')
      }
    } else if (run.color) {
      opens.push(`<color:${run.color}>`)
      closes.unshift('</color>')
    }

    for (const k of STYLE_KEYS) {
      if (run.styles[k]) {
        opens.push(`<${k}>`)
        closes.unshift(`</${k}>`)
      }
    }

    out += opens.join('')
    out += escapeMiniMessage(run.text)
    out += closes.join('')
  }

  return out
}

function groupRuns(segments: Segment[]): Run[] {
  const runs: Run[] = []
  for (const seg of segments) {
    const last = runs[runs.length - 1]
    const segGid = seg.gradientId ?? null
    const lastGid = last?.gradientId ?? null
    // Within a gradient, per-segment colors are interpolated and irrelevant —
    // the <gradient> tag owns coloring. Group all gradient chars with matching
    // id+styles. Outside gradients, group by color+styles.
    const sameContainer = lastGid === segGid
    const sameStyles = last ? stylesEqual(last.styles, seg.styles) : false
    const sameColor = segGid !== null ? true : last?.color === seg.color
    if (last && sameContainer && sameStyles && sameColor) {
      last.text += seg.char
    } else {
      runs.push({
        text: seg.char,
        color: seg.color,
        gradientId: segGid,
        styles: { ...seg.styles },
      })
    }
  }
  return runs
}

function escapeMiniMessage(text: string): string {
  // Adventure's MiniMessage escape: \< for literal <. Also \\ for literal \.
  return text.replace(/\\/g, '\\\\').replace(/</g, '\\<')
}
