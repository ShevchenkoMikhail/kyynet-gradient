import { useEffect, useRef, useState } from 'react'
import { useT, type AppLang } from '../../../i18n'
import './VisitCounter.css'

// Free public counter API — no setup, no auth, just plain GET requests.
// https://abacus.jasoncameron.dev
const COUNTER_NAMESPACE = 'kyynet-gradient'
const COUNTER_KEY = 'visits'
const API_HIT = `https://abacus.jasoncameron.dev/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`
const API_GET = `https://abacus.jasoncameron.dev/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`
const LAST_KNOWN_KEY = 'kyynet-gradient:visits-last-known'
const SESSION_KEY = 'kyynet-gradient:visits-counted'

function formatBigNumber(n: number, lang: AppLang): string {
  const formatter = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US')
  return formatter.format(Math.max(0, Math.floor(n)))
}

function readLastKnown(): number | null {
  try {
    const raw = localStorage.getItem(LAST_KNOWN_KEY)
    if (!raw) return null
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : null
  } catch {
    return null
  }
}

function writeLastKnown(n: number): void {
  try { localStorage.setItem(LAST_KNOWN_KEY, String(n)) } catch { /* ignore */ }
}

export function VisitCounter() {
  const { t, lang } = useT()
  // Start with last-known cached value (if any) — shows instantly, updates when API replies
  const [count, setCount] = useState<number | null>(() => readLastKnown())
  const [displayed, setDisplayed] = useState<number>(() => readLastKnown() ?? 0)
  const animatingRef = useRef(false)

  useEffect(() => {
    const alreadyCountedThisSession = sessionStorage.getItem(SESSION_KEY) === '1'
    const url = alreadyCountedThisSession ? API_GET : API_HIT

    async function fetchCount() {
      try {
        const res = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(6000),
        })
        if (!res.ok) return
        const data = (await res.json()) as { value?: number }
        if (typeof data.value === 'number' && data.value >= 0) {
          setCount(data.value)
          writeLastKnown(data.value)
          if (!alreadyCountedThisSession) {
            sessionStorage.setItem(SESSION_KEY, '1')
          }
        }
      } catch {
        // Network / CORS / timeout — keep showing last-known value if we have one.
      }
    }

    void fetchCount()
  }, [])

  // Smooth count-up animation on changes
  useEffect(() => {
    if (count === null) return
    const target = count
    if (animatingRef.current) return
    const from = displayed
    if (from === target) return
    animatingRef.current = true

    const start = performance.now()
    const duration = Math.min(1400, 400 + Math.log10(Math.max(1, Math.abs(target - from) + 1)) * 200)

    let raf = 0
    function step(now: number) {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = Math.round(from + (target - from) * eased)
      setDisplayed(value)
      if (t < 1) {
        raf = requestAnimationFrame(step)
      } else {
        animatingRef.current = false
      }
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      animatingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  if (count === null) return null

  return (
    <span className="visit-counter" title={t('footer.visitCounter')}>
      <span className="visit-counter__dot" aria-hidden="true" />
      <span className="visit-counter__label">{t('footer.visitCounter')}:</span>
      <span className="visit-counter__value">{formatBigNumber(displayed, lang)}</span>
    </span>
  )
}
