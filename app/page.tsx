import type { Metadata } from 'next'
import { INVITE_URL, SUPPORT_URL } from '@/lib/constants'
import HeroStats from '@/components/HeroStats'

export const metadata: Metadata = {
  title: 'evict',
  description:
    'Advanced Discord bot with comprehensive moderation, robust antinuke protection, and versatile utility tools.',
}

const WaveDivider = () => (
  <div style={{ margin: '3rem 0', width: '100%', overflow: 'hidden' }}>
    <svg width="100%" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,30 Q150,10 300,30 T600,30 T900,30 T1200,30" stroke="rgba(71,141,166,0.3)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M0,30 Q150,50 300,30 T600,30 T900,30 T1200,30" stroke="rgba(102,178,204,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  </div>
)

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-content" data-reveal>
          <h1 className="hero-title">evict</h1>
          <p className="hero-desc">
            Advanced Discord bot with comprehensive{' '}
            <span style={{ borderBottom: '3px solid rgba(123,163,180,0.5)' }}>moderation</span>,
            robust{' '}
            <span style={{ borderBottom: '3px solid rgba(123,163,180,0.5)' }}>antinuke</span>{' '}
            protection, and versatile{' '}
            <span style={{ borderBottom: '3px solid rgba(123,163,180,0.5)' }}>utility</span>{' '}
            tools.
          </p>
          <div className="hero-buttons">
            <a href={INVITE_URL} target="_blank" rel="noopener" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add to Server
            </a>
            <a href={SUPPORT_URL} target="_blank" rel="noopener" className="btn btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.076.076 0 0 0-.041-.107 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.094.246-.198.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.094.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z" />
              </svg>
              Join Support
            </a>
          </div>
          <HeroStats />
        </div>
      </section>

      <WaveDivider />

      <section className="section">
        <div className="container">
          <div className="section-header" data-reveal>
            <span className="section-badge">Why Evict?</span>
            <h2 className="section-title">Everything your server needs</h2>
            <p className="section-desc">Powerful features to protect and enhance your Discord community</p>
          </div>

          <div className="features-grid">
            {[
              {
                delay: 1,
                icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
                title: 'Advanced Moderation',
                desc: 'Comprehensive moderation tools with warnings, timeouts, and detailed logging to keep your community safe.',
              },
              {
                delay: 2,
                icon: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>,
                title: 'Server Analytics',
                desc: 'Track server growth, member activity, and command usage with real-time charts and insights.',
              },
              {
                delay: 3,
                icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
                title: 'System Messages',
                desc: 'Fully customizable welcome and goodbye messages with embed support and dynamic placeholders.',
              },
              {
                delay: 4,
                icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
                title: 'Rewards Systems',
                desc: 'Engaging leveling and economy systems to keep your members active and involved.',
              },
              {
                delay: 5,
                icon: (
                  <>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </>
                ),
                title: 'Top Tier Protection',
                desc: 'Advanced anti-nuke and anti-raid systems to safeguard your server from malicious attacks.',
              },
              {
                delay: 6,
                icon: (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="21.17" y1="8" x2="12" y2="8" />
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
                  </>
                ),
                title: 'Automated Roles',
                desc: 'Advanced role assignment with reaction roles, auto-roles, and custom role management.',
              },
            ].map((f) => (
              <div key={f.delay} className="feature-card" data-reveal data-delay={f.delay}>
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
