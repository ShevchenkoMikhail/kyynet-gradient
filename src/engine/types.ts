export type StyleFlags = {
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  obfuscated: boolean
}

export const EMPTY_STYLES: StyleFlags = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  obfuscated: false,
}

export const STYLE_KEYS: readonly (keyof StyleFlags)[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'obfuscated',
] as const

export type Segment = {
  char: string
  color: string | null
  styles: StyleFlags
  gradientId?: string
}

export type GradientStop = {
  id: string
  position: number
  color: string
}

export type Gradient = {
  id: string
  stops: GradientStop[]
}

export type FormattedDoc = {
  rawText: string
  gradients: Record<string, Gradient>
  segments: Segment[]
}

export type EncodedOutputs = {
  legacy: string
  hex: string
  miniMessage: string
  warnings: EncoderWarning[]
}

export type EncoderWarning =
  | { kind: 'legacy.approximated'; fromHex: string; toCode: string }

export function emptyStyles(): StyleFlags {
  return { ...EMPTY_STYLES }
}

export function stylesEqual(a: StyleFlags, b: StyleFlags): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strikethrough === b.strikethrough &&
    a.obfuscated === b.obfuscated
  )
}

export function hasStyleRemoval(prev: StyleFlags, next: StyleFlags): boolean {
  return STYLE_KEYS.some(k => prev[k] && !next[k])
}
