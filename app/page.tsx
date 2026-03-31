import type { Metadata } from 'next'
import { INVITE_URL, SUPPORT_URL } from '@/lib/constants'
import HeroStats from '@/components/HeroStats'
import Stars from '@/components/Stars'

export const metadata: Metadata = {
  title: 'Evict',
  description:
    'Advanced Discord bot with comprehensive moderation, robust antinuke protection, and versatile utility tools.',
}

export default function HomePage() {
  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <section className="hero" style={{ position: 'relative' }}>
        <Stars />
        <div className="hero-content" data-reveal>
          <h1 className="hero-title">evict</h1>
          <p className="hero-desc">
            Advanced Discord bot with comprehensive{' '}
            <span style={{ borderBottom: '3px solid rgba(255,255,255,0.5)' }}>moderation</span>,
            robust{' '}
            <span style={{ borderBottom: '3px solid rgba(255,255,255,0.5)' }}>antinuke</span>{' '}
            protection, and versatile{' '}
            <span style={{ borderBottom: '3px solid rgba(255,255,255,0.5)' }}>utility</span>{' '}
            tools.
          </p>
          <div className="hero-buttons">
            <a href={INVITE_URL} target="_blank" rel="noopener" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add to Server
            </a>
            <a href={SUPPORT_URL} target="_blank" rel="noopener" className="btn btn-ghost">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
              </svg>
              Join Support
            </a>
          </div>
          <HeroStats />
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)' }} />
      </div>

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
    </div>
  )
}
