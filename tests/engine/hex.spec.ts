import { describe, it, expect } from 'vitest'
import { parse } from '../../src/engine/parser'
import { encodeHex } from '../../src/engine/encoders/hex'

describe('hex encoder', () => {
  it('exact round-trips arbitrary hex', () => {
    const segs = parse('&#7c3aedX')
    expect(encodeHex(segs)).toBe('&#7c3aedX')
  })

  it('converts legacy &a into &#55ff55', () => {
    const segs = parse('&aX')
    expect(encodeHex(segs)).toBe('&#55ff55X')
  })

  it('preserves styles via legacy style codes', () => {
    const segs = parse('&#ff0000&lBold')
    const out = encodeHex(segs)
    expect(out).toContain('&#ff0000')
    expect(out).toContain('&l')
  })

  it('emits reset when color goes to null', () => {
    const segs = parse('&aHi&rThere')
    const out = encodeHex(segs)
    expect(out).toContain('&r')
    expect(out).toContain('There')
  })

  it('empty segments produce empty string', () => {
    expect(encodeHex([])).toBe('')
  })
})
