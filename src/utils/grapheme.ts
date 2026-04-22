let cachedSegmenter: Intl.Segmenter | null | undefined

function getSegmenter(): Intl.Segmenter | null {
  if (cachedSegmenter !== undefined) return cachedSegmenter
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      cachedSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      return cachedSegmenter
    } catch {
      // fall through
    }
  }
  cachedSegmenter = null
  return null
}

export function splitGraphemes(text: string): string[] {
  if (text.length === 0) return []
  const seg = getSegmenter()
  if (seg) {
    const out: string[] = []
    for (const piece of seg.segment(text)) out.push(piece.segment)
    return out
  }
  // Fallback: codepoint split (handles surrogate pairs but not combining marks)
  return Array.from(text)
}
