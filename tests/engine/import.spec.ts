import { describe, it, expect } from 'vitest'
import { importFromCode } from '../../src/engine/import'

describe('importFromCode — plain and legacy', () => {
  it('imports plain text', () => {
    const segs = importFromCode('Hello')
    expect(segs).toHaveLength(5)
    expect(segs.every(s => s.color === null)).toBe(true)
  })

  it('imports legacy codes', () => {
    const segs = importFromCode('&aHi')
    expect(segs[0].color).toBe('#55ff55')
    expect(segs[1].color).toBe('#55ff55')
  })

  it('imports § sign codes', () => {
    const segs = importFromCode('§aHi')
    expect(segs[0].color).toBe('#55ff55')
  })

  it('imports hex', () => {
    const segs = importFromCode('&#7c3aedX')
    expect(segs[0].color).toBe('#7c3aed')
  })
})

describe('importFromCode — MiniMessage colors', () => {
  it('imports <color:#...>', () => {
    const segs = importFromCode('<color:#ff0000>red</color>')
    expect(segs).toHaveLength(3)
    expect(segs.every(s => s.color === '#ff0000')).toBe(true)
  })

  it('imports named color <red>', () => {
    const segs = importFromCode('<red>R</red>')
    expect(segs[0].color).toBe('#ff5555')
  })

  it('imports short hex form <#ff0000>', () => {
    const segs = importFromCode('<#ff0000>X</color>')
    expect(segs[0].color).toBe('#ff0000')
  })
})

describe('importFromCode — MiniMessage styles', () => {
  it('imports <bold>', () => {
    const segs = importFromCode('<bold>BB</bold>')
    expect(segs[0].styles.bold).toBe(true)
  })

  it('imports <b> short form', () => {
    const segs = importFromCode('<b>BB</b>')
    expect(segs[0].styles.bold).toBe(true)
  })

  it('combines color + style', () => {
    const segs = importFromCode('<red><bold>X</bold></red>')
    expect(segs[0].color).toBe('#ff5555')
    expect(segs[0].styles.bold).toBe(true)
  })
})

describe('importFromCode — gradient expansion', () => {
  it('expands 2-stop gradient to per-char hex', () => {
    const segs = importFromCode('<gradient:#ff0000:#0000ff>ABC</gradient>')
    expect(segs).toHaveLength(3)
    expect(segs[0].color).toBe('#ff0000')
    expect(segs[2].color).toBe('#0000ff')
    // Middle is interpolated
    expect(segs[1].color).not.toBe('#ff0000')
    expect(segs[1].color).not.toBe('#0000ff')
  })

  it('expands 3-stop gradient', () => {
    const segs = importFromCode('<gradient:#ff0000:#00ff00:#0000ff>ABC</gradient>')
    expect(segs).toHaveLength(3)
    expect(segs[0].color).toBe('#ff0000')
    expect(segs[1].color).toBe('#00ff00')
    expect(segs[2].color).toBe('#0000ff')
  })

  it('handles empty gradient', () => {
    const segs = importFromCode('<gradient:#ff0000:#0000ff></gradient>')
    expect(segs).toHaveLength(0)
  })
})

describe('importFromCode — edge cases', () => {
  it('empty input returns empty segments', () => {
    expect(importFromCode('')).toEqual([])
  })

  it('strips unknown tags', () => {
    const segs = importFromCode('<unknown>X</unknown>')
    expect(segs).toHaveLength(1)
    expect(segs[0].char).toBe('X')
  })

  it('unescapes \\<', () => {
    const segs = importFromCode('\\<html>')
    expect(segs[0].char).toBe('<')
  })

  it('handles mixed legacy + minimessage', () => {
    const segs = importFromCode('&aHi <red>there</red>')
    expect(segs[0].color).toBe('#55ff55')
    expect(segs.at(-1)?.color).toBe('#ff5555')
  })
})
