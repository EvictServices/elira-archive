import type { DiscordGuild } from '@/lib/discord/api'

const ADMINISTRATOR = BigInt(0x8)

export function isDiscordGuildAdmin(guild: Pick<DiscordGuild, 'owner' | 'permissions'>): boolean {
  return guild.owner || (BigInt(guild.permissions) & ADMINISTRATOR) !== BigInt(0)
}
