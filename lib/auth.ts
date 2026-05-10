import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import redis from '@/lib/redis'
import { exchangeRefreshToken } from '@/lib/discord'

const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7
const SESSION_KEY_PREFIX = 'sess:'
const REFRESH_BUFFER_MS = 5 * 60 * 1000

const SESSION_ID_RE = /^[a-f0-9]{64}$/

type StoredSession = {
  userId: string
  username: string
  avatar: string | null
  discriminator: string
  email: string | null
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number
}

export interface Session {
  userId: string
  username: string
  avatar: string | null
  discriminator: string
  accessToken: string
  email: string | null
}

export type SessionCreateInput = Session & {
  refreshToken: string
  expiresIn: number
}

function sessionKey(id: string) {
  return `${SESSION_KEY_PREFIX}${id}`
}

export function isValidSessionId(value: string | undefined): value is string {
  return typeof value === 'string' && SESSION_ID_RE.test(value)
}

export async function createSession(data: SessionCreateInput): Promise<string> {
  const id = randomBytes(32).toString('hex')
  const accessTokenExpiresAt = Date.now() + data.expiresIn * 1000
  const stored: StoredSession = {
    userId: data.userId,
    username: data.username,
    avatar: data.avatar,
    discriminator: data.discriminator,
    email: data.email,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt,
  }
  await redis.set(sessionKey(id), JSON.stringify(stored), 'EX', SESSION_MAX_AGE)
  return id
}

async function persistSession(id: string, stored: StoredSession) {
  await redis.set(sessionKey(id), JSON.stringify(stored), 'EX', SESSION_MAX_AGE)
}

async function loadAndMaybeRefresh(id: string): Promise<StoredSession | null> {
  const raw = await redis.get(sessionKey(id))
  if (!raw) return null

  let stored: StoredSession
  try {
    stored = JSON.parse(raw) as StoredSession
  } catch {
    await redis.del(sessionKey(id))
    return null
  }

  const needsRefresh =
    typeof stored.accessTokenExpiresAt !== 'number' ||
    Date.now() + REFRESH_BUFFER_MS >= stored.accessTokenExpiresAt

  if (needsRefresh) {
    try {
      const tok = await exchangeRefreshToken(stored.refreshToken)
      stored.accessToken = tok.access_token
      if (tok.refresh_token) {
        stored.refreshToken = tok.refresh_token
      }
      stored.accessTokenExpiresAt = Date.now() + tok.expires_in * 1000
      await persistSession(id, stored)
    } catch {
      await redis.del(sessionKey(id))
      return null
    }
  } else {
    await redis.expire(sessionKey(id), SESSION_MAX_AGE)
  }

  return stored
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get(SESSION_COOKIE)?.value
  if (!sid || !isValidSessionId(sid)) return null

  try {
    const stored = await loadAndMaybeRefresh(sid)
    if (!stored) return null
    return {
      userId: stored.userId,
      username: stored.username,
      avatar: stored.avatar,
      discriminator: stored.discriminator,
      accessToken: stored.accessToken,
      email: stored.email,
    }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sid = cookieStore.get(SESSION_COOKIE)?.value
  if (!sid || !isValidSessionId(sid)) return
  try {
    await redis.del(sessionKey(sid))
  } catch {
    // best effort
  }
}

export function sessionCookieOptions(sessionId: string) {
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

export const OAUTH_STATE_COOKIE = 'oauth_state'
const OAUTH_STATE_MAX_AGE = 600

export function oauthStateCookieSet(value: string) {
  return {
    name: OAUTH_STATE_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE,
  }
}

export function oauthStateCookieClear() {
  return {
    name: OAUTH_STATE_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}
