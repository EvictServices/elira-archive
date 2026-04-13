export default function AntinukeSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-badge">Security</span>
          <h2 className="section-title">Antinuke Protection</h2>
        </div>
        <div className="social-section" data-reveal>
          <div className="social-info">
            <h3 className="music-info-title">Keep your server safe</h3>
            <p className="music-info-desc">
              Protect your server from malicious actions with real-time monitoring and automatic punishment. Detect and respond to mass bans, role deletions, channel wipes, and more before they cause damage.
            </p>
            <ul className="music-features-list">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Bot add &amp; webhook protection
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Role &amp; channel creation/deletion limits
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Ban, kick &amp; emoji thresholds
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Configurable limits &amp; auto-punishment
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
                  <span className="discord-msg-bot-tag">APP</span>
                  <span className="discord-msg-timestamp">Today at 4:31 PM</span>
                </div>
                <div className="discord-embed-card">
                  <div className="discord-embed-accent" style={{ background: '#5f828d' }} />
                  <div className="discord-embed-content">
                    <div className="discord-embed-inner">
                      <div className="discord-embed-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img loading="lazy" src="/img/evict.webp" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600 }}>Settings</span>
                      </div>
                      <div className="discord-embed-description" style={{ borderLeft: '3px solid rgba(255,255,255,0.15)', paddingLeft: '0.6rem', margin: '0.4rem 0' }}>
                        {"Here's an overview of the current "}
                        <strong>antinuke settings</strong>
                        <br />
                        {"For more details on each module, use the subcommands under "}
                        <strong>antinuke</strong>
                      </div>
                      <div className="discord-embed-fields-grid">
                        <div className="discord-embed-field-inline">
                          <div className="discord-embed-field-name">Member Protection</div>
                          <div className="discord-embed-field-value" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', borderLeft: '3px solid rgba(255,255,255,0.15)', paddingLeft: '0.6rem' }}>
                            <span><img loading="lazy" src="/img/antinuke/disable.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Bot: Disabled</span>
                            <span><img loading="lazy" src="/img/antinuke/enabled.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Ban: 3 per hour</span>
                            <span><img loading="lazy" src="/img/antinuke/enabled.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Kick: 3 per hour</span>
                          </div>
                        </div>
                        <div className="discord-embed-field-inline">
                          <div className="discord-embed-field-name">Guild Protection</div>
                          <div className="discord-embed-field-value" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', borderLeft: '3px solid rgba(255,255,255,0.15)', paddingLeft: '0.6rem' }}>
                            <span><img loading="lazy" src="/img/antinuke/enabled.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Role: 3 per hour</span>
                            <span><img loading="lazy" src="/img/antinuke/enabled.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Channel: 3 per hour</span>
                            <span><img loading="lazy" src="/img/antinuke/enabled.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Webhook: 1 per hour</span>
                            <span><img loading="lazy" src="/img/antinuke/enabled.webp" alt="" style={{ width: 16, height: 16, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Emoji: 3 per hour</span>
                          </div>
                        </div>
                      </div>
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
