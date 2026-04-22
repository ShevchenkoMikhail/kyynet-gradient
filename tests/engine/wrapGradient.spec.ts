import { describe, it, expect } from 'vitest'
import {
  wrapRangeWithGradient,
  nextGradientId,
  resetGradientIdCounter,
  takeNextGradientIdFromExisting,
} from '../../src/engine/gradient/apply'

describe('wrapRangeWithGradient', () => {
  it('wraps a substring', () => {
    const out = wrapRangeWithGradient('Hello world', 6, 11, 'g1')
    expect(out).toBe('Hello §{g1}world§{/g1}')
  })

  it('clamps out-of-range indices', () => {
    const out = wrapRangeWithGradient('abc', -5, 1000, 'g2')
    expect(out).toBe('§{g2}abc§{/g2}')
  })

  it('works with zero-length range', () => {
    const out = wrapRangeWithGradient('abc', 1, 1, 'g3')
    expect(out).toBe('a§{g3}§{/g3}bc')
  })
})

describe('nextGradientId', () => {
  it('increments', () => {
    resetGradientIdCounter(0)
    expect(nextGradientId()).toBe('g1')
    expect(nextGradientId()).toBe('g2')
    expect(nextGradientId()).toBe('g3')
  })

  it('takeNextGradientIdFromExisting avoids collisions', () => {
    resetGradientIdCounter(0)
    const id = takeNextGradientIdFromExisting({
      g5: { id: 'g5', stops: [] },
      g2: { id: 'g2', stops: [] },
    })
    expect(id).toBe('g6')
  })
})
