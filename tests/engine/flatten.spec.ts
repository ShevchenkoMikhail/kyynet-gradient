import { describe, it, expect } from 'vitest'
import { flattenGradients } from '../../src/engine/gradient/flatten'
import type { Gradient } from '../../src/engine/types'

describe('flattenGradients', () => {
  const g: Gradient = {
    id: 'g1',
    stops: [
      { id: 's1', position: 0, color: '#ff0000' },
      { id: 's2', position: 1, color: '#0000ff' },
    ],
  }

  it('replaces 2-stop span with per-char hex codes', () => {
    const out = flattenGradients('§{g1}AB§{/g1}', { g1: g })
    expect(out).toBe('&#ff0000A&#0000ffB')
  })

  it('leaves non-gradient text alone', () => {
    const out = flattenGradients('Hello', { g1: g })
    expect(out).toBe('Hello')
  })

  it('preserves text around the span', () => {
    const out = flattenGradients('X§{g1}AB§{/g1}Y', { g1: g })
    expect(out.startsWith('X')).toBe(true)
    expect(out.endsWith('Y')).toBe(true)
  })

  it('preserves style codes inside the span', () => {
    const out = flattenGradients('§{g1}&lAB§{/g1}', { g1: g })
    expect(out).toContain('&l')
    expect(out).toContain('&#ff0000A')
    expect(out).toContain('&#0000ffB')
  })

  it('drops color codes inside the span', () => {
    const out = flattenGradients('§{g1}&cA§{/g1}', { g1: g })
    expect(out).not.toContain('&c')
    expect(out).toContain('&#ff0000A')
  })

  it('handles empty span', () => {
    const out = flattenGradients('§{g1}§{/g1}', { g1: g })
    expect(out).toBe('')
  })

  it('handles missing gradient definition gracefully', () => {
    const out = flattenGradients('§{g99}AB§{/g99}', {})
    expect(out).toBe('AB')
  })
})
