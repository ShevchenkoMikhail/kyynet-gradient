import { LINKS } from '../../../constants/links'
import { PARENT_PROJECT } from '../../../constants/brand'
import { useT } from '../../../i18n'
import { FooterStats } from './FooterStats'
import './Footer.css'

const SOCIAL_ICONS: Array<{ href: string; label: string; path: string }> = [
  {
    href: LINKS.discord,
    label: 'Discord',
    path:
      'M13.6 3.8c-.9-.4-1.8-.7-2.8-.9-.1.2-.3.5-.4.8-1-.2-2-.2-3 0-.1-.3-.3-.6-.4-.8-1 .2-1.9.5-2.8.9C2.3 6.7 1.9 9.5 2.1 12.2c1.1.8 2.2 1.3 3.2 1.6.3-.4.5-.8.7-1.2-.4-.2-.8-.3-1.2-.6.1-.1.2-.1.3-.2 2.2 1 4.7 1 6.9 0 .1.1.2.2.3.2-.4.2-.7.4-1.2.6.2.4.5.8.7 1.2 1.1-.3 2.2-.9 3.2-1.6.2-3 -.3-5.7-1.4-8.4zM6.5 10.8c-.6 0-1.1-.6-1.1-1.3s.5-1.3 1.1-1.3c.6 0 1.1.6 1.1 1.3 0 .7-.5 1.3-1.1 1.3zm3.9 0c-.6 0-1.1-.6-1.1-1.3s.5-1.3 1.1-1.3c.6 0 1.1.6 1.1 1.3 0 .7-.5 1.3-1.1 1.3z',
  },
  {
    href: LINKS.vk,
    label: 'VK',
    path:
      'M8.6 12.5c-4 0-6.4-2.7-6.5-7.3h2c.1 3.4 1.5 4.8 2.7 5.1V5.2h1.9v2.9c1.1-.1 2.3-1.4 2.7-2.9h1.9c-.3 1.9-1.6 3.2-2.5 3.7.9.4 2.4 1.5 2.9 3.6h-2.1c-.4-1.3-1.5-2.4-2.9-2.6v2.6h-.1z',
  },
  {
    href: LINKS.youtube,
    label: 'YouTube',
    path:
      'M13.5 4.5c-.1-.5-.5-.9-1-1C11.4 3.2 8 3.2 8 3.2s-3.4 0-4.5.3c-.5.1-.9.5-1 1C2.2 5.6 2.2 8 2.2 8s0 2.4.3 3.5c.1.5.5.9 1 1 1.1.3 4.5.3 4.5.3s3.4 0 4.5-.3c.5-.1.9-.5 1-1 .3-1.1.3-3.5.3-3.5s0-2.4-.3-3.5zM6.8 10.1V5.9l2.9 2.1-2.9 2.1z',
  },
  {
    href: LINKS.telegram,
    label: 'Telegram',
    path:
      'M13.8 3l-1.9 9.2c-.1.6-.5.8-1 .5L8.3 10.7l-1.4 1.3c-.2.2-.3.3-.5.3l.2-2.6 4.8-4.3c.2-.2 0-.3-.3-.1L5.1 8.8l-2.6-.8c-.6-.2-.6-.6.1-.8l10.4-4c.5-.2.9.1.8.8z',
  },
]

function FooterLogo() {
  return (
    <svg
      className="footer__logo"
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

function PickaxeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="14" y="4"  width="2" height="2" />
      <rect x="16" y="4"  width="2" height="2" />
      <rect x="18" y="4"  width="2" height="2" />
      <rect x="12" y="6"  width="2" height="2" />
      <rect x="14" y="6"  width="2" height="2" />
      <rect x="16" y="6"  width="2" height="2" />
      <rect x="18" y="6"  width="2" height="2" />
      <rect x="20" y="6"  width="2" height="2" />
      <rect x="10" y="8"  width="2" height="2" />
      <rect x="12" y="8"  width="2" height="2" />
      <rect x="14" y="8"  width="2" height="2" />
      <rect x="16" y="8"  width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="12" y="10" width="2" height="2" />
      <rect x="8"  y="12" width="2" height="2" />
      <rect x="10" y="12" width="2" height="2" />
      <rect x="6"  y="14" width="2" height="2" />
      <rect x="8"  y="14" width="2" height="2" />
      <rect x="4"  y="16" width="2" height="2" />
      <rect x="6"  y="16" width="2" height="2" />
      <rect x="2"  y="18" width="2" height="2" />
      <rect x="4"  y="18" width="2" height="2" />
    </svg>
  )
}

export function Footer() {
  const { t } = useT()
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <section className="footer__col footer__col--brand">
          <div className="footer__brand-row">
            <FooterLogo />
            <div className="footer__brand-text">
              <span className="footer__brand-name">{PARENT_PROJECT}</span>
              <span className="footer__brand-tag">
                {t('footer.partOfEcosystem')}
              </span>
            </div>
          </div>
          <p className="footer__made-by">{t('footer.madeBy')}</p>
        </section>

        <section className="footer__col footer__col--play">
          <h3 className="footer__heading">{t('footer.sectionPlay')}</h3>
          <a
            href={LINKS.play}
            target="_blank"
            rel="noopener noreferrer"
            className="footer__play-card"
          >
            <span className="footer__play-icon">
              <PickaxeIcon />
            </span>
            <span className="footer__play-body">
              <span className="footer__play-label">
                {t('footer.playServerLabel')}
              </span>
              <span className="footer__play-ip">
                {t('footer.playServerIp')}
              </span>
            </span>
            <span className="footer__play-arrow" aria-hidden="true">→</span>
          </a>
        </section>

        <section className="footer__col footer__col--social">
          <h3 className="footer__heading">{t('footer.sectionSocial')}</h3>
          <div className="footer__social">
            {SOCIAL_ICONS.map(icon => (
              <a
                key={icon.label}
                href={icon.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={icon.label}
                title={icon.label}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
              </a>
            ))}
          </div>
        </section>
      </div>

      <FooterStats />

      <div className="footer__bottom">
        <span className="footer__copyright">
          {t('footer.copyright', { year })}
        </span>
      </div>
    </footer>
  )
}
