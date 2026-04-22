import { useCallback, useEffect, useRef, useState } from 'react'
import type { Gradient, GradientStop, Segment, StyleFlags } from '../../engine/types'
import { useT } from '../../i18n'
import { TextInput, type TextInputHandle } from './TextInput/TextInput'
import { ColorPalette } from './ColorPalette'
import { StyleToolbar } from './StyleToolbar'
import { HexColorPicker } from './HexColorPicker'
import { GradientBuilder } from './GradientBuilder/GradientBuilder'
import { ImportModal } from './ImportModal/ImportModal'
import { copyToClipboard } from '../../utils/clipboard'
import { toastBus } from '../feedback/bus'
import './Editor.css'

type Props = {
  text: string
  setText: (next: string) => void
  segments: Segment[]
  gradients: Record<string, Gradient>
  applyColor: (start: number, end: number, hex: string) => void
  applyStyleToggle: (start: number, end: number, key: keyof StyleFlags) => void
  applyResetRange: (start: number, end: number) => void
  applyGradient: (start: number, end: number, stops: GradientStop[]) => void
  clearAllFormatting: () => void
  replaceSegments: (segments: Segment[], gradients?: Record<string, Gradient>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function Editor({
  text,
  segments,
  setText,
  gradients,
  applyColor,
  applyStyleToggle,
  applyResetRange,
  applyGradient,
  clearAllFormatting,
  replaceSegments,
  undo,
  redo,
  canUndo,
  canRedo,
}: Props) {
  const inputRef = useRef<TextInputHandle>(null)
  const { t } = useT()
  const [, setSelTick] = useState(0)
  const [importOpen, setImportOpen] = useState(false)

  const getRange = useCallback((): { start: number; end: number; explicit: boolean } => {
    const sel = inputRef.current?.getSelection() ?? { start: 0, end: 0 }
    const explicit = sel.end > sel.start
    if (explicit) return { start: sel.start, end: sel.end, explicit: true }
    return { start: 0, end: text.length, explicit: false }
  }, [text.length])

  const selectionLength = (() => {
    const sel = inputRef.current?.getSelection()
    if (!sel) return 0
    return Math.max(0, sel.end - sel.start)
  })()

  const onColorApply = (hex: string) => {
    const { start, end } = getRange()
    applyColor(start, end, hex)
    inputRef.current?.focus()
  }

  const onStyleApply = (key: keyof StyleFlags) => {
    const { start, end } = getRange()
    applyStyleToggle(start, end, key)
    inputRef.current?.focus()
  }

  const onReset = () => {
    const { start, end } = getRange()
    applyResetRange(start, end)
    inputRef.current?.focus()
  }

  const onGradientApply = (stops: GradientStop[]) => {
    const { start, end } = getRange()
    applyGradient(start, end, stops)
    inputRef.current?.focus()
  }

  const handleImport = (imported: Segment[]) => {
    replaceSegments(imported, {})
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleShare = async () => {
    const ok = await copyToClipboard(window.location.href)
    toastBus.push(
      ok ? t('editor.shareLinkCopied') : t('output.copyFailed'),
      ok ? 'success' : 'error',
    )
  }

  // Keyboard shortcuts: Ctrl+Z undo, Ctrl+Shift+Z / Ctrl+Y redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return
      const target = e.target as HTMLElement | null
      // Don't hijack native input/textarea undo unless it's our textarea
      const isOurTextarea = target?.classList.contains('ti-textarea')
      const isImportModal = target?.closest('.import-modal')
      if (isImportModal) return
      if (e.key === 'z' || e.key === 'Z') {
        // Native undo in textarea is per-field and doesn't know our model — we override
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault()
        redo()
      }
      if (!isOurTextarea) return
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const hasGradients = Object.keys(gradients).length > 0

  return (
    <section className="editor">
      <div className="editor__header">
        <h2 className="kn-section-heading">{t('editor.heading')}</h2>
        <div className="editor__header-actions">
          <span className="editor__char-count">
            {t('editor.charCount', { n: text.length })}
          </span>
          <div className="editor__icon-group" role="toolbar">
            <button
              type="button"
              className="editor__icon-btn"
              onClick={undo}
              disabled={!canUndo}
              title={t('editor.undo')}
              aria-label={t('editor.undo')}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 7h6a3 3 0 010 6H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="editor__icon-btn"
              onClick={redo}
              disabled={!canRedo}
              title={t('editor.redo')}
              aria-label={t('editor.redo')}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 7H6a3 3 0 000 6h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            className="editor__text-btn"
            onClick={() => setImportOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8M5 7l3 3 3-3M2.5 13h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t('editor.importCode')}</span>
          </button>
          <button
            type="button"
            className="editor__text-btn"
            onClick={handleShare}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="12" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="12" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5.7 7l4.6-2.7M5.7 9l4.6 2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>{t('editor.shareLink')}</span>
          </button>
        </div>
        <div className="editor__selection-hint">
          {selectionLength > 0
            ? t('editor.appliesToSelection', { n: selectionLength })
            : t('editor.appliesToAll')}
        </div>
      </div>

      <TextInput
        ref={inputRef}
        value={text}
        segments={segments}
        onChange={setText}
        onSelectionChange={() => setSelTick(t => t + 1)}
        placeholder={t('editor.textareaPlaceholder')}
        ariaLabel={t('editor.textareaLabel')}
      />

      <div className="editor__toolbars">
        <div className="editor__tool-block editor__tool-block--hex">
          <h3>{t('editor.hexHeading')}</h3>
          <HexColorPicker onColor={onColorApply} />
        </div>

        <div className="editor__tool-block editor__tool-block--colors">
          <h3>{t('editor.colorsHeading')}</h3>
          <ColorPalette onColor={onColorApply} />
        </div>

        <div className="editor__tool-block editor__tool-block--styles">
          <h3>{t('editor.stylesHeading')}</h3>
          <StyleToolbar onStyle={onStyleApply} onReset={onReset} />
        </div>

        <div className="editor__tool-block editor__tool-block--gradient">
          <h3>{t('editor.gradientHeading')}</h3>
          <GradientBuilder
            onApply={onGradientApply}
            onFlatten={clearAllFormatting}
            canFlatten={hasGradients}
          />
        </div>
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </section>
  )
}
