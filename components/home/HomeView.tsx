import { INVITE_URL, SUPPORT_URL } from '@/lib/discord/urls'
import HeroStats from '@/components/home/HeroStats'
import Stars from '@/components/home/Stars'

function Divider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '34px 0' }}>
      <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)' }} />
    </div>
  )
}

export default function HomeView() {
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

      <Divider />

      <section style={{ padding: '34px 18px 68px' }} data-reveal>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: '40px 34px',
          display: 'flex', flexDirection: 'column', gap: 20,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: 0 }}>
            Want to try Evict?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            Add Evict to your server and explore everything it offers&nbsp;&mdash; moderation, antinuke, music, social feeds, and more, all in one place.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={INVITE_URL} target="_blank" rel="noopener" style={{
              fontSize: '0.9rem',
              color: '#fff', textDecoration: 'none', textAlign: 'center',
              padding: '12px 28px', borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Invite Evict
            </a>
            <a href={SUPPORT_URL} target="_blank" rel="noopener" style={{
              fontSize: '0.9rem',
              color: '#fff', textDecoration: 'none', textAlign: 'center',
              padding: '12px 28px', borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Join Support
            </a>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0', lineHeight: 1.6 }}>
              Join the growing community of users who use evict to manage and enhance their servers with features only found on paid bots completely for free.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
