import { useT, type DictKey } from '../../i18n'
import { CopyButton } from './CopyButton'

type Props = {
  titleKey: DictKey
  compatKey: DictKey
  value: string
  showApproximationWarning?: boolean
}

export function OutputCard({
  titleKey,
  compatKey,
  value,
  showApproximationWarning,
}: Props) {
  const { t } = useT()
  return (
    <div className="output-card">
      <div className="output-card__header">
        <div className="output-card__title-wrap">
          <h3 className="output-card__title">{t(titleKey)}</h3>
          <span className="output-card__compat">{t(compatKey)}</span>
        </div>
        {showApproximationWarning && (
          <span
            className="output-card__warning"
            title={t('output.approximationWarning')}
            aria-label={t('output.approximationWarning')}
          >
            <span className="output-card__warning-dot" aria-hidden="true" />
            ~
          </span>
        )}
      </div>
      <pre className="output-card__code" data-empty-label="—">
        <code>{value}</code>
      </pre>
      <CopyButton value={value} />
    </div>
  )
}
