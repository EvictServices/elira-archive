const CDN = 'https://cdn.discordapp.com'

function defaultUserAvatarIndex(userId: string): number {
  return (Number(userId) >> 22) % 6
}

export function userAvatarUrl(
  userId: string,
  avatarHash: string | null | undefined,
  size = 128
): string {
  if (avatarHash) {
    return `${CDN}/avatars/${userId}/${avatarHash}.webp?size=${size}`
  }
  return `${CDN}/embed/avatars/${defaultUserAvatarIndex(userId)}.png`
}

export function guildIconUrl(
  guildId: string,
  iconHash: string | null | undefined,
  size = 128
): string | null {
  if (!iconHash?.trim()) return null
  const hash = iconHash.trim()
  const ext = hash.startsWith('a_') ? 'gif' : 'webp'
  return `${CDN}/icons/${guildId}/${hash}.${ext}?size=${size}`
}

export function guildBannerUrl(
  guildId: string,
  bannerHash: string | null | undefined,
  size = 512
): string | null {
  if (!bannerHash?.trim()) return null
  const hash = bannerHash.trim()
  const ext = hash.startsWith('a_') ? 'gif' : 'webp'
  return `${CDN}/banners/${guildId}/${hash}.${ext}?size=${size}`
}
