import { INVITE_URL, SUPPORT_URL } from '@/lib/constants'
import pool from '@/lib/db'

export default async function Footer() {
  let cmdCount = 0
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM invoke_history.commands WHERE "timestamp" >= NOW() - INTERVAL '24 hours'`
    )
    cmdCount = rows[0]?.count ?? 0
  } catch {}
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
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p>&copy; {new Date().getFullYear()} evict &mdash; Not affiliated with Discord Inc.</p>
            <p>Owned and operated by <a href="https://azron.net" target="_blank" rel="noopener" className="footer-link">Azron, LLC</a> (1480587)</p>
          </div>
          <p style={{ whiteSpace: 'nowrap' }}>{cmdCount.toLocaleString()} commands ran today</p>
        </div>
      </div>
    </footer>
  )
}
