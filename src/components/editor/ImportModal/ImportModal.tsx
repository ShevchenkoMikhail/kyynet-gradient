import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { importFromCode, type ImportResult } from '../../../engine/import'
import { useT } from '../../../i18n'
import './ImportModal.css'

type Props = {
  open: boolean
  onClose(): void
  onImport(result: ImportResult): void
}

export function ImportModal({ open, onClose, onImport }: Props) {
  const { t } = useT()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) {
      setValue('')
      setError(null)
      return
    }
    // Focus textarea shortly after mount
    const id = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleImport()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value])

  if (!open) return null

  function handleImport() {
    const trimmed = value.trim()
    if (!trimmed) {
      setError(t('editor.importEmpty'))
      return
    }
    try {
      const result = importFromCode(trimmed)
      if (result.segments.length === 0) {
        setError(t('editor.importError'))
        return
      }
      onImport(result)
      onClose()
    } catch {
      setError(t('editor.importError'))
    }
  }

  return createPortal(
    <div
      className="import-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div
        className="import-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="import-modal__header">
          <h3 id="import-modal-title" className="import-modal__title">
            {t('editor.importTitle')}
          </h3>
          <button
            type="button"
            className="import-modal__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="import-modal__textarea"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          placeholder={t('editor.importPlaceholder')}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        {error && <div className="import-modal__error">{error}</div>}
        <div className="import-modal__actions">
          <button
            type="button"
            className="import-modal__cancel"
            onClick={onClose}
          >
            {t('editor.importCancel')}
          </button>
          <button
            type="button"
            className="import-modal__apply"
            onClick={handleImport}
          >
            {t('editor.importApply')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
