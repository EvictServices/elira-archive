import FeaturesSection from '@/components/home/features-section'
import TestimonialsSection from '@/components/home/testimonials-section'
import CapabilitiesSection from '@/components/home/capabilities-section'
import HomeCtaSection from '@/components/home/home-cta-section'
import HeroSection from '@/components/home/hero-section'
import type { TopGuild } from '@/lib/marketing/top-guilds-shared'

export default function HomeView({ topGuilds }: { topGuilds: TopGuild[] }) {
  return (
    <div className="home-page">
      <HeroSection topGuilds={topGuilds} />

      <FeaturesSection />

      <CapabilitiesSection />

      <TestimonialsSection />

      <HomeCtaSection />
    </div>
  )
}
