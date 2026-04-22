import { parse } from './parser'
import { colorsForN } from './gradient/interpolate'
import type { Segment } from './types'

/**
 * Parse an imported formatted text string into canonical Segment[].
 * Supports:
 *   - Plain text
 *   - Legacy codes: &a, &l, &r ...
 *   - Hex codes: &#rrggbb
 *   - MiniMessage tags: <color:#hex>, named colors, <bold>, <italic>, etc.
 *   - MiniMessage <gradient:#a:#b:#c>...</gradient> — expanded per-character
 *
 * Unknown tags are stripped; mismatched close-tags approximate via &r.
 */
export function importFromCode(input: string): Segment[] {
  if (!input) return []
  let text = normalizeSectionSign(input)
  text = preprocessMiniMessage(text)
  return parse(text, {})
}

/**
 * Many plugins use the § (section) sign instead of & for formatting.
 * Convert §-codes to &-codes for our parser.
 */
function normalizeSectionSign(input: string): string {
  // Don't touch our internal gradient markers: §{g\d+} and §{/g\d+}
  const markerRe = /(§\{\/?g\d+\})|§/g
  return input.replace(markerRe, (_m, marker: string | undefined) => (marker ? marker : '&'))
}

const NAMED_COLOR_TO_CODE: Record<string, string> = {
  black:        '0',
  dark_blue:    '1',
  dark_green:   '2',
  dark_aqua:    '3',
  dark_red:     '4',
  dark_purple:  '5',
  gold:         '6',
  gray:         '7',
  dark_gray:    '8',
  blue:         '9',
  green:        'a',
  aqua:         'b',
  red:          'c',
  light_purple: 'd',
  yellow:       'e',
  white:        'f',
}

const STYLE_OPEN: Array<[RegExp, string]> = [
  [/<bold>|<b>/gi,                          '&l'],
  [/<italic>|<em>|<i>/gi,                   '&o'],
  [/<underlined?>|<u>/gi,                   '&n'],
  [/<strikethrough>|<st>/gi,                '&m'],
  [/<obfuscated>|<obf>/gi,                  '&k'],
  [/<reset>/gi,                             '&r'],
]

const STYLE_CLOSE: Array<[RegExp, string]> = [
  // Crude: close = reset-all (common MiniMessage writers use explicit resets
  // instead of nesting, which is fine for imports)
  [/<\/bold>|<\/b>/gi,                      '&r'],
  [/<\/italic>|<\/em>|<\/i>/gi,             '&r'],
  [/<\/underlined?>|<\/u>/gi,               '&r'],
  [/<\/strikethrough>|<\/st>/gi,            '&r'],
  [/<\/obfuscated>|<\/obf>/gi,              '&r'],
]

const GRADIENT_RE =
  /<gradient:((?:#[0-9a-fA-F]{6}:?)+)>([\s\S]*?)<\/gradient>/gi

const ESC_LT_PLACEHOLDER = '\u0001KN_LT\u0001'

function preprocessMiniMessage(input: string): string {
  if (!input.includes('<') && !input.includes('\\')) return input

  // Protect escaped < by replacing with a placeholder first
  let text = input.replace(/\\</g, ESC_LT_PLACEHOLDER)

  text = expandGradients(text)

  // Hex colors
  text = text.replace(/<color:(#[0-9a-fA-F]{6})>/gi, (_, hex: string) => `&${hex.toLowerCase()}`)
  text = text.replace(/<\/color>/gi, '&r')
  // Short form: <#ff0000>
  text = text.replace(/<(#[0-9a-fA-F]{6})>/gi, (_, hex: string) => `&${hex.toLowerCase()}`)

  // Named colors
  for (const [name, code] of Object.entries(NAMED_COLOR_TO_CODE)) {
    const open = new RegExp(`<${name}>`, 'gi')
    const close = new RegExp(`</${name}>`, 'gi')
    text = text.replace(open, `&${code}`)
    text = text.replace(close, '&r')
  }

  // Style tags
  for (const [re, rep] of STYLE_OPEN) text = text.replace(re, rep)
  for (const [re, rep] of STYLE_CLOSE) text = text.replace(re, rep)

  // Strip any remaining tags (unknown or already handled close tags)
  text = text.replace(/<[^>]+>/g, '')

  // Restore escaped <
  text = text.replace(new RegExp(ESC_LT_PLACEHOLDER, 'g'), '<')

  return text
}

function expandGradients(input: string): string {
  return input.replace(GRADIENT_RE, (_full, colorsStr: string, content: string) => {
    const colorsList = colorsStr
      .split(':')
      .map(s => s.trim())
      .filter(s => /^#[0-9a-fA-F]{6}$/.test(s))
      .map(s => s.toLowerCase())
    if (colorsList.length < 2) return content
    const stops = colorsList.map((color, i, arr) => ({
      id: `g${i}`,
      position: arr.length === 1 ? 0 : i / (arr.length - 1),
      color,
    }))
    // Strip inner tags to count visible characters
    const innerText = content.replace(/<[^>]+>/g, '')
    const chars = Array.from(innerText)
    const n = chars.length
    if (n === 0) return ''
    const perCharColors = colorsForN(stops, n)
    return chars.map((ch, i) => `&${perCharColors[i]}${ch}`).join('')
  })
}
