import { fetchUserInfoBatch } from '@/lib/cluster/fetch-users'
import { userAvatarUrl } from '@/lib/discord/cdn'

export const VOICEMASTER_DEMO_USER_IDS = [
  '604463848526708757',
  '494684690393989141',
  '1203514684326805524',
] as const

export type VoicemasterDemoMember = {
  id: string
  displayName: string
  avatarUrl: string
}

function displayNameFor(id: string, info: { username?: string; display_name?: string } | undefined): string {
  if (info?.display_name?.trim()) return info.display_name.trim()
  if (info?.username?.trim()) return info.username.trim()
  return 'User'
}

export async function loadVoicemasterDemoMembers(): Promise<VoicemasterDemoMember[]> {
  const userMap = await fetchUserInfoBatch([...VOICEMASTER_DEMO_USER_IDS])

  return VOICEMASTER_DEMO_USER_IDS.map((id) => {
    const info = userMap.get(id)
    return {
      id,
      displayName: displayNameFor(id, info),
      avatarUrl: userAvatarUrl(id, info?.avatar ?? null, 64),
    }
  })
}
