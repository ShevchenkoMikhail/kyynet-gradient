import { useEffect } from 'react'
import { counterService, type CounterKey } from '../../../utils/counterService'
import { useCounter } from '../../../state/useCounter'
import { useT, type AppLang, type DictKey } from '../../../i18n'
import './FooterStats.css'

function formatNumber(n: number, lang: AppLang): string {
  const formatter = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US')
  return formatter.format(Math.max(0, Math.floor(n)))
}

type StatDef = {
  key: CounterKey
  labelKey: DictKey
  iconPath: string // SVG path data in 20x20 viewbox
}

const STATS: StatDef[] = [
  {
    key: 'visits',
    labelKey: 'stats.visits',
    // eye
    iconPath:
      'M10 4c-4 0-7 3-8 6 1 3 4 6 8 6s7-3 8-6c-1-3-4-6-8-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z',
  },
  {
    key: 'gradients',
    labelKey: 'stats.gradients',
    // sparkle / star
    iconPath:
      'M10 2l1.8 5 5 1.8-5 1.8L10 16l-1.8-5.4-5-1.8 5-1.8L10 2zM15.5 12l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7zM4 13l.5 1.2 1.2.5-1.2.5L4 16.4l-.5-1.2-1.2-.5 1.2-.5L4 13z',
  },
  {
    key: 'copies',
    labelKey: 'stats.copies',
    // clipboard
    iconPath:
      'M7 2h6a1 1 0 011 1v1h2a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h2V3a1 1 0 011-1zm1 2v1h4V4H8zM5 6v11h10V6H5z',
  },
]

export function FooterStats() {
  const { t, lang } = useT()
  const visits = useCounter('visits')
  const gradients = useCounter('gradients')
  const copies = useCounter('copies')

  // On every page load, increment visits counter by one.
  // Gradients and copies are action-driven (incremented when user clicks),
  // so we just read their current values here.
  useEffect(() => {
    void counterService.hit('visits')
    void counterService.read('gradients')
    void counterService.read('copies')
  }, [])

  const values: Record<CounterKey, number | null> = {
    visits,
    gradients,
    copies,
  }

  // Hide the entire strip only when absolutely nothing is known.
  const hasAny = STATS.some(s => values[s.key] !== null)
  if (!hasAny) return null

  return (
    <div className="footer-stats" role="status" aria-live="polite">
      {STATS.map((stat, i) => {
        const value = values[stat.key]
        if (value === null) return null
        return (
          <div key={stat.key} className="footer-stats__item">
            {i > 0 && <span className="footer-stats__divider" aria-hidden="true" />}
            <span className="footer-stats__icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                <path d={stat.iconPath} />
              </svg>
            </span>
            <span className="footer-stats__value">{formatNumber(value, lang)}</span>
            <span className="footer-stats__label">{t(stat.labelKey)}</span>
          </div>
        )
      })}
    </div>
  )
}
