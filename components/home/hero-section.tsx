import Link from 'next/link'
import { INVITE_URL, SUPPORT_URL } from '@/lib/discord/urls'
import GuildCarousel from '@/components/home/guild-carousel'
import HeroBento from '@/components/home/hero-bento'
import HeroProof from '@/components/home/hero-proof'

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-headline">
            <span className="hero-headline-accent">
              <span className="hero-headline-word">evict</span>
              <span className="hero-headline-mark">.</span>
            </span>
          </h1>
          <p className="hero-desc">
            One Discord bot for moderation, antinuke, custom voice channels, tickets, and the
            utilities you would otherwise stack — fast, polished, and visually refined.
          </p>
          <div className="hero-actions">
            <a href={INVITE_URL} target="_blank" rel="noopener" className="btn btn-primary hero-btn-invite">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add to server
            </a>
            <Link href="#features" className="btn btn-ghost hero-btn-explore">
              Explore features
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener"
              className="hero-link-support"
            >
            </a>
          </div>

          <div className="hero-carousel-wrap">
            <GuildCarousel />
          </div>

          <HeroProof />
        </div>

        <div className="hero-bento-wrap" data-reveal>
          <HeroBento />
        </div>
      </div>
    </section>
  )
}
