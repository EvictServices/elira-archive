import FeaturesScrollGate from '@/components/home/features-scroll-gate'
import FeaturesSectionClient from '@/components/home/features-section-client'
import { loadVoicemasterDemoMembers } from '@/lib/marketing/voicemaster-demo'

export default async function FeaturesSection() {
  const voiceMembers = await loadVoicemasterDemoMembers()
  return (
    <FeaturesScrollGate>
      <FeaturesSectionClient voiceMembers={voiceMembers} />
    </FeaturesScrollGate>
  )
}
