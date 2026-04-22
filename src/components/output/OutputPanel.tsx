import type { EncodedOutputs } from '../../engine/types'
import { useT } from '../../i18n'
import { OutputCard } from './OutputCard'
import './OutputPanel.css'

type Props = {
  outputs: EncodedOutputs
}

export function OutputPanel({ outputs }: Props) {
  const { t } = useT()
  const hasWarnings = outputs.warnings.length > 0
  return (
    <section className="output-panel" aria-label={t('output.heading')}>
      <h2 className="kn-section-heading">{t('output.heading')}</h2>
      <div className="output-panel__grid">
        <OutputCard
          titleKey="output.legacyTitle"
          compatKey="output.legacyCompat"
          value={outputs.legacy}
          showApproximationWarning={hasWarnings}
        />
        <OutputCard
          titleKey="output.hexTitle"
          compatKey="output.hexCompat"
          value={outputs.hex}
        />
        <OutputCard
          titleKey="output.miniMessageTitle"
          compatKey="output.miniMessageCompat"
          value={outputs.miniMessage}
        />
      </div>
    </section>
  )
}
