import { useRef, useState } from 'react'
import { useT } from '../../i18n'
import { useCopyFeedback } from '../../state/useCopyFeedback'

type Props = {
  value: string
}

export function CopyButton({ value }: Props) {
  const { t } = useT()
  const copy = useCopyFeedback()
  const [copied, setCopied] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function handleClick() {
    const ok = await copy(value, btnRef.current)
    if (!ok) return
    setCopied(true)
    if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={handleClick}
      aria-label={t('output.copy')}
    >
      {copied ? (
        <>
          <svg className="copy-btn__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8.5l3 3 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('output.copied')}</span>
        </>
      ) : (
        <>
          <svg className="copy-btn__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M3 10.5V3.5A1.5 1.5 0 014.5 2H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>{t('output.copy')}</span>
        </>
      )}
    </button>
  )
}
