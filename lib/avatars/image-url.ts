/** Smaller Discord CDN variant for grid thumbnails (~148px cells). */
export function avatarThumbUrl(url: string, size = 160): string {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    if (host.includes('discordapp.com') || host.includes('discord.com')) {
      u.searchParams.set('size', String(size))
      return u.toString()
    }
    return url
  } catch {
    return url
  }
}
