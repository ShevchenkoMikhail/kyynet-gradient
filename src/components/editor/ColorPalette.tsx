import type { CSSProperties, MouseEvent } from 'react'
import { LEGACY_PALETTE } from '../../engine/minecraft/legacyPalette'
import { hexToRgb } from '../../utils/color'
import { useT } from '../../i18n'
import './ColorPalette.css'

type SwatchStyle = CSSProperties & Partial<Record<'--swatch-c', string>>

type Props = {
  onColor: (hex: string) => void
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const l = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return l > 0.55
}

export function ColorPalette({ onColor }: Props) {
  const { lang } = useT()

  function handleMouseDown(e: MouseEvent<HTMLButtonElement>, hex: string) {
    e.preventDefault()
    onColor(hex)
  }

  return (
    <div className="palette" role="toolbar" aria-label="Colors">
      {LEGACY_PALETTE.map(entry => {
        const title = lang === 'ru' ? entry.nameRu : entry.name
        return (
          <button
            key={entry.code}
            type="button"
            className="palette__swatch"
            style={{ '--swatch-c': entry.hex } as SwatchStyle}
            data-light={isLightColor(entry.hex)}
            title={title}
            aria-label={title}
            onMouseDown={e => handleMouseDown(e, entry.hex)}
            onClick={e => e.preventDefault()}
          />
        )
      })}
    </div>
  )
}
