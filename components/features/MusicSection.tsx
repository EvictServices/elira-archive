import Image from 'next/image'
import MusicProgress from '@/components/MusicProgress'

export default function MusicSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-badge">Music</span>
          <h2 className="section-title">High quality music playback</h2>
        </div>
        <div className="music-section" data-reveal>
          <div className="music-embed">
            <div className="discord-message">
              <div className="discord-msg-avatar">
                <Image src="/img/evict.webp" alt="evict" width={40} height={40} style={{ borderRadius: '50%' }} />
              </div>
              <div className="discord-msg-body">
                <div className="discord-msg-header">
                  <span className="discord-msg-username">evict</span>
                  <span className="discord-msg-bot-tag">BOT</span>
                  <span className="discord-msg-timestamp">Today at 4:20 PM</span>
                </div>
                <div className="discord-embed-card">
                  <div className="discord-embed-accent" style={{ background: '#5f828d' }} />
                  <div className="discord-embed-content">
                    <div className="discord-embed-inner">
                      <div className="discord-embed-author">Now Playing</div>
                      <div className="discord-embed-title">Playboi Carti</div>
                      <div className="discord-embed-description">
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Song:</span>{' '}
                        <span style={{ color: '#ffffff' }}>Timeless (feat. The Weeknd)</span>
                      </div>
                      <div className="discord-embed-field">
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Duration:</span>{' '}
                        <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>3:17</span>
                      </div>
                      <MusicProgress />
                    </div>
                    <div className="discord-embed-thumbnail">
                      <Image src="/img/music/timeless.png" alt="Timeless" width={80} height={80} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="music-info">
            <h3 className="music-info-title">Listen together in voice</h3>
            <p className="music-info-desc">
              Play music from Spotify, YouTube, SoundCloud, and more directly in your voice channel. Enjoy high-fidelity audio with zero lag and full queue management.
            </p>
            <ul className="music-features-list">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Multi-platform support
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Queue, loop, shuffle &amp; filters
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                24/7 playback mode
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Volume &amp; bass boost controls
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
