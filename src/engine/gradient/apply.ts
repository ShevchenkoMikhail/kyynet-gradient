import type { Gradient } from '../types'

let gradientIdCounter = 0

export function nextGradientId(): string {
  gradientIdCounter += 1
  return `g${gradientIdCounter}`
}

export function resetGradientIdCounter(next: number = 0): void {
  gradientIdCounter = next
}

export function takeNextGradientIdFromExisting(
  gradients: Record<string, Gradient>,
): string {
  let max = 0
  for (const id of Object.keys(gradients)) {
    const m = id.match(/^g(\d+)$/)
    if (m) {
      const n = Number(m[1])
      if (n > max) max = n
    }
  }
  gradientIdCounter = Math.max(gradientIdCounter, max)
  return nextGradientId()
}

export function wrapRangeWithGradient(
  rawText: string,
  start: number,
  end: number,
  gradientId: string,
): string {
  const clampedStart = Math.max(0, Math.min(rawText.length, start))
  const clampedEnd = Math.max(clampedStart, Math.min(rawText.length, end))
  const before = rawText.slice(0, clampedStart)
  const middle = rawText.slice(clampedStart, clampedEnd)
  const after = rawText.slice(clampedEnd)
  return `${before}§{${gradientId}}${middle}§{/${gradientId}}${after}`
}
