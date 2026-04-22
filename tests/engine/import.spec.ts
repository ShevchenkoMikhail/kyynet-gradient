import { describe, it, expect } from 'vitest'
import { importFromCode } from '../../src/engine/import'

describe('importFromCode — plain and legacy', () => {
  it('imports plain text', () => {
    const { segments: segs } = importFromCode('Hello')
    expect(segs).toHaveLength(5)
    expect(segs.every(s => s.color === null)).toBe(true)
  })

  it('imports legacy codes', () => {
    const { segments: segs } = importFromCode('&aHi')
    expect(segs[0].color).toBe('#55ff55')
    expect(segs[1].color).toBe('#55ff55')
  })

  it('imports § sign codes', () => {
    const { segments: segs } = importFromCode('§aHi')
    expect(segs[0].color).toBe('#55ff55')
  })

  it('imports hex', () => {
    const { segments: segs } = importFromCode('&#7c3aedX')
    expect(segs[0].color).toBe('#7c3aed')
  })
})

describe('importFromCode — MiniMessage colors', () => {
  it('imports <color:#...>', () => {
    const { segments: segs } = importFromCode('<color:#ff0000>red</color>')
    expect(segs).toHaveLength(3)
    expect(segs.every(s => s.color === '#ff0000')).toBe(true)
  })

  it('imports named color <red>', () => {
    const { segments: segs } = importFromCode('<red>R</red>')
    expect(segs[0].color).toBe('#ff5555')
  })

  it('imports short hex form <#ff0000>', () => {
    const { segments: segs } = importFromCode('<#ff0000>X</color>')
    expect(segs[0].color).toBe('#ff0000')
  })
})

describe('importFromCode — MiniMessage styles', () => {
  it('imports <bold>', () => {
    const { segments: segs } = importFromCode('<bold>BB</bold>')
    expect(segs[0].styles.bold).toBe(true)
  })

  it('imports <b> short form', () => {
    const { segments: segs } = importFromCode('<b>BB</b>')
    expect(segs[0].styles.bold).toBe(true)
  })

  it('combines color + style', () => {
    const { segments: segs } = importFromCode('<red><bold>X</bold></red>')
    expect(segs[0].color).toBe('#ff5555')
    expect(segs[0].styles.bold).toBe(true)
  })
})

describe('importFromCode — gradient expansion', () => {
  it('expands 2-stop gradient to per-char hex', () => {
    const { segments: segs } = importFromCode('<gradient:#ff0000:#0000ff>ABC</gradient>')
    expect(segs).toHaveLength(3)
    expect(segs[0].color).toBe('#ff0000')
    expect(segs[2].color).toBe('#0000ff')
    // Middle is interpolated
    expect(segs[1].color).not.toBe('#ff0000')
    expect(segs[1].color).not.toBe('#0000ff')
  })

  it('expands 3-stop gradient', () => {
    const { segments: segs } = importFromCode('<gradient:#ff0000:#00ff00:#0000ff>ABC</gradient>')
    expect(segs).toHaveLength(3)
    expect(segs[0].color).toBe('#ff0000')
    expect(segs[1].color).toBe('#00ff00')
    expect(segs[2].color).toBe('#0000ff')
  })

  it('handles empty gradient', () => {
    const { segments: segs } = importFromCode('<gradient:#ff0000:#0000ff></gradient>')
    expect(segs).toHaveLength(0)
  })
})

describe('importFromCode — gradient preservation', () => {
  it('returns gradient dict with stops for <gradient>', () => {
    const { gradients, lastGradientStops } = importFromCode(
      '<gradient:#ff0000:#00ff00:#0000ff>ABC</gradient>',
    )
    const keys = Object.keys(gradients)
    expect(keys).toHaveLength(1)
    const g = gradients[keys[0]]
    expect(g.stops).toHaveLength(3)
    expect(g.stops[0].color).toBe('#ff0000')
    expect(g.stops[1].color).toBe('#00ff00')
    expect(g.stops[2].color).toBe('#0000ff')
    expect(lastGradientStops).toBeDefined()
    expect(lastGradientStops).toHaveLength(3)
  })

  it('sets gradientId on every char inside <gradient>', () => {
    const { segments, gradients } = importFromCode(
      '<gradient:#ff0000:#0000ff>ABC</gradient>',
    )
    const gid = Object.keys(gradients)[0]
    expect(segments.every(s => s.gradientId === gid)).toBe(true)
  })

  it('preserves <bold> inside gradient', () => {
    const { segments } = importFromCode(
      '<gradient:#ff0000:#0000ff><bold>ABC</bold></gradient>',
    )
    expect(segments.every(s => s.styles.bold)).toBe(true)
  })

  it('returns stops of the LAST gradient in input', () => {
    const { lastGradientStops } = importFromCode(
      '<gradient:#ff0000:#0000ff>A</gradient> <gradient:#00ff00:#ffff00>B</gradient>',
    )
    expect(lastGradientStops).toBeDefined()
    expect(lastGradientStops![0].color).toBe('#00ff00')
    expect(lastGradientStops![1].color).toBe('#ffff00')
  })
})

describe('importFromCode — edge cases', () => {
  it('empty input returns empty result', () => {
    const result = importFromCode('')
    expect(result.segments).toEqual([])
    expect(result.gradients).toEqual({})
    expect(result.lastGradientStops).toBeUndefined()
  })

  it('strips unknown tags', () => {
    const { segments: segs } = importFromCode('<unknown>X</unknown>')
    expect(segs).toHaveLength(1)
    expect(segs[0].char).toBe('X')
  })

  it('unescapes \\<', () => {
    const { segments: segs } = importFromCode('\\<html>')
    expect(segs[0].char).toBe('<')
  })

  it('handles mixed legacy + minimessage', () => {
    const { segments: segs } = importFromCode('&aHi <red>there</red>')
    expect(segs[0].color).toBe('#55ff55')
    expect(segs.at(-1)?.color).toBe('#ff5555')
  })
})
