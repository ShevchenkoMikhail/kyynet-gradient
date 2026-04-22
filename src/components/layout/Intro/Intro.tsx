import { useT } from '../../../i18n'
import type { CSSProperties } from 'react'
import './Intro.css'

const GRADIENT_WORD = 'Gradient'

type LetterStyle = CSSProperties & Partial<Record<'--i', string>>

export function Intro() {
  const { t } = useT()
  return (
    <section className="intro">
      <h1 className="intro__title" aria-label={t('intro.title')}>
        <span className="intro__title-line intro__title-line--mono">
          <span className="intro__title-line-glow" aria-hidden="true" />
          <span className="intro__title-line-glow intro__title-line-glow--b" aria-hidden="true" />
          <span className="intro__title-line-glow intro__title-line-glow--c" aria-hidden="true" />
          <span className="intro__title-line-kyy">KyyNet</span>
        </span>
        <span className="intro__title-line intro__title-line--rainbow" aria-hidden="true">
          {Array.from(GRADIENT_WORD).map((ch, i) => (
            <span
              key={i}
              className="gradient-letter"
              style={{ '--i': String(i) } as LetterStyle}
            >
              <span className="gradient-letter__base">{ch}</span>
              <span className="gradient-letter__flash" aria-hidden="true">{ch}</span>
            </span>
          ))}
        </span>
      </h1>
      <p className="intro__subtitle">{t('intro.subtitle')}</p>
    </section>
  )
}
