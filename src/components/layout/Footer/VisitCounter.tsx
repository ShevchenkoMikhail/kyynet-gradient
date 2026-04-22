import { useEffect, useRef, useState } from 'react'
import { useT, type AppLang } from '../../../i18n'
import './VisitCounter.css'

const COUNTER_NAMESPACE = 'kyynet-gradient'
const COUNTER_KEY = 'visits'
const COUNTER_URL = `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`
const LOCAL_KEY = 'kyynet-gradient:visits-local'
const SESSION_KEY = 'kyynet-gradient:visits-counted'

type CounterState =
  | { kind: 'loading' }
  | { kind: 'global'; count: number }
  | { kind: 'local'; count: number }

function formatBigNumber(n: number, lang: AppLang): string {
  const formatter = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US')
  return formatter.format(Math.max(0, Math.floor(n)))
}

export function VisitCounter() {
  const { t, lang } = useT()
  const [state, setState] = useState<CounterState>({ kind: 'loading' })
  const [displayed, setDisplayed] = useState<number>(0)
  const animatingRef = useRef(false)

  useEffect(() => {
    // Only count once per tab session (avoid inflating on hot-reload / re-render)
    const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1'

    async function tick() {
      // Local fallback counter
      const localCurrent = parseInt(localStorage.getItem(LOCAL_KEY) ?? '0', 10) || 0
      const localNext = alreadyCounted ? localCurrent : localCurrent + 1
      if (!alreadyCounted) {
        try { localStorage.setItem(LOCAL_KEY, String(localNext)) } catch { /* ignore */ }
      }

      // Try global counter (best-effort)
      try {
        const res = await fetch(
          alreadyCounted
            ? COUNTER_URL.replace('/up', '')
            : COUNTER_URL,
          { method: 'GET', signal: AbortSignal.timeout(5000) },
        )
        if (res.ok) {
          const data = (await res.json()) as { count?: number }
          if (typeof data.count === 'number' && data.count >= 0) {
            setState({ kind: 'global', count: data.count })
            if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1')
            return
          }
        }
      } catch {
        // network error / timeout / CORS — fall through
      }

      setState({ kind: 'local', count: localNext })
      if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1')
    }

    void tick()
  }, [])

  // Animate count-up whenever target changes
  useEffect(() => {
    if (state.kind === 'loading') return
    const target = state.count
    if (animatingRef.current) return
    animatingRef.current = true

    const start = performance.now()
    const duration = Math.min(1600, 600 + Math.log10(Math.max(1, target)) * 150)
    const startFrom = 0

    let raf = 0
    function step(now: number) {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const value = Math.round(startFrom + (target - startFrom) * eased)
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
  }, [state])

  const isLoading = state.kind === 'loading'
  const isLocal = state.kind === 'local'
  const label = isLocal ? t('footer.visitCounterYour') : t('footer.visitCounter')
  const formatted = formatBigNumber(displayed, lang)

  return (
    <div
      className={`visit-counter${isLoading ? ' visit-counter--loading' : ''}${isLocal ? ' visit-counter--local' : ''}`}
      aria-live="polite"
    >
      <div className="visit-counter__label">{label}</div>
      <div
        className="visit-counter__number"
        title={isLocal ? t('footer.visitCounterYour') : t('footer.visitCounter')}
      >
        <span className="visit-counter__dot" aria-hidden="true" />
        <span className="visit-counter__value">{isLoading ? '—' : formatted}</span>
      </div>
    </div>
  )
}
