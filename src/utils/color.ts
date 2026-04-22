export type Rgb = { r: number; g: number; b: number }

const HEX6_RE = /^#([0-9a-f]{6})$/i

export function isValidHex(hex: string): boolean {
  return HEX6_RE.test(hex)
}

export function normalizeHex(hex: string): string | null {
  if (!hex) return null
  const trimmed = hex.trim()
  if (trimmed.startsWith('#')) {
    if (trimmed.length === 7 && HEX6_RE.test(trimmed)) return trimmed.toLowerCase()
    if (trimmed.length === 4) {
      // #abc → #aabbcc
      const [, a, b, c] = trimmed
      return `#${a}${a}${b}${b}${c}${c}`.toLowerCase()
    }
    return null
  }
  if (trimmed.length === 6 && /^[0-9a-f]{6}$/i.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`
  }
  return null
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  return { r, g, b }
}

export function rgbToHex(rgb: Rgb): string {
  const to2 = (n: number) => clamp255(n).toString(16).padStart(2, '0')
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`
}

export function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

export function shade(hex: string, factor: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex({
    r: rgb.r * factor,
    g: rgb.g * factor,
    b: rgb.b * factor,
  })
}

export function rgbDistance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

export function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}
