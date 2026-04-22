import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { confettiBus } from '../bus'

const GREEN_PALETTE = ['#4ade80', '#22c55e', '#86efac', '#a855f7', '#c084fc']

export function ConfettiHost() {
  useEffect(() => {
    return confettiBus.subscribe(({ x, y }) => {
      const originX = x / window.innerWidth
      const originY = y / window.innerHeight
      void confetti({
        particleCount: 44,
        spread: 55,
        startVelocity: 38,
        ticks: 70,
        gravity: 0.9,
        scalar: 0.9,
        origin: { x: originX, y: originY },
        colors: GREEN_PALETTE,
        disableForReducedMotion: true,
      })
    })
  }, [])
  return null
}
