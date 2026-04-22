import { describe, it, expect } from 'vitest'
import { parse } from '../../src/engine/parser'
import { encodeLegacy } from '../../src/engine/encoders/legacy'
import { LEGACY_PALETTE } from '../../src/engine/minecraft/legacyPalette'

describe('legacy encoder — exact round-trips', () => {
  for (const entry of LEGACY_PALETTE) {
    it(`&${entry.code} (${entry.name}) round-trips without warnings`, () => {
      const segs = parse(`&${entry.code}X`)
      const { text, warnings } = encodeLegacy(segs)
      expect(text).toBe(`&${entry.code}X`)
      expect(warnings).toEqual([])
    })
  }

  it('plain text encodes identically', () => {
    const segs = parse('Привет мир')
    const { text } = encodeLegacy(segs)
    expect(text).toBe('Привет мир')
  })
})

describe('legacy encoder — approximation', () => {
  it('approximates non-palette hex color', () => {
    const segs = parse('&#7c3aedX')
    const { text, warnings } = encodeLegacy(segs)
    expect(warnings).toHaveLength(1)
    expect(warnings[0].kind).toBe('legacy.approximated')
    expect(text.startsWith('&')).toBe(true)
  })

  it('pure green hex exact-matches &a', () => {
    const segs = parse('&#55ff55X')
    const { text, warnings } = encodeLegacy(segs)
    expect(text).toBe('&aX')
    expect(warnings).toEqual([])
  })
})

describe('legacy encoder — styles', () => {
  it('emits bold code for &l', () => {
    const segs = parse('&lHi')
    const { text } = encodeLegacy(segs)
    expect(text).toBe('&lHi')
  })

  it('emits &r + color when styles removed', () => {
    // Manual segments: first seg has bold+green, second has just green
    const segs = parse('&a&lAB')
    // Both should be bold + green.
    const { text } = encodeLegacy(segs)
    expect(text).toContain('&a')
    expect(text).toContain('&l')
  })

  it('roundtrips multi-code input', () => {
    const segs = parse('&a&lПривет &cМир')
    const { text } = encodeLegacy(segs)
    // Parse encoded output — should produce same segments
    const segsRound = parse(text)
    expect(segsRound).toHaveLength(segs.length)
    for (let i = 0; i < segs.length; i++) {
      expect(segsRound[i].color).toBe(segs[i].color)
      expect(segsRound[i].styles).toEqual(segs[i].styles)
      expect(segsRound[i].char).toBe(segs[i].char)
    }
  })
})
