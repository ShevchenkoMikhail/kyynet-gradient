import { SERVICE_NAME, PARENT_PROJECT_URL } from '../../../constants/brand'
import { useT } from '../../../i18n'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Header.css'

function Logo() {
  return (
    <svg
      className="header__logo"
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g fill="#a855f7">
        <rect x="6" y="6" width="4" height="4" />
        <rect x="10" y="6" width="4" height="4" />
        <rect x="14" y="6" width="4" height="4" />
        <rect x="18" y="6" width="4" height="4" />
        <rect x="22" y="6" width="4" height="4" />
      </g>
      <g fill="#c084fc">
        <rect x="6" y="10" width="4" height="4" />
        <rect x="22" y="10" width="4" height="4" />
      </g>
      <g fill="#a855f7">
        <rect x="6" y="14" width="4" height="4" />
        <rect x="10" y="14" width="4" height="4" />
        <rect x="14" y="14" width="4" height="4" />
        <rect x="18" y="14" width="4" height="4" />
        <rect x="22" y="14" width="4" height="4" />
      </g>
      <g fill="#7c3aed">
        <rect x="6" y="18" width="4" height="4" />
        <rect x="22" y="18" width="4" height="4" />
      </g>
      <g fill="#7c3aed">
        <rect x="6" y="22" width="4" height="4" />
        <rect x="10" y="22" width="4" height="4" />
        <rect x="14" y="22" width="4" height="4" />
        <rect x="18" y="22" width="4" height="4" />
        <rect x="22" y="22" width="4" height="4" />
      </g>
    </svg>
  )
}

export function Header() {
  const { t } = useT()
  return (
    <header className="header" role="banner">
      <div className="header__brand">
        <Logo />
        <div className="header__title">
          <span className="header__title-main" aria-label={SERVICE_NAME}>
            <span className="header__title-kyynet">KyyNet</span>
            <span className="header__title-gradient">Gradient</span>
          </span>
          <span className="header__title-sub">{t('header.servicePart')}</span>
        </div>
      </div>

      <div className="header__right">
        <a
          href={PARENT_PROJECT_URL}
          className="header__parent-link"
          target="_blank"
          rel="noopener noreferrer"
          title={t('header.servicePart')}
        >
          kyynet.net ↗
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
