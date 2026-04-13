import VoiceMasterButtons from '@/components/VoiceMasterButtons'

export default function VoiceMasterSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-badge">Voice</span>
          <h2 className="section-title">VoiceMaster</h2>
        </div>
        <div className="music-section" data-reveal>
          <div className="music-embed">
            <VoiceMasterButtons>
              <div className="discord-message">
                <div className="discord-msg-avatar">
                  <img loading="lazy" src="/img/evict.webp" alt="evict" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                </div>
                <div className="discord-msg-body">
                  <div className="discord-msg-header">
                    <span className="discord-msg-username">evict</span>
                    <span className="discord-msg-bot-tag">BOT</span>
                    <span className="discord-msg-timestamp">3/31/26, 5:18 PM</span>
                  </div>
                  <div className="discord-embed-card">
                    <div className="discord-embed-accent" style={{ background: '#5f828d' }} />
                    <div className="discord-embed-content">
                      <div className="discord-embed-inner">
                        <div className="discord-embed-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <img loading="lazy" src="/img/evict.webp" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
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
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/lock.webp" alt="lock" className="vm-emoji" /> — <span className="vm-cmd">Lock</span> the voice channel</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/unlock.webp" alt="unlock" className="vm-emoji" /> — <span className="vm-cmd">Unlock</span> the voice channel</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/ghost.webp" alt="ghost" className="vm-emoji" /> — <span className="vm-cmd">Ghost</span> the voice channel</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/reveal.webp" alt="reveal" className="vm-emoji" /> — <span className="vm-cmd">Reveal</span> the voice channel</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/claim.webp" alt="claim" className="vm-emoji" /> — <span className="vm-cmd">Claim</span> the voice channel</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/hammer.webp" alt="disconnect" className="vm-emoji" /> — <span className="vm-cmd">Disconnect</span> a member</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/activity.webp" alt="activity" className="vm-emoji" /> — <span className="vm-cmd">Start</span> a new voice channel activity</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/information.webp" alt="info" className="vm-emoji" /> — <span className="vm-cmd">View</span> channel information</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/increase.webp" alt="increase" className="vm-emoji" /> — <span className="vm-cmd">Increase</span> the user limit</div>
                          <div className="vm-usage-row"><img loading="lazy" src="/img/voicemaster/decrease.webp" alt="decrease" className="vm-emoji" /> — <span className="vm-cmd">Decrease</span> the user limit</div>
                        </div>
                      </div>
                      <div className="discord-embed-thumbnail" style={{ width: 80, height: 80 }}>
                        <img loading="lazy" src="/img/evict.webp" alt="evict" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </VoiceMasterButtons>
          </div>
          <div className="music-info">
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
        </div>
      </div>
    </section>
  )
}
