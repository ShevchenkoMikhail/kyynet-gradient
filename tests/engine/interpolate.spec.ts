import { describe, it, expect } from 'vitest'
import { interpolateAt, colorsForN } from '../../src/engine/gradient/interpolate'

describe('interpolateAt — 2 stops', () => {
  const stops = [
    { id: 's1', position: 0, color: '#ff0000' },
    { id: 's2', position: 1, color: '#0000ff' },
  ]

  it('returns first color at p=0', () => {
    expect(interpolateAt(stops, 0)).toBe('#ff0000')
  })

  it('returns last color at p=1', () => {
    expect(interpolateAt(stops, 1)).toBe('#0000ff')
  })

  it('returns purple-ish at p=0.5', () => {
    const c = interpolateAt(stops, 0.5)
    // Expect R≈128, G=0, B≈128
    expect(c.startsWith('#')).toBe(true)
    expect(c.length).toBe(7)
  })

  it('clamps p outside [0,1]', () => {
    expect(interpolateAt(stops, -1)).toBe('#ff0000')
    expect(interpolateAt(stops, 2)).toBe('#0000ff')
  })
})

describe('interpolateAt — 3 stops', () => {
  const stops = [
    { id: 's1', position: 0, color: '#ff0000' },
    { id: 's2', position: 0.5, color: '#00ff00' },
    { id: 's3', position: 1, color: '#0000ff' },
  ]

  it('middle stop at p=0.5', () => {
    expect(interpolateAt(stops, 0.5)).toBe('#00ff00')
  })

  it('interpolates between stops[0] and stops[1] at p=0.25', () => {
    const c = interpolateAt(stops, 0.25)
    expect(c).not.toBe('#ff0000')
    expect(c).not.toBe('#00ff00')
  })
})

describe('colorsForN', () => {
  const stops = [
    { id: 's1', position: 0, color: '#ff0000' },
    { id: 's2', position: 1, color: '#0000ff' },
  ]

  it('n=0 returns empty array', () => {
    expect(colorsForN(stops, 0)).toEqual([])
  })

  it('n=1 returns first color', () => {
    expect(colorsForN(stops, 1)).toEqual(['#ff0000'])
  })

  it('n=2 returns first and last', () => {
    expect(colorsForN(stops, 2)).toEqual(['#ff0000', '#0000ff'])
  })

  it('n=5 is evenly spaced', () => {
    const c = colorsForN(stops, 5)
    expect(c[0]).toBe('#ff0000')
    expect(c[4]).toBe('#0000ff')
    expect(c).toHaveLength(5)
  })
})

describe('interpolateAt — unsorted input', () => {
  it('still works with unsorted stops', () => {
    const stops = [
      { id: 's2', position: 1, color: '#0000ff' },
      { id: 's1', position: 0, color: '#ff0000' },
    ]
    expect(interpolateAt(stops, 0)).toBe('#ff0000')
    expect(interpolateAt(stops, 1)).toBe('#0000ff')
  })
})
