'use client'

import { guildInitials } from '@/lib/discord/format'
import { SUPPORT_URL } from '@/lib/discord/urls'
import { TESTIMONIALS_PER_VIEW, testimonialsForPage, type Testimonial } from '@/lib/marketing/testimonials'

function Avatar({
  name,
  url,
  className,
}: {
  name: string
  url: string | null
  className: string
}) {
  if (url) {
    return <img src={url} alt="" className={className} loading="lazy" />
  }
  return (
    <span className={`${className} tmn-avatar-fallback`} aria-hidden>
      {guildInitials(name)}
    </span>
  )
}

function TestimonialCard({ item, slot }: { item: Testimonial; slot: number }) {
  const featured = slot === 0

  return (
    <article
      className={`tmn-card tmn-card--slot-${slot}${featured ? ' tmn-card--featured' : ''}`}
      aria-hidden
    >
      <blockquote className="tmn-quote">
        <p>{item.quote}</p>
      </blockquote>

      <footer className="tmn-foot">
        <div className="tmn-person">
          <Avatar name={item.displayName} url={item.userAvatarUrl} className="tmn-user-avatar" />
          <div className="tmn-person-meta">
            <span className="tmn-display-name">{item.displayName}</span>
            <span className="tmn-username">@{item.username}</span>
          </div>
          <span className="tmn-role">{item.role}</span>
        </div>

        <div className="tmn-guild">
          <Avatar name={item.guildName} url={item.guildIconUrl} className="tmn-guild-icon" />
          <span className="tmn-guild-name">{item.guildName}</span>
        </div>
      </footer>
    </article>
  )
}

export default function TestimonialsSection() {
  const visible = testimonialsForPage(0).slice(0, TESTIMONIALS_PER_VIEW)

  return (
    <section id="testimonials" className="tmn" aria-labelledby="tmn-heading" data-reveal>
      <header className="tmn-head">
        <h2 id="tmn-heading" className="tmn-title">
          Trusted by <span className="tmn-accent">real communities</span>
        </h2>
        <p className="tmn-lead">
          Server owners and staff who run Evict day to day — names, roles, and guilds as they show up in Discord.
        </p>
      </header>

      <div className="tmn-stage">
        <div className="tmn-bento tmn-bento--placeholder" aria-hidden>
          {visible.map((item, slot) => (
            <TestimonialCard key={item.id} item={item} slot={slot} />
          ))}
        </div>

        <div className="tmn-overlay">
          <p className="tmn-overlay-text">
            To be shown here —{' '}
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="tmn-overlay-link">
              join the support server
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
