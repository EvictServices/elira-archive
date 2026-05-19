import type { ReactNode } from 'react'

type Capability = {
  title: string
  body: string
  icon: ReactNode
}

const CAPABILITIES: Capability[] = [
  {
    title: 'Giveaways',
    body: 'Run timed drops with entry requirements, winner rolls, and rerolls — hosted in-channel without a dedicated giveaway bot.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    title: 'Fake permissions',
    body: 'Grant staff actions through the bot — ban, mute, manage channels — without handing out dangerous Discord role permissions.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Reaction & button roles',
    body: 'Let members self-assign with emoji reactions or button panels — multiple menus, role limits, and remove-on-unreact.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Booster roles',
    body: 'Let boosters claim custom roles — set names, colors, and limits so Nitro perks stay on-brand and under control.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        <path d="M11 3 8 9l4 12 4-12-3-6" />
        <path d="M2 9h20" />
      </svg>
    ),
  },
  {
    title: 'Starboard',
    body: 'Surface the messages your community actually cares about — thresholds, channels, and ignores included.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'Tickets',
    body: 'Open support threads with panels and categories — no second bot for intake and routing.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Highlights',
    body: 'Get a DM when keywords you follow show up — per-server lists with channel and user ignores.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    title: 'Join, leave & boost flows',
    body: 'Welcome, leave, and boost messages plus automatic roles when someone lands in your server.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    title: 'Rewards',
    body: 'Track server tag and vanity rep — grant roles or perks when members show up for your brand.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    title: 'Prefix, custom & slash',
    body: 'Server-wide prefix, personal overrides, and slash commands — pick how your staff and members actually type.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
]

export default function CapabilitiesSection() {
  return (
    <section className="cap" aria-labelledby="cap-heading" data-reveal>
      <header className="cap-head">
        <h2 id="cap-heading" className="cap-title">
          Plenty more <span className="cap-accent">under the surface</span>
        </h2>
        <p className="cap-lead">
          Custom branding, giveaways, fake permissions, role menus, tickets, highlights, and more — utility that
          usually means stacking extra bots on top of moderation.
        </p>
      </header>

      <div className="cap-surface">
        <div className="cap-custom">
          <span className="cap-custom-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </span>
          <div className="cap-custom-body">
            <h3 className="cap-custom-title">Customization</h3>
            <p className="cap-custom-desc">
              Brand the bot for your server — swap the profile banner and icon, set the bio, and tune context
              settings so replies and embeds match your community.
            </p>
            <ul className="cap-custom-tags" aria-label="Customization options">
              <li>Banner</li>
              <li>Icon</li>
              <li>Bio</li>
              <li>Context settings</li>
            </ul>
          </div>
          <div className="cap-custom-preview" aria-hidden>
            <span className="cap-custom-banner" />
            <span className="cap-custom-profile">
              <span className="cap-custom-avatar" />
              <span className="cap-custom-lines">
                <span />
                <span />
              </span>
            </span>
          </div>
        </div>

        <ul className="cap-grid">
          {CAPABILITIES.map((item) => (
            <li key={item.title} className="cap-cell">
              <span className="cap-cell-icon">{item.icon}</span>
              <div className="cap-cell-body">
                <h3 className="cap-cell-title">{item.title}</h3>
                <p className="cap-cell-desc">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
