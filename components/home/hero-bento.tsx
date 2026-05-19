'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AnimatedCounter from '@/components/shared/animated-counter'
import {
  HERO_BENTO_CYCLE_MS,
  HERO_BENTO_SETS,
  type HeroBentoCard,
  type HeroBentoIcon,
  type LogTag,
} from '@/lib/marketing/hero-bento-cards'

const EXTRA_TAGS = [
  { label: 'Giveaways', href: '#capabilities' },
  { label: 'Starboard', href: '#capabilities' },
  { label: 'Highlights', href: '#capabilities' },
  { label: '+ much more', href: '#features' },
]

const WAVE_BARS = 24

function wrapIndex(i: number, len: number) {
  return ((i % len) + len) % len
}

function BentoIcon({ name }: { name: HeroBentoIcon }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true as const }

  switch (name) {
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'voice':
      return (
        <svg {...props}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" />
        </svg>
      )
    case 'mod':
      return (
        <svg {...props}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'gift':
      return (
        <svg {...props}>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
        </svg>
      )
    case 'star':
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...props}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    case 'roles':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        </svg>
      )
    case 'gem':
      return (
        <svg {...props}>
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          <path d="M2 9h20" />
        </svg>
      )
    case 'users':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      )
    case 'terminal':
      return (
        <svg {...props}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
  }
}

function tagClass(tag: LogTag) {
  if (tag === 'halt') return 'hero-bento-tag--halt'
  if (tag === 'ok') return 'hero-bento-tag--ok'
  if (tag === 'deny') return 'hero-bento-tag--deny'
  if (tag === 'sent') return 'hero-bento-tag--sent'
  return 'hero-bento-tag--log'
}

function CardBody({
  card,
  logOffset,
}: {
  card: HeroBentoCard
  logOffset: number
}) {
  const body = card.body

  if (body.type === 'wave') {
    return (
      <>
        <p className="hero-bento-stat">{body.desc}</p>
        <div className="hero-bento-wave is-idle" aria-hidden>
          {Array.from({ length: WAVE_BARS }, (_, i) => (
            <span key={i} className="hero-bento-bar" style={{ ['--i' as string]: i }} />
          ))}
        </div>
      </>
    )
  }

  if (body.type === 'log') {
    const visible = [0, 1, 2].map((n) => body.events[wrapIndex(logOffset + n, body.events.length)])
    return (
      <ul className="hero-bento-log" aria-live="polite">
        {visible.map((ev, i) => (
          <li key={`${logOffset}-${i}`} className="hero-bento-log-line">
            <span className={`hero-bento-tag ${tagClass(ev.tag)}`}>{ev.label}</span>
            <span>{ev.msg}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (body.type === 'meter') {
    return (
      <>
        <p className="hero-bento-stat">{body.stat}</p>
        <div className="hero-bento-meter" aria-hidden>
          <span className="hero-bento-meter-fill" style={{ width: `${body.fill}%` }} />
        </div>
      </>
    )
  }

  if (body.type === 'thread') {
    return (
      <div className="hero-bento-thread">
        <span className={`hero-bento-thread-dot${body.hasReply ? ' has-reply' : ''}`} />
        <div className="hero-bento-thread-lines">
          <span className="hero-bento-thread-line hero-bento-thread-line--primary">{body.primary}</span>
          <span
            className={`hero-bento-thread-line${body.hasReply ? ' hero-bento-thread-line--reply' : ' hero-bento-thread-line--ghost'}`}
          >
            {body.secondary}
          </span>
        </div>
      </div>
    )
  }

  if (body.type === 'giveaway') {
    const frame = body.frames[wrapIndex(logOffset, body.frames.length)]
    return (
      <>
        <p className="hero-bento-stat hero-bento-stat--lg hero-bento-stat--tick">
          <strong>
            <AnimatedCounter value={frame.entries} duration={600} />
          </strong>{' '}
          entries · ends in {frame.ends}
        </p>
        <div className="hero-bento-meter" aria-hidden>
          <span className="hero-bento-meter-fill" style={{ width: `${frame.fill}%` }} />
        </div>
      </>
    )
  }

  if (body.type === 'stat') {
    return <p className="hero-bento-stat hero-bento-stat--lg">{body.value}</p>
  }

  return (
    <div className="hero-bento-chips">
      {body.items.map((item) => (
        <span key={item} className="hero-bento-chip">
          {item}
        </span>
      ))}
    </div>
  )
}

function BentoCard({
  card,
  slot,
  logOffset,
}: {
  card: HeroBentoCard
  slot: number
  logOffset: number
}) {
  const tall = card.body.type === 'wave' || card.body.type === 'log'

  return (
    <article
      className={`hero-bento-card hero-bento-card--slot-${slot}${tall ? ' hero-bento-card--tall' : ''}`}
    >
      <header className="hero-bento-head">
        <span className="hero-bento-icon">
          <BentoIcon name={card.icon} />
        </span>
        <span className="hero-bento-title">{card.title}</span>
        {'pill' in card && card.pill ? <span className="hero-bento-pill">{card.pill}</span> : null}
      </header>
      <CardBody card={card} logOffset={logOffset} />
    </article>
  )
}

export default function HeroBento() {
  const [setIndex, setSetIndex] = useState(0)
  const [logOffset, setLogOffset] = useState(0)

  const set = HERO_BENTO_SETS[setIndex]

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSetIndex((i) => (i + 1) % HERO_BENTO_SETS.length)
    }, HERO_BENTO_CYCLE_MS)
    return () => window.clearInterval(tick)
  }, [])

  useEffect(() => {
    const tick = window.setInterval(() => {
      setLogOffset((o) => o + 1)
    }, 2600)
    return () => window.clearInterval(tick)
  }, [])

  const scrollToHash = (href: string) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="hero-bento" aria-label="Feature preview">
      <div className="hero-bento-grid" key={set.id}>
        {set.cards.map((card, slot) => (
          <BentoCard key={card.id} card={card} slot={slot} logOffset={logOffset} />
        ))}
      </div>

      <div className="hero-bento-detail" key={`detail-${set.id}`}>
        <p className="hero-bento-detail-text">
          <strong>{set.detailStrong}</strong> — {set.detail}
        </p>
        <Link href="#features" className="hero-bento-detail-link">
          See it in features
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div className="hero-bento-dots" aria-hidden>
        {HERO_BENTO_SETS.map((s, i) => (
          <span key={s.id} className={`hero-bento-dot${i === setIndex ? ' is-active' : ''}`} />
        ))}
      </div>

      <div className="hero-bento-tags">
        {EXTRA_TAGS.map((tag) => (
          <button
            key={tag.label}
            type="button"
            className={`hero-bento-tag-btn${tag.label.startsWith('+') ? ' hero-bento-tag-btn--more' : ''}`}
            onClick={() => scrollToHash(tag.href)}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  )
}
