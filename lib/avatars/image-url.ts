/** Prefer a smaller CDN variant for grid thumbnails (~148px cells). */
export function avatarThumbUrl(url: string, size = 160): string {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    if (host.includes('discordapp.com') || host.includes('discord.com')) {
      u.searchParams.set('size', String(size))
      return u.toString()
    }
    if (!u.searchParams.has('size') && !u.searchParams.has('w') && !u.searchParams.has('width')) {
      u.searchParams.set('size', String(size))
    }
    return u.toString()
  } catch {
    return url
  }
}
