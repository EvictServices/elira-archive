import { INVITE_URL, SUPPORT_URL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/img/evict.webp" alt="evict" className="footer-avatar" />
            <span>evict</span>
          </div>
          <p className="footer-tagline">The only Discord bot you&apos;ll ever need.</p>
          <div className="footer-actions">
            <a href={INVITE_URL} target="_blank" rel="noopener" className="footer-link">Add to Server</a>
            <span className="footer-sep">&middot;</span>
            <a href={SUPPORT_URL} target="_blank" rel="noopener" className="footer-link">Support</a>
            <span className="footer-sep">&middot;</span>
            <a href="https://docs.evict.bot" target="_blank" rel="noopener" className="footer-link">Docs</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} evict &mdash; Not affiliated with Discord Inc.</p>
          <p>Owned and operated by <a href="https://azron.net" target="_blank" rel="noopener" className="footer-link">Azron, LLC</a> (1480587)</p>
        </div>
      </div>
    </footer>
  )
}
