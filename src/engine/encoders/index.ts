import type { EncodedOutputs, Gradient, Segment } from '../types'
import { encodeLegacy } from './legacy'
import { encodeHex } from './hex'
import { encodeMiniMessage } from './miniMessage'

export function encodeAll(
  segments: Segment[],
  gradients: Record<string, Gradient> = {},
): EncodedOutputs {
  const legacy = encodeLegacy(segments)
  const hex = encodeHex(segments)
  const miniMessage = encodeMiniMessage(segments, gradients)
  return {
    legacy: legacy.text,
    hex,
    miniMessage,
    warnings: legacy.warnings,
  }
}

export { encodeLegacy, encodeHex, encodeMiniMessage }
