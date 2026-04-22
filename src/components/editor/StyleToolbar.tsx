import type { MouseEvent } from 'react'
import type { StyleFlags } from '../../engine/types'
import { useT, type DictKey } from '../../i18n'
import './StyleToolbar.css'

type Item = {
  key: keyof StyleFlags | 'reset'
  label: DictKey
  visual: string
  className: string
}

const ITEMS: Item[] = [
  { key: 'bold',          label: 'editor.styleBold',          visual: 'B',   className: 'style-btn--bold' },
  { key: 'italic',        label: 'editor.styleItalic',        visual: 'I',   className: 'style-btn--italic' },
  { key: 'underline',     label: 'editor.styleUnderline',     visual: 'U',   className: 'style-btn--underline' },
  { key: 'strikethrough', label: 'editor.styleStrikethrough', visual: 'S',   className: 'style-btn--strikethrough' },
  { key: 'obfuscated',    label: 'editor.styleObfuscated',    visual: '▓▒░', className: 'style-btn--obfuscated' },
  { key: 'reset',         label: 'editor.styleReset',         visual: '↺',   className: 'style-btn--reset' },
]

type Props = {
  onStyle: (key: keyof StyleFlags) => void
  onReset: () => void
}

export function StyleToolbar({ onStyle, onReset }: Props) {
  const { t } = useT()

  function handleMouseDown(
    e: MouseEvent<HTMLButtonElement>,
    key: keyof StyleFlags | 'reset',
  ) {
    e.preventDefault()
    if (key === 'reset') onReset()
    else onStyle(key)
  }

  return (
    <div className="style-toolbar" role="toolbar" aria-label="Styles">
      {ITEMS.map(item => (
        <button
          key={item.key}
          type="button"
          className={`style-btn ${item.className}`}
          title={t(item.label)}
          aria-label={t(item.label)}
          onMouseDown={e => handleMouseDown(e, item.key)}
          onClick={e => e.preventDefault()}
        >
          {item.visual}
        </button>
      ))}
    </div>
  )
}
