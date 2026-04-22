import { parse } from './parser'
import type { Gradient, GradientStop, Segment } from './types'

/**
 * Result of importing a formatted string.
 *
 * - `segments` — derived character list with color/style/gradientId per char
 * - `gradients` — detected gradients indexed by a fresh id (`g1`, `g2`, …)
 * - `lastGradientStops` — stops of the last gradient in the input; UIs that
 *   want to populate a gradient editor with the imported gradient can use this.
 */
export type ImportResult = {
  segments: Segment[]
  gradients: Record<string, Gradient>
  lastGradientStops?: GradientStop[]
}

/**
 * Parse an imported formatted text string into a structured document.
 *
 * Supports:
 *   - Plain text
 *   - Legacy codes (& or §): `&aHi`, `§lBold`
 *   - Hex codes: `&#rrggbb`
 *   - MiniMessage tags: `<color:#hex>`, `<red>`, `<bold>`, `<italic>`, etc.
 *   - Multi-stop `<gradient:#a:#b:#c>...</gradient>` — preserved as an editable
 *     gradient unit (gradientId set on each char, stops exported).
 *
 * Unknown tags are stripped; mismatched close-tags approximate via &r.
 */
export function importFromCode(input: string): ImportResult {
  if (!input) return { segments: [], gradients: {} }

  const gradients: Record<string, Gradient> = {}
  let lastStops: GradientStop[] | undefined
  let gradientCounter = 0

  // 1. Normalize § → & (for plugins that emit section-sign codes)
  let text = normalizeSectionSign(input)

  // 2. Extract <gradient:...>...</gradient> into §{gN}...§{/gN} markers +
  //    register each gradient with a fresh id. Inner styled tags inside the
  //    gradient are pre-processed so that styles (<bold> etc.) survive.
  text = text.replace(GRADIENT_RE, (_full, colorsStr: string, content: string) => {
    const colorsList = colorsStr
      .split(':')
      .map(s => s.trim())
      .filter(s => /^#[0-9a-fA-F]{6}$/.test(s))
      .map(s => s.toLowerCase())
    if (colorsList.length < 2) return content

    gradientCounter += 1
    const gid = `g${gradientCounter}`
    const stops: GradientStop[] = colorsList.map((color, i, arr) => ({
      id: `${gid}_s${i}`,
      position: arr.length === 1 ? 0 : i / (arr.length - 1),
      color,
    }))
    gradients[gid] = { id: gid, stops }
    lastStops = stops

    // Process styles inside the gradient (color tags are stripped — gradient wins)
    const processedInner = preprocessTagsInsideGradient(content)
    return `§{${gid}}${processedInner}§{/${gid}}`
  })

  // 3. Process non-gradient MiniMessage tags in the outer text
  text = preprocessTagsOutsideGradient(text)

  // 4. Parse everything into segments. Parser honors §{gN}...§{/gN} markers
  //    and paints per-char interpolated colors using `gradients[gN]`.
  const segments = parse(text, gradients)
  return { segments, gradients, lastGradientStops: lastStops }
}

function normalizeSectionSign(input: string): string {
  // Preserve our own gradient markers (§{g1}, §{/g1}); convert any other § to &.
  const markerRe = /(§\{\/?g\d+\})|§/g
  return input.replace(markerRe, (_m, marker: string | undefined) =>
    marker ? marker : '&',
  )
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
  [/<bold>|<b>/gi,            '&l'],
  [/<italic>|<em>|<i>/gi,     '&o'],
  [/<underlined?>|<u>/gi,     '&n'],
  [/<strikethrough>|<st>/gi,  '&m'],
  [/<obfuscated>|<obf>/gi,    '&k'],
  [/<reset>/gi,               '&r'],
]

const STYLE_CLOSE: Array<[RegExp, string]> = [
  // Crude: close = reset. Common MM writers use explicit `<reset>` anyway.
  [/<\/bold>|<\/b>/gi,            '&r'],
  [/<\/italic>|<\/em>|<\/i>/gi,   '&r'],
  [/<\/underlined?>|<\/u>/gi,     '&r'],
  [/<\/strikethrough>|<\/st>/gi,  '&r'],
  [/<\/obfuscated>|<\/obf>/gi,    '&r'],
]

const GRADIENT_RE =
  /<gradient:((?:#[0-9a-fA-F]{6}:?)+)>([\s\S]*?)<\/gradient>/gi

const ESC_LT_PLACEHOLDER = '\u0001KN_LT\u0001'

function preprocessTagsOutsideGradient(input: string): string {
  if (!input.includes('<') && !input.includes('\\')) return input

  // Protect \< literal escape
  let text = input.replace(/\\</g, ESC_LT_PLACEHOLDER)

  // Hex colors
  text = text.replace(/<color:(#[0-9a-fA-F]{6})>/gi, (_, hex: string) => `&${hex.toLowerCase()}`)
  text = text.replace(/<\/color>/gi, '&r')
  text = text.replace(/<(#[0-9a-fA-F]{6})>/gi, (_, hex: string) => `&${hex.toLowerCase()}`)

  // Named colors
  for (const [name, code] of Object.entries(NAMED_COLOR_TO_CODE)) {
    text = text.replace(new RegExp(`<${name}>`, 'gi'), `&${code}`)
    text = text.replace(new RegExp(`</${name}>`, 'gi'), '&r')
  }

  // Style tags
  for (const [re, rep] of STYLE_OPEN) text = text.replace(re, rep)
  for (const [re, rep] of STYLE_CLOSE) text = text.replace(re, rep)

  // Strip unknown tags
  text = text.replace(/<[^>]+>/g, '')

  // Restore protected escapes
  text = text.replace(new RegExp(ESC_LT_PLACEHOLDER, 'g'), '<')

  return text
}

function preprocessTagsInsideGradient(input: string): string {
  // Inside a gradient, COLOR tags are irrelevant (gradient owns color).
  // We keep STYLE tags (bold, italic, etc.) so they survive into segments.
  if (!input.includes('<') && !input.includes('\\')) return input

  let text = input.replace(/\\</g, ESC_LT_PLACEHOLDER)

  // Drop color tags (gradient wins — parser ignores them anyway)
  text = text.replace(/<color:#[0-9a-fA-F]{6}>/gi, '')
  text = text.replace(/<\/color>/gi, '')
  text = text.replace(/<#[0-9a-fA-F]{6}>/gi, '')
  for (const name of Object.keys(NAMED_COLOR_TO_CODE)) {
    text = text.replace(new RegExp(`<${name}>`, 'gi'), '')
    text = text.replace(new RegExp(`</${name}>`, 'gi'), '')
  }

  // Keep style tags via & codes
  for (const [re, rep] of STYLE_OPEN) text = text.replace(re, rep)
  for (const [re, rep] of STYLE_CLOSE) text = text.replace(re, rep)

  // Strip any remaining unknown tags
  text = text.replace(/<[^>]+>/g, '')

  text = text.replace(new RegExp(ESC_LT_PLACEHOLDER, 'g'), '<')
  return text
}
