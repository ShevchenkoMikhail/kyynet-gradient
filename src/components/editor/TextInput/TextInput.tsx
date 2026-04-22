import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import type { Segment } from '../../../engine/types'
import { shade } from '../../../utils/color'
import type { CSSProperties } from 'react'
import './TextInput.css'

type Props = {
  value: string
  segments: Segment[]
  onChange: (value: string) => void
  onSelectionChange?: () => void
  placeholder?: string
  ariaLabel?: string
}

export type TextInputHandle = {
  getSelection(): { start: number; end: number }
  setSelection(start: number, end: number): void
  focus(): void
  selectAll(): void
}

type McStyle = CSSProperties & Partial<Record<'--mc-shadow-color', string>>

export const TextInput = forwardRef<TextInputHandle, Props>(function TextInput(
  { value, segments, onChange, onSelectionChange, placeholder, ariaLabel },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      getSelection() {
        const ta = textareaRef.current
        return {
          start: ta?.selectionStart ?? value.length,
          end: ta?.selectionEnd ?? value.length,
        }
      },
      setSelection(start, end) {
        const ta = textareaRef.current
        if (!ta) return
        ta.focus()
        ta.setSelectionRange(start, end)
      },
      focus() {
        textareaRef.current?.focus()
      },
      selectAll() {
        const ta = textareaRef.current
        if (!ta) return
        ta.focus()
        ta.setSelectionRange(0, ta.value.length)
      },
    }),
    [value],
  )

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
  }

  function syncScroll() {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const overlay = renderOverlay(segments)

  return (
    <div className="ti-wrapper">
      <div className="ti-highlight" aria-hidden="true" ref={highlightRef}>
        {overlay}
      </div>
      <textarea
        ref={textareaRef}
        className="ti-textarea"
        value={value}
        onChange={handleChange}
        onSelect={onSelectionChange}
        onScroll={syncScroll}
        placeholder={placeholder}
        aria-label={ariaLabel}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
      />
    </div>
  )
})

function renderOverlay(segments: Segment[]): ReactNode {
  if (segments.length === 0) return null
  const nodes: ReactNode[] = []
  let i = 0
  while (i < segments.length) {
    const head = segments[i]
    let j = i + 1
    while (
      j < segments.length &&
      segments[j].color === head.color &&
      segments[j].gradientId === head.gradientId &&
      sameStyles(segments[j].styles, head.styles)
    ) {
      j++
    }
    const text = segments
      .slice(i, j)
      .map(s => s.char)
      .join('')
    const hasColor = head.color !== null
    const hasStyle =
      head.styles.bold ||
      head.styles.italic ||
      head.styles.underline ||
      head.styles.strikethrough ||
      head.styles.obfuscated
    const hasGradient = !!head.gradientId
    if (!hasColor && !hasStyle && !hasGradient) {
      nodes.push(<span key={i} className="ti-h-plain">{text}</span>)
    } else {
      const style: McStyle = {}
      if (head.color) {
        style.color = head.color
        style['--mc-shadow-color'] = shade(head.color, 0.3)
      }
      nodes.push(
        <span
          key={i}
          className={[
            'ti-h-fmt',
            head.styles.bold && 'ti-h--bold',
            head.styles.italic && 'ti-h--italic',
            head.styles.underline && 'ti-h--underline',
            head.styles.strikethrough && 'ti-h--strikethrough',
            head.styles.obfuscated && 'ti-h--obfuscated',
            hasGradient && 'ti-h--gradient',
          ]
            .filter(Boolean)
            .join(' ')}
          style={style}
        >
          {text}
        </span>,
      )
    }
    i = j
  }
  return nodes
}

function sameStyles(
  a: Segment['styles'],
  b: Segment['styles'],
): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strikethrough === b.strikethrough &&
    a.obfuscated === b.obfuscated
  )
}
