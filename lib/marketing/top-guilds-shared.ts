export type TopGuild = {
  id: string
  name: string
  member_count: number
  icon_url: string | null
  vanity_code: string | null
  join_url: string | null
}

export const TOP_GUILDS_CACHE_TTL_SEC = 120
