import Link from 'next/link'
import { DOCS_URL, INVITE_URL, SUPPORT_URL } from '@/lib/discord/urls'
import { routes } from '@/lib/routes'

const PRODUCT_LINKS = [
  { href: routes.commands, label: 'Commands' },
  { href: routes.embeds, label: 'Embeds' },
  { href: routes.dashboard, label: 'Dashboard' },
] as const

const RESOURCE_LINKS = [
  { href: DOCS_URL, label: 'Documentation', external: true },
  { href: routes.updates, label: 'Updates' },
  { href: routes.status, label: 'Status' },
  { href: SUPPORT_URL, label: 'Support server', external: true },
] as const

const LEGAL_LINKS = [
  { href: routes.terms, label: 'Terms of service' },
  { href: routes.privacy, label: 'Privacy policy' },
] as const

type FooterLink = { href: string; label: string; external?: boolean }

function FooterNavColumn({ title, links }: { title: string; links: readonly FooterLink[] }) {
  return (
    <nav className="footer-col" aria-label={title}>
      <h3 className="footer-col-title">{title}</h3>
      <ul className="footer-col-list">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="footer-col-link">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="footer-col-link">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-shell">
        <div className="footer-card">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href={routes.home} className="footer-brand-link">
                <img src="/img/evict.webp" alt="" className="footer-brand-icon" width={32} height={32} />
                <span className="footer-brand-name">
                  evict<span className="footer-brand-mark">.</span>
                </span>
              </Link>
              <p className="footer-tagline">
                One Discord bot for moderation, protection, voice, tickets, and the utilities you would
                otherwise stack.
              </p>
              <div className="footer-brand-actions">
                <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary footer-invite-btn">
                  Add to server
                </a>
                <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost footer-support-btn">
                  Support
                </a>
              </div>
            </div>

            <FooterNavColumn title="Product" links={PRODUCT_LINKS} />
            <FooterNavColumn title="Resources" links={RESOURCE_LINKS} />
            <FooterNavColumn title="Legal" links={LEGAL_LINKS} />
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              &copy; {year} evict. Not affiliated with Discord Inc.
            </p>
            <p className="footer-meta">
              Operated by{' '}
              <a href="https://azron.net" target="_blank" rel="noopener noreferrer" className="footer-meta-link">
                Azron, LLC
              </a>{' '}
              (1480587)
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
