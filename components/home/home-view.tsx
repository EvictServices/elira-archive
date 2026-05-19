import FeaturesSection from '@/components/home/features-section'
import CapabilitiesSection from '@/components/home/capabilities-section'
import HomeCtaSection from '@/components/home/home-cta-section'
import HeroSection from '@/components/home/hero-section'

function Divider() {
  return (
    <div className="home-divider" aria-hidden>
      <span className="home-divider-line" />
    </div>
  )
}

export default function HomeView() {
  return (
    <div className="home-page">
      <HeroSection />

      <Divider />

      <FeaturesSection />

      <CapabilitiesSection />

      <HomeCtaSection />
    </div>
  )
}
