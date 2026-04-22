import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { HexColorPicker } from 'react-colorful'
import type { GradientStop } from '../../../engine/types'
import {
  colorsForN,
  interpolateAt,
  sortedStops,
} from '../../../engine/gradient/interpolate'
import {
  MAX_GRADIENT_STOPS,
  MIN_GRADIENT_STOPS,
} from '../../../constants/defaults'
import { normalizeHex } from '../../../utils/color'
import { GRADIENT_PRESETS } from '../../../engine/gradient/presets'
import { useT } from '../../../i18n'
import './GradientBuilder.css'

type BarStyle = CSSProperties & Partial<Record<'--gradient-preview', string>>
type StopStyle = CSSProperties & Partial<Record<'--stop-c', string>>

function makeStopId(): string {
  return `s_${Math.random().toString(36).slice(2, 10)}`
}

export function makeInitialStops(): GradientStop[] {
  return [
    { id: makeStopId(), position: 0, color: '#a855f7' },
    { id: makeStopId(), position: 1, color: '#4ade80' },
  ]
}

type Props = {
  onApply(stops: GradientStop[]): void
  onFlatten(): void
  canFlatten: boolean
}

export type GradientBuilderHandle = {
  /** Load external stops into the builder (e.g. from an imported gradient). */
  loadStops(stops: GradientStop[]): void
}

export const GradientBuilder = forwardRef<GradientBuilderHandle, Props>(function GradientBuilder(
  { onApply, onFlatten, canFlatten },
  ref,
) {
  const { t } = useT()
  const [stops, setStops] = useState<GradientStop[]>(() => makeInitialStops())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{
    id: string
    startX: number
    startPos: number
  } | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const sortedStopsList = useMemo(() => sortedStops(stops), [stops])

  const gradientCss = useMemo(() => {
    const parts = sortedStopsList.map(
      s => `${s.color} ${Math.round(s.position * 100)}%`,
    )
    return `linear-gradient(90deg, ${parts.join(', ')})`
  }, [sortedStopsList])

  const activeStop = stops.find(s => s.id === activeId) ?? null

  const updateStop = useCallback((id: string, patch: Partial<GradientStop>) => {
    setStops(prev =>
      prev.map(s => (s.id === id ? { ...s, ...patch } : s)),
    )
  }, [])

  const removeStop = useCallback((id: string) => {
    setStops(prev => {
      if (prev.length <= MIN_GRADIENT_STOPS) return prev
      return prev.filter(s => s.id !== id)
    })
    setActiveId(null)
  }, [])

  const addStopAt = useCallback((position: number) => {
    if (stops.length >= MAX_GRADIENT_STOPS) return
    const color = interpolateAt(stops, position)
    const newStop: GradientStop = { id: makeStopId(), position, color }
    setStops(prev => [...prev, newStop])
    setActiveId(newStop.id)
  }, [stops])

  function handleBarClick(e: ReactMouseEvent<HTMLDivElement>) {
    const bar = barRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pos = Math.max(0, Math.min(1, x / rect.width))
    addStopAt(pos)
  }

  function handleStopPointerDown(
    e: ReactPointerEvent<HTMLButtonElement>,
    id: string,
  ) {
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const stop = stops.find(s => s.id === id)
    if (!stop) return
    setActiveId(id)
    setDragState({ id, startX: e.clientX, startPos: stop.position })
  }

  function handleStopPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragState) return
    const bar = barRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const dx = e.clientX - dragState.startX
    const next = Math.max(
      0,
      Math.min(1, dragState.startPos + dx / rect.width),
    )
    updateStop(dragState.id, { position: next })
  }

  function handleStopPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    setDragState(null)
  }

  function handleStopKeyDown(e: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      removeStop(id)
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const delta = e.key === 'ArrowLeft' ? -0.02 : 0.02
      const s = stops.find(x => x.id === id)
      if (!s) return
      updateStop(id, { position: Math.max(0, Math.min(1, s.position + delta)) })
    }
  }

  // Close popover on Escape; Delete inside popover removes the active stop.
  useEffect(() => {
    if (!activeId) return
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveId(null)
        return
      }
      if (e.key === 'Delete') {
        const target = e.target as HTMLElement | null
        // Don't remove while typing in the hex input
        if (target?.tagName === 'INPUT') return
        if (stops.length > MIN_GRADIENT_STOPS && activeId) removeStop(activeId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeId, removeStop, stops.length])

  // Close popover when clicking outside, or on scroll/resize.
  useEffect(() => {
    if (!activeId) return
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null
      if (!target) return
      const popover = document.querySelector('.gradient-popover')
      const stopsEls = document.querySelectorAll('.gradient-stop')
      if (popover?.contains(target)) return
      for (const el of stopsEls) if (el.contains(target)) return
      setActiveId(null)
    }
    function handleScroll() {
      setActiveId(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [activeId])

  function handleApply() {
    onApply(sortedStopsList)
  }

  function applyPreset(presetId: string) {
    const preset = GRADIENT_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    setStops(preset.stops.map(s => ({ ...s, id: makeStopId() })))
    setActiveId(null)
  }

  useImperativeHandle(ref, () => ({
    loadStops(externalStops: GradientStop[]) {
      if (!externalStops || externalStops.length < MIN_GRADIENT_STOPS) return
      const clampedCount = Math.min(externalStops.length, MAX_GRADIENT_STOPS)
      setStops(
        externalStops.slice(0, clampedCount).map(s => ({
          id: makeStopId(),
          position: Math.max(0, Math.min(1, s.position)),
          color: s.color,
        })),
      )
      setActiveId(null)
    },
  }), [])

  // Preview-only quick overview — 5 colors from the gradient
  const quickPreview = useMemo(() => colorsForN(stops, 5), [stops])

  return (
    <div className="gradient-builder">
      <div className="gradient-bar-wrap">
        <div
          ref={barRef}
          className="gradient-bar"
          style={{ '--gradient-preview': gradientCss } as BarStyle}
          onClick={handleBarClick}
          role="group"
          aria-label="Gradient bar"
        >
          <div className="gradient-bar__checker" />
          {stops.map(stop => (
            <button
              key={stop.id}
              type="button"
              className={`gradient-stop${stop.id === activeId ? ' gradient-stop--active' : ''}`}
              style={{
                left: `${stop.position * 100}%`,
                '--stop-c': stop.color,
              } as StopStyle}
              onPointerDown={e => handleStopPointerDown(e, stop.id)}
              onPointerMove={handleStopPointerMove}
              onPointerUp={handleStopPointerUp}
              onKeyDown={e => handleStopKeyDown(e, stop.id)}
              onClick={e => {
                e.stopPropagation()
                setActiveId(stop.id)
              }}
              aria-label={`Gradient stop at ${Math.round(stop.position * 100)}%`}
            />
          ))}
        </div>

      </div>

      {activeStop && (
        <StopPopover
          stop={activeStop}
          barRef={barRef}
          onChange={(color: string) => updateStop(activeStop.id, { color })}
          onRemove={() => removeStop(activeStop.id)}
          canRemove={stops.length > MIN_GRADIENT_STOPS}
        />
      )}

      <p className="gradient-builder__hint">
        {t('editor.gradientStopHint')}
      </p>

      <div className="gradient-builder__actions">
        <button
          type="button"
          className="gradient-builder__apply"
          onMouseDown={e => e.preventDefault()}
          onClick={handleApply}
        >
          {t('editor.gradientApply')}
        </button>
        <button
          type="button"
          className="gradient-builder__flatten"
          onClick={onFlatten}
          disabled={!canFlatten}
        >
          {t('editor.gradientFlatten')}
        </button>
      </div>

      {/* Visual micro-preview row of sampled colors */}
      <div
        aria-hidden="true"
        className="gradient-builder__mini-preview"
      >
        {quickPreview.map((c, i) => (
          <div key={i} style={{ background: c }} />
        ))}
      </div>

      <div className="gradient-presets">
        <h4 className="gradient-presets__label">
          {t('editor.gradientPresetsHeading')}
        </h4>
        <div className="gradient-presets__list" role="list">
          {GRADIENT_PRESETS.map(preset => {
            const css = `linear-gradient(90deg, ${preset.stops
              .map(s => `${s.color} ${Math.round(s.position * 100)}%`)
              .join(', ')})`
            return (
              <button
                key={preset.id}
                type="button"
                className="gradient-preset"
                style={{ background: css }}
                onClick={() => applyPreset(preset.id)}
                onMouseDown={e => e.preventDefault()}
                title={t(preset.nameKey)}
                aria-label={t(preset.nameKey)}
              >
                <span className="gradient-preset__name">{t(preset.nameKey)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})

type StopPopoverProps = {
  stop: GradientStop
  barRef: RefObject<HTMLDivElement | null>
  onChange(color: string): void
  onRemove(): void
  canRemove: boolean
}

function StopPopover({
  stop,
  barRef,
  onChange,
  onRemove,
  canRemove,
}: StopPopoverProps) {
  const { t } = useT()
  const popRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState(stop.color)
  const [posStyle, setPosStyle] = useState<CSSProperties>({
    visibility: 'hidden',
    left: 0,
    top: 0,
  })

  useEffect(() => {
    setInput(stop.color)
  }, [stop.color])

  useLayoutEffect(() => {
    const pop = popRef.current
    const bar = barRef.current
    if (!pop || !bar) return
    const barRect = bar.getBoundingClientRect()
    const popW = pop.offsetWidth
    const popH = pop.offsetHeight
    const pad = 8
    const stopCenterX = barRect.left + stop.position * barRect.width
    const halfPop = popW / 2
    let leftPx = stopCenterX - halfPop
    leftPx = Math.max(pad, Math.min(window.innerWidth - popW - pad, leftPx))
    // Below the bar + space for the stop marker (~28px)
    let topPx = barRect.bottom + 34
    // If it would go below viewport, flip above
    if (topPx + popH > window.innerHeight - pad) {
      topPx = barRect.top - popH - 16
    }
    setPosStyle({
      left: `${Math.round(leftPx)}px`,
      top: `${Math.round(topPx)}px`,
    })
  }, [stop.position, barRef])

  function handleInputChange(raw: string) {
    setInput(raw)
    const normalized = normalizeHex(raw)
    if (normalized) onChange(normalized)
  }

  return createPortal(
    <div
      ref={popRef}
      className="gradient-popover"
      style={posStyle}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <HexColorPicker color={stop.color} onChange={onChange} />
      <input
        type="text"
        className="gradient-popover__input"
        value={input}
        onChange={e => handleInputChange(e.target.value)}
        spellCheck={false}
        maxLength={7}
        aria-label="Hex color"
      />
      {canRemove && (
        <button
          type="button"
          className="gradient-popover__remove-link"
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          onClick={onRemove}
        >
          {t('editor.gradientRemoveStop')}
        </button>
      )}
    </div>,
    document.body,
  )
}
