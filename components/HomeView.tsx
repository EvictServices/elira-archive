import { INVITE_URL, SUPPORT_URL } from '@/lib/constants'
import HeroStats from '@/components/HeroStats'
import Stars from '@/components/Stars'
import VoiceMasterButtons from '@/components/VoiceMasterButtons'

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

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)' }} />
      </div>

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
                  <img src="/img/evict.webp" alt="evict" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                </div>
                <div className="discord-msg-body">
                  <div className="discord-msg-header">
                    <span className="discord-msg-username">evict</span>
                    <span className="discord-msg-bot-tag">BOT</span>
                    <span className="discord-msg-timestamp">Today at 4:20 PM</span>
                  </div>
                  <div className="discord-embed-card">
                    <div className="discord-embed-accent" />
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
                        <div className="discord-embed-progress">
                          <div className="discord-embed-progress-bar">
                            <div className="discord-embed-progress-fill" style={{ width: '45%' }} />
                          </div>
                          <div className="discord-embed-progress-times">
                            <span>1:28</span>
                            <span>3:17</span>
                          </div>
                        </div>
                      </div>
                      <div className="discord-embed-thumbnail">
                        <img src="https://i.scdn.co/image/ab67616d0000b273508bc1c5fe07f3049b3b8423" alt="Timeless" />
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

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header" data-reveal>
            <span className="section-badge">Social</span>
            <h2 className="section-title">Social media integration</h2>
          </div>
          <div className="social-section" data-reveal>
            <div className="social-info">
              <h3 className="music-info-title">Browse profiles &amp; repost content</h3>
              <p className="music-info-desc">
                Look up any social media profile directly from Discord. Grab user stats, repost content, and keep your server connected to every major platform.
              </p>
              <ul className="music-features-list">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Instagram, TikTok, X &amp; more
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Profile lookups with full stats
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Repost videos &amp; images to chat
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Auto-embed link detection
                </li>
              </ul>
            </div>
            <div className="music-embed">
              <div className="discord-message">
                <div className="discord-msg-avatar">
                  <img src="/img/evict.webp" alt="evict" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                </div>
                <div className="discord-msg-body">
                  <div className="discord-msg-header">
                    <span className="discord-msg-username">evict</span>
                    <span className="discord-msg-bot-tag">BOT</span>
                    <span className="discord-msg-timestamp">Today at 5:32 PM</span>
                  </div>
                  <div className="discord-embed-card">
                    <div className="discord-embed-accent" style={{ background: '#c8a2c8' }} />
                    <div className="discord-embed-content">
                      <div className="discord-embed-inner">
                        <div className="discord-embed-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <img src="/img/kendall.jpg" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                          <span>.</span>
                        </div>
                        <div className="discord-embed-title" style={{ color: '#00a8fc' }}>
                          Kendall (@kendalljenner) ✓
                        </div>
                        <div className="discord-embed-description">
                          @drink818
                        </div>
                        <div className="discord-embed-fields-grid">
                          <div className="discord-embed-field-inline">
                            <div className="discord-embed-field-name">Followers</div>
                            <div className="discord-embed-field-value">284.4m</div>
                          </div>
                          <div className="discord-embed-field-inline">
                            <div className="discord-embed-field-name">Following</div>
                            <div className="discord-embed-field-value">271</div>
                          </div>
                          <div className="discord-embed-field-inline">
                            <div className="discord-embed-field-name">Posts</div>
                            <div className="discord-embed-field-value">589</div>
                          </div>
                        </div>
                        <div className="discord-embed-footer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                            <defs>
                              <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
                                <stop offset="0%" stopColor="#feda75"/>
                                <stop offset="25%" stopColor="#fa7e1e"/>
                                <stop offset="50%" stopColor="#d62976"/>
                                <stop offset="75%" stopColor="#962fbf"/>
                                <stop offset="100%" stopColor="#4f5bd5"/>
                              </linearGradient>
                            </defs>
                            <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
                            <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)"/>
                          </svg>
                          <span>Instagram</span>
                        </div>
                      </div>
                      <div className="discord-embed-thumbnail" style={{ width: 100, height: 100 }}>
                        <img src="/img/kendall.jpg" alt="kendalljenner" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header" data-reveal>
            <span className="section-badge">Voice</span>
            <h2 className="section-title">VoiceMaster</h2>
          </div>
          <div className="music-section" data-reveal>
            <div className="social-info">
              <h3 className="music-info-title">Custom voice channels on demand</h3>
              <p className="music-info-desc">
                Create temporary voice channels that your members fully control. Lock, unlock, ghost, set limits, and more — all through an intuitive button interface directly in Discord.
              </p>
              <ul className="music-features-list">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Auto-created personal channels
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Lock, unlock, ghost &amp; reveal
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Claim, disconnect &amp; user limits
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  One-click button interface
                </li>
              </ul>
            </div>
            <div className="music-embed">
              <div className="discord-message">
                <div className="discord-msg-avatar">
                  <img src="/img/evict.webp" alt="evict" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                </div>
                <div className="discord-msg-body">
                  <div className="discord-msg-header">
                    <span className="discord-msg-username">evict</span>
                    <span className="discord-msg-bot-tag">BOT</span>
                    <span className="discord-msg-timestamp">3/31/26, 5:18 PM</span>
                  </div>
                  <div className="discord-embed-card">
                    <div className="discord-embed-accent" />
                    <div className="discord-embed-content">
                      <div className="discord-embed-inner">
                        <div className="discord-embed-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <img src="/img/evict.webp" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                          <span>evict</span>
                        </div>
                        <div className="discord-embed-title" style={{ color: '#ffffff' }}>
                          VoiceMaster Interface
                        </div>
                        <div className="discord-embed-description">
                          Click the buttons below to control your voice channel
                        </div>
                        <div className="discord-embed-description" style={{ marginTop: '0.5rem' }}>
                          <strong>Button Usage</strong>
                        </div>
                        <div className="vm-usage-list">
                          <div className="vm-usage-row"><img src="/img/voicemaster/lock.webp" alt="lock" className="vm-emoji" /> — <span className="vm-cmd">Lock</span> the voice channel</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/unlock.webp" alt="unlock" className="vm-emoji" /> — <span className="vm-cmd">Unlock</span> the voice channel</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/ghost.webp" alt="ghost" className="vm-emoji" /> — <span className="vm-cmd">Ghost</span> the voice channel</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/reveal.webp" alt="reveal" className="vm-emoji" /> — <span className="vm-cmd">Reveal</span> the voice channel</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/claim.webp" alt="claim" className="vm-emoji" /> — <span className="vm-cmd">Claim</span> the voice channel</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/hammer.webp" alt="disconnect" className="vm-emoji" /> — <span className="vm-cmd">Disconnect</span> a member</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/activity.webp" alt="activity" className="vm-emoji" /> — <span className="vm-cmd">Start</span> a new voice channel activity</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/information.webp" alt="info" className="vm-emoji" /> — <span className="vm-cmd">View</span> channel information</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/increase.webp" alt="increase" className="vm-emoji" /> — <span className="vm-cmd">Increase</span> the user limit</div>
                          <div className="vm-usage-row"><img src="/img/voicemaster/decrease.webp" alt="decrease" className="vm-emoji" /> — <span className="vm-cmd">Decrease</span> the user limit</div>
                        </div>
                      </div>
                      <div className="discord-embed-thumbnail" style={{ width: 80, height: 80 }}>
                        <img src="/img/evict.webp" alt="evict" />
                      </div>
                    </div>
                  </div>
                  <VoiceMasterButtons />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
