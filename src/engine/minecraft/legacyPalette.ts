import { hexToRgb, rgbDistance } from '../../utils/color'

export type LegacyColorCode =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'
  | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

export type LegacyColorEntry = {
  code: LegacyColorCode
  hex: string
  name: string
  nameRu: string
}

export const LEGACY_PALETTE: LegacyColorEntry[] = [
  { code: '0', hex: '#000000', name: 'Black',        nameRu: 'Чёрный' },
  { code: '1', hex: '#0000aa', name: 'Dark Blue',    nameRu: 'Тёмно-синий' },
  { code: '2', hex: '#00aa00', name: 'Dark Green',   nameRu: 'Тёмно-зелёный' },
  { code: '3', hex: '#00aaaa', name: 'Dark Aqua',    nameRu: 'Тёмная бирюза' },
  { code: '4', hex: '#aa0000', name: 'Dark Red',     nameRu: 'Тёмно-красный' },
  { code: '5', hex: '#aa00aa', name: 'Dark Purple',  nameRu: 'Тёмно-пурпурный' },
  { code: '6', hex: '#ffaa00', name: 'Gold',         nameRu: 'Золотой' },
  { code: '7', hex: '#aaaaaa', name: 'Gray',         nameRu: 'Серый' },
  { code: '8', hex: '#555555', name: 'Dark Gray',    nameRu: 'Тёмно-серый' },
  { code: '9', hex: '#5555ff', name: 'Blue',         nameRu: 'Синий' },
  { code: 'a', hex: '#55ff55', name: 'Green',        nameRu: 'Зелёный' },
  { code: 'b', hex: '#55ffff', name: 'Aqua',         nameRu: 'Бирюзовый' },
  { code: 'c', hex: '#ff5555', name: 'Red',          nameRu: 'Красный' },
  { code: 'd', hex: '#ff55ff', name: 'Light Purple', nameRu: 'Светло-пурпурный' },
  { code: 'e', hex: '#ffff55', name: 'Yellow',       nameRu: 'Жёлтый' },
  { code: 'f', hex: '#ffffff', name: 'White',        nameRu: 'Белый' },
]

const LEGACY_CODE_SET = new Set(LEGACY_PALETTE.map(e => e.code))
const HEX_TO_CODE = new Map(LEGACY_PALETTE.map(e => [e.hex, e.code]))
const CODE_TO_HEX = new Map(LEGACY_PALETTE.map(e => [e.code, e.hex]))

export function isLegacyColorCode(c: string): c is LegacyColorCode {
  return LEGACY_CODE_SET.has(c as LegacyColorCode)
}

export function hexForLegacyCode(code: LegacyColorCode): string {
  return CODE_TO_HEX.get(code) ?? '#ffffff'
}

export function exactLegacyCodeFor(hex: string): LegacyColorCode | null {
  return HEX_TO_CODE.get(hex.toLowerCase()) ?? null
}

export function nearestLegacyCode(hex: string): {
  code: LegacyColorCode
  exact: boolean
  paletteHex: string
} {
  const lowered = hex.toLowerCase()
  const exact = HEX_TO_CODE.get(lowered)
  if (exact) {
    return { code: exact, exact: true, paletteHex: lowered }
  }
  const rgb = hexToRgb(lowered)
  if (!rgb) {
    return { code: 'f', exact: false, paletteHex: '#ffffff' }
  }
  let best = LEGACY_PALETTE[0]
  let bestDist = Infinity
  for (const entry of LEGACY_PALETTE) {
    const entryRgb = hexToRgb(entry.hex)!
    const d = rgbDistance(rgb, entryRgb)
    if (d < bestDist) {
      bestDist = d
      best = entry
    }
  }
  return { code: best.code, exact: false, paletteHex: best.hex }
}
