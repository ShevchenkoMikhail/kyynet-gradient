import { describe, it, expect } from 'vitest'
import { parse } from '../../src/engine/parser'
import { encodeMiniMessage } from '../../src/engine/encoders/miniMessage'
import type { Gradient } from '../../src/engine/types'

describe('minimessage encoder — colors', () => {
  it('wraps run in <color:#...>', () => {
    const segs = parse('&aHi')
    const out = encodeMiniMessage(segs)
    expect(out).toBe('<color:#55ff55>Hi</color>')
  })

  it('arbitrary hex', () => {
    const segs = parse('&#7c3aedX')
    expect(encodeMiniMessage(segs)).toBe('<color:#7c3aed>X</color>')
  })

  it('no color → no wrapper', () => {
    const segs = parse('Hello')
    expect(encodeMiniMessage(segs)).toBe('Hello')
  })
})

describe('minimessage encoder — styles', () => {
  it('wraps bold', () => {
    const segs = parse('&lBold')
    expect(encodeMiniMessage(segs)).toBe('<bold>Bold</bold>')
  })

  it('combines color and style', () => {
    const segs = parse('&a&lGB')
    const out = encodeMiniMessage(segs)
    expect(out).toContain('<color:#55ff55>')
    expect(out).toContain('<bold>')
    expect(out).toContain('GB')
    expect(out).toContain('</bold>')
    expect(out).toContain('</color>')
  })

  it('all five style tags', () => {
    const segs = parse('&l&o&n&m&kX')
    const out = encodeMiniMessage(segs)
    expect(out).toContain('<bold>')
    expect(out).toContain('<italic>')
    expect(out).toContain('<underline>')
    expect(out).toContain('<strikethrough>')
    expect(out).toContain('<obfuscated>')
  })
})

describe('minimessage encoder — gradient', () => {
  const g: Gradient = {
    id: 'g1',
    stops: [
      { id: 's1', position: 0, color: '#ff0000' },
      { id: 's2', position: 1, color: '#0000ff' },
    ],
  }

  it('emits <gradient:#c1:#c2>...</gradient> for gradient run', () => {
    const segs = parse('§{g1}ABC§{/g1}', { g1: g })
    const out = encodeMiniMessage(segs, { g1: g })
    expect(out).toBe('<gradient:#ff0000:#0000ff>ABC</gradient>')
  })

  it('multi-stop gradient emits all stops', () => {
    const multi: Gradient = {
      id: 'g2',
      stops: [
        { id: 's1', position: 0, color: '#ff0000' },
        { id: 's2', position: 0.5, color: '#00ff00' },
        { id: 's3', position: 1, color: '#0000ff' },
      ],
    }
    const segs = parse('§{g2}ABC§{/g2}', { g2: multi })
    const out = encodeMiniMessage(segs, { g2: multi })
    expect(out).toBe('<gradient:#ff0000:#00ff00:#0000ff>ABC</gradient>')
  })
})

describe('minimessage encoder — escaping', () => {
  it('escapes literal <', () => {
    const segs = parse('<html>')
    const out = encodeMiniMessage(segs)
    expect(out).toBe('\\<html>')
  })

  it('escapes backslash', () => {
    const segs = parse('a\\b')
    const out = encodeMiniMessage(segs)
    expect(out).toBe('a\\\\b')
  })
})
