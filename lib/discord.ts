const DISCORD_API = 'https://discord.com/api/v10'

const GUILD_OR_USER_SNOWFLAKE_RE = /^\d{17,20}$/

export function isValidGuildSnowflake(id: string): boolean {
  return typeof id === 'string' && GUILD_OR_USER_SNOWFLAKE_RE.test(id.trim())
}

export function buildDiscordAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID ?? '',
    redirect_uri: process.env.DISCORD_REDIRECT_URI ?? '',
    response_type: 'code',
    scope: 'identify guilds email',
    state,
  })
  return `https://discord.com/oauth2/authorize?${params}`
}

export async function exchangeCode(code: string) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  })

  if (!res.ok) {
    throw new Error(`Discord token exchange failed: ${res.status}`)
  }

  return res.json() as Promise<{
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    scope: string
  }>
}

export async function exchangeRefreshToken(refreshToken: string) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    throw new Error(`Discord token refresh failed: ${res.status}`)
  }

  return res.json() as Promise<{
    access_token: string
    token_type: string
    expires_in: number
    refresh_token?: string
    scope: string
  }>
}

export async function fetchDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Discord user fetch failed: ${res.status}`)
  }

  return res.json() as Promise<{
    id: string
    username: string
    discriminator: string
    avatar: string | null
    global_name: string | null
    email: string | null
  }>
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function retryAfterMs(res: Response, capMs: number): number {
  const raw = res.headers.get('retry-after')
  if (!raw) return Math.min(1500, capMs)
  const sec = Number(raw)
  if (!Number.isNaN(sec) && sec >= 0) {
    return Math.min(Math.ceil(sec * 1000), capMs)
  }
  const when = Date.parse(raw)
  if (!Number.isNaN(when)) {
    return Math.min(Math.max(0, when - Date.now()), capMs)
  }
  return Math.min(1500, capMs)
}

const GUILD_FETCH_MAX_ATTEMPTS = 4
const GUILD_FETCH_RETRY_WAIT_CAP_MS = 12_000

export async function fetchDiscordGuilds(accessToken: string): Promise<DiscordGuild[]> {
  let lastStatus = 0

  for (let attempt = 0; attempt < GUILD_FETCH_MAX_ATTEMPTS; attempt++) {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.ok) {
      return res.json() as Promise<DiscordGuild[]>
    }

    lastStatus = res.status
    const retryable = res.status === 429 || res.status === 503
    if (retryable && attempt < GUILD_FETCH_MAX_ATTEMPTS - 1) {
      await sleep(retryAfterMs(res, GUILD_FETCH_RETRY_WAIT_CAP_MS))
      continue
    }

    throw new Error(`Discord guilds fetch failed: ${res.status}`)
  }

  throw new Error(`Discord guilds fetch failed: ${lastStatus}`)
}

const ADMINISTRATOR = BigInt(0x8)

export async function hasGuildAdmin(accessToken: string, guildId: string): Promise<boolean> {
  if (!isValidGuildSnowflake(guildId)) return false

  let guilds: DiscordGuild[]
  try {
    guilds = await fetchDiscordGuilds(accessToken)
  } catch (e) {
    console.error('hasGuildAdmin: guild list fetch failed', e)
    return false
  }

  const guild = guilds.find((g) => g.id === guildId.trim())
  if (!guild) return false
  return guild.owner || (BigInt(guild.permissions) & ADMINISTRATOR) !== BigInt(0)
}
