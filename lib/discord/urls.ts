export const BOT_ID = '1203514684326805524'

export const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_ID}&permissions=8&integration_type=0&scope=bot`
export const SUPPORT_URL = 'https://discord.gg/evict'
export const DOCS_URL = 'https://docs.evict.bot'

export const DISCORD_API_BASE = 'https://discord.com/api/v10'

export function botInviteUrl(guildId?: string): string {
  if (!guildId) return INVITE_URL
  return `${INVITE_URL}&guild_id=${guildId}&disable_guild_select=true`
}

export function vanityJoinUrl(code: string): string {
  const slug = code.trim().replace(/^\/+/, '')
  return `https://discord.gg/${slug}`
}

export function discordChannelMessageUrl(
  guildId: string,
  channelId: string,
  messageId: string
): string {
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
}
