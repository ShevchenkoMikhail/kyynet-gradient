import type { CSSProperties } from 'react'
import type { Segment } from '../../engine/types'
import { shade } from '../../utils/color'
import { useObfuscatedTick } from './useObfuscatedTick'

type McCharStyle = CSSProperties & Record<'--mc-shadow-color', string>

const OBFUSCATE_POOL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?*/><=+-'

function randomGlyph(): string {
  return OBFUSCATE_POOL[Math.floor(Math.random() * OBFUSCATE_POOL.length)]
}

function styleForColor(color: string): McCharStyle {
  return {
    color,
    '--mc-shadow-color': shade(color, 0.25),
  } as McCharStyle
}

export function RenderedLine({ segments }: { segments: Segment[] }) {
  const hasObfuscated = segments.some(s => s.styles.obfuscated)
  return hasObfuscated ? <AnimatedLine segments={segments} /> : <StaticLine segments={segments} />
}

function StaticLine({ segments }: { segments: Segment[] }) {
  return (
    <span className="mc-line">
      {segments.map((seg, i) => renderChar(seg, i))}
    </span>
  )
}

function AnimatedLine({ segments }: { segments: Segment[] }) {
  useObfuscatedTick()
  return (
    <span className="mc-line">
      {segments.map((seg, i) => renderChar(seg, i))}
    </span>
  )
}

function renderChar(seg: Segment, i: number) {
  const color = seg.color ?? '#ffffff'
  const style = styleForColor(color)
  const char = seg.styles.obfuscated && seg.char !== ' ' ? randomGlyph() : seg.char
  return (
    <span
      key={i}
      className="mc-char"
      style={style}
      data-bold={seg.styles.bold || undefined}
      data-italic={seg.styles.italic || undefined}
      data-underline={seg.styles.underline || undefined}
      data-strikethrough={seg.styles.strikethrough || undefined}
    >
      {char}
    </span>
  )
}
