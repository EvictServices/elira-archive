export default function SocialSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-badge">Social</span>
          <h2 className="section-title">Social Media Integration</h2>
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
                <img loading="lazy" src="/img/evict.webp" alt="evict" style={{ width: 40, height: 40, borderRadius: '50%' }} />
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
                        <img loading="lazy" src="/img/mercy.png" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                        <span>mercy</span>
                      </div>
                      <div className="discord-embed-title" style={{ color: '#00a8fc' }}>
                        Kendall (@kendalljenner) ✓
                      </div>
                      <div className="discord-embed-description">
                        <span style={{ color: '#c9cdfb', backgroundColor: 'rgba(88,101,242,0.3)', borderRadius: '3px', padding: '0 2px', cursor: 'pointer' }}>@drink818</span>
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
                      <img loading="lazy" src="/img/kendall.jpg" alt="kendalljenner" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
