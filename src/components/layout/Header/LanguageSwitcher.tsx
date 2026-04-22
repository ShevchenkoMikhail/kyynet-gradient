import { useT, type AppLang } from '../../../i18n'
import './LanguageSwitcher.css'

const LANGS: { code: AppLang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { lang, setLang, t } = useT()
  return (
    <div
      className="lang-switcher"
      role="group"
      aria-label={t('header.langToggle')}
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher__btn${lang === code ? ' lang-switcher__btn--active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
