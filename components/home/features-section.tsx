import FeaturesSectionClient from '@/components/home/features-section-client'
import { loadVoicemasterDemoMembers } from '@/lib/marketing/voicemaster-demo'

export default async function FeaturesSection() {
  const voiceMembers = await loadVoicemasterDemoMembers()
  return <FeaturesSectionClient voiceMembers={voiceMembers} />
}
