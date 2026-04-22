import type { GradientStop } from '../types'
import { hexToRgb, lerpRgb, rgbToHex } from '../../utils/color'

export function sortedStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

export function interpolateAt(stops: GradientStop[], position: number): string {
  if (stops.length === 0) return '#ffffff'
  const sorted = sortedStops(stops)
  const p = Math.max(0, Math.min(1, position))

  if (p <= sorted[0].position) return sorted[0].color
  const last = sorted[sorted.length - 1]
  if (p >= last.position) return last.color

  let lo = sorted[0]
  let hi = sorted[sorted.length - 1]
  for (let i = 0; i < sorted.length - 1; i++) {
    if (p >= sorted[i].position && p <= sorted[i + 1].position) {
      lo = sorted[i]
      hi = sorted[i + 1]
      break
    }
  }
  const span = hi.position - lo.position
  const t = span === 0 ? 0 : (p - lo.position) / span
  const rgbLo = hexToRgb(lo.color)
  const rgbHi = hexToRgb(hi.color)
  if (!rgbLo || !rgbHi) return lo.color
  return rgbToHex(lerpRgb(rgbLo, rgbHi, t))
}

export function colorsForN(stops: GradientStop[], n: number): string[] {
  if (n <= 0) return []
  if (n === 1) return [interpolateAt(stops, 0)]
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    out.push(interpolateAt(stops, i / (n - 1)))
  }
  return out
}
