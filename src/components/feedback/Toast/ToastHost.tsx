import { useEffect, useState } from 'react'
import { toastBus, type ToastEvent } from '../bus'
import '../Toast.css'

type ActiveToast = ToastEvent & { leaving?: boolean }

const AUTO_DISMISS_MS = 4000
const LEAVE_MS = 700
const MAX_VISIBLE = 3

export function ToastHost() {
  const [toasts, setToasts] = useState<ActiveToast[]>([])

  useEffect(() => {
    return toastBus.subscribe(event => {
      setToasts(prev => {
        const next = [...prev, { ...event }]
        if (next.length > MAX_VISIBLE) next.shift()
        return next
      })
      setTimeout(() => {
        setToasts(prev => prev.map(t => (t.id === event.id ? { ...t, leaving: true } : t)))
      }, AUTO_DISMISS_MS)
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== event.id))
      }, AUTO_DISMISS_MS + LEAVE_MS)
    })
  }, [])

  if (toasts.length === 0) return null
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast--${t.tone}${t.leaving ? ' toast--leaving' : ''}`}
        >
          <svg className="toast-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {t.tone === 'success' ? (
              <path
                d="M3 8.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}
