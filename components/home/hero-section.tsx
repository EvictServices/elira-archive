import HeroLanding from '@/components/home/hero-landing'
import Stars from '@/components/home/stars'

export default function HeroSection() {
  return (
    <section className="hero-landing" aria-label="Introduction">
      <Stars />
      <HeroLanding />
    </section>
  )
}
