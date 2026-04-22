import { describe, it, expect } from 'vitest'
import { parse } from '../../src/engine/parser'
import type { Gradient } from '../../src/engine/types'

describe('parser — basic text', () => {
  it('parses plain ASCII', () => {
    const segs = parse('Hello')
    expect(segs).toHaveLength(5)
    expect(segs.every(s => s.color === null)).toBe(true)
    expect(segs.every(s => !s.styles.bold)).toBe(true)
  })

  it('parses plain Cyrillic', () => {
    const segs = parse('Привет')
    expect(segs).toHaveLength(6)
    expect(segs[0].char).toBe('П')
    expect(segs[5].char).toBe('т')
  })

  it('returns empty for empty string', () => {
    expect(parse('')).toEqual([])
  })
})

describe('parser — legacy color codes', () => {
  it('applies &a (green) to following chars', () => {
    const segs = parse('&aHi')
    expect(segs).toHaveLength(2)
    expect(segs[0].char).toBe('H')
    expect(segs[0].color).toBe('#55ff55')
    expect(segs[1].color).toBe('#55ff55')
  })

  it('applies all 16 legacy colors to a Cyrillic letter', () => {
    const codes = '0123456789abcdef'.split('')
    for (const c of codes) {
      const segs = parse(`&${c}А`)
      expect(segs).toHaveLength(1)
      expect(segs[0].color).not.toBeNull()
    }
  })

  it('color change mid-string', () => {
    const segs = parse('&aПри&cвет')
    expect(segs.slice(0, 3).every(s => s.color === '#55ff55')).toBe(true)
    expect(segs.slice(3).every(s => s.color === '#ff5555')).toBe(true)
  })
})

describe('parser — hex color codes', () => {
  it('parses &#rrggbb', () => {
    const segs = parse('&#ff5733X')
    expect(segs).toHaveLength(1)
    expect(segs[0].color).toBe('#ff5733')
  })

  it('lowercases hex', () => {
    const segs = parse('&#FF0000R')
    expect(segs[0].color).toBe('#ff0000')
  })

  it('requires exactly 6 hex digits', () => {
    const segs = parse('&#zzzzzzX')
    // Not a valid hex code — falls through as literal
    expect(segs.length).toBeGreaterThan(1)
  })
})

describe('parser — style codes', () => {
  it('&l makes bold', () => {
    const segs = parse('&lX')
    expect(segs[0].styles.bold).toBe(true)
  })

  it('stacks styles: &l&o', () => {
    const segs = parse('&l&oX')
    expect(segs[0].styles.bold).toBe(true)
    expect(segs[0].styles.italic).toBe(true)
  })

  it('&r resets styles and color', () => {
    const segs = parse('&a&lHi&rX')
    expect(segs[0].color).toBe('#55ff55')
    expect(segs[0].styles.bold).toBe(true)
    const last = segs[segs.length - 1]
    expect(last.color).toBeNull()
    expect(last.styles.bold).toBe(false)
  })
})

describe('parser — tolerance', () => {
  it('emits &z as literal (unknown code)', () => {
    const segs = parse('&zA')
    // Unknown code → falls through as literal '&', then 'z', then 'A'
    expect(segs).toHaveLength(3)
    expect(segs[0].char).toBe('&')
    expect(segs[1].char).toBe('z')
    expect(segs[2].char).toBe('A')
  })

  it('does not crash on trailing lone &', () => {
    expect(() => parse('Hello&')).not.toThrow()
  })
})

describe('parser — gradient spans', () => {
  const gradient: Gradient = {
    id: 'g1',
    stops: [
      { id: 's1', position: 0, color: '#ff0000' },
      { id: 's2', position: 1, color: '#0000ff' },
    ],
  }

  it('assigns gradientId to chars inside span', () => {
    const segs = parse('§{g1}ABC§{/g1}', { g1: gradient })
    expect(segs).toHaveLength(3)
    expect(segs.every(s => s.gradientId === 'g1')).toBe(true)
  })

  it('interpolates 2-stop gradient at endpoints + midpoint', () => {
    const segs = parse('§{g1}ABC§{/g1}', { g1: gradient })
    expect(segs[0].color).toBe('#ff0000')
    expect(segs[2].color).toBe('#0000ff')
    const midColor = segs[1].color
    expect(midColor).not.toBeNull()
  })

  it('preserves outer styles inside gradient', () => {
    const segs = parse('&l§{g1}AB§{/g1}', { g1: gradient })
    expect(segs.every(s => s.styles.bold)).toBe(true)
  })

  it('allows styles inside gradient, ignores colors', () => {
    const segs = parse('§{g1}&lA&cB§{/g1}', { g1: gradient })
    expect(segs).toHaveLength(2)
    expect(segs[0].styles.bold).toBe(true)
    expect(segs[1].styles.bold).toBe(true)
    // Colors are from the gradient, not &c
    expect(segs[0].color).toBe('#ff0000')
    expect(segs[1].color).toBe('#0000ff')
  })

  it('treats gradient markers as literal if no closing tag', () => {
    const segs = parse('§{g1}ABC', { g1: gradient })
    // open without close → fall through literally
    expect(segs.length).toBeGreaterThan(3)
  })
})
