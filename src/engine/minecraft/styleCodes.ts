import type { StyleFlags } from '../types'

export type StyleCode = 'l' | 'o' | 'n' | 'm' | 'k'
export type ResetCode = 'r'
export type FormatCode = StyleCode | ResetCode

const STYLE_CODE_TO_FLAG: Record<StyleCode, keyof StyleFlags> = {
  l: 'bold',
  o: 'italic',
  n: 'underline',
  m: 'strikethrough',
  k: 'obfuscated',
}

const FLAG_TO_STYLE_CODE: Record<keyof StyleFlags, StyleCode> = {
  bold: 'l',
  italic: 'o',
  underline: 'n',
  strikethrough: 'm',
  obfuscated: 'k',
}

const STYLE_CODE_SET = new Set<string>(Object.keys(STYLE_CODE_TO_FLAG))

export function isStyleCode(c: string): c is StyleCode {
  return STYLE_CODE_SET.has(c)
}

export function isResetCode(c: string): c is ResetCode {
  return c === 'r'
}

export function flagForStyleCode(c: StyleCode): keyof StyleFlags {
  return STYLE_CODE_TO_FLAG[c]
}

export function styleCodeForFlag(f: keyof StyleFlags): StyleCode {
  return FLAG_TO_STYLE_CODE[f]
}
