import { useState, type CSSProperties, type ChangeEvent, type MouseEvent } from 'react'
import { HexColorPicker as ColorfulHexPicker } from 'react-colorful'
import { normalizeHex } from '../../utils/color'
import { useT } from '../../i18n'
import './HexColorPicker.css'

type PickerStyle = CSSProperties & Partial<Record<'--picker-c', string>>

type Props = {
  onColor: (hex: string) => void
  initial?: string
}

export function HexColorPicker({ onColor, initial = '#a855f7' }: Props) {
  const { t } = useT()
  const [color, setColor] = useState<string>(initial)
  const [input, setInput] = useState<string>(initial)

  function handleColorChange(next: string) {
    setColor(next)
    setInput(next)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setInput(raw)
    const normalized = normalizeHex(raw)
    if (normalized) setColor(normalized)
  }

  function handleApply(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const normalized = normalizeHex(color) ?? '#ffffff'
    onColor(normalized)
  }

  return (
    <div className="hex-picker">
      <div className="hex-picker__body">
        <div className="hex-picker__picker">
          <ColorfulHexPicker color={color} onChange={handleColorChange} />
        </div>
        <div className="hex-picker__controls">
          <div
            className="hex-picker__swatch"
            style={{ '--picker-c': color } as PickerStyle}
            aria-hidden="true"
          />
          <div className="hex-picker__input-row">
            <input
              type="text"
              className="hex-picker__input"
              value={input}
              onChange={handleInputChange}
              spellCheck={false}
              aria-label="Hex color value"
              maxLength={7}
            />
          </div>
          <button
            type="button"
            className="hex-picker__apply"
            onMouseDown={e => e.preventDefault()}
            onClick={handleApply}
          >
            {t('editor.hexApply')}
          </button>
        </div>
      </div>
    </div>
  )
}
