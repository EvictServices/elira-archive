import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import { listWelcomeMessages } from '@/lib/settings/welcome'
import { listBoostMessages } from '@/lib/settings/boost'
import { listGoodbyeMessages } from '@/lib/settings/goodbye'
import { getAutoroleSettings } from '@/lib/settings/autorole'
import { getLoggingSettings } from '@/lib/settings/logging'
import { getTicketSettings } from '@/lib/settings/tickets'
import {
  getConfiguration as getVoicemasterConfiguration,
  getEnrichedChannels as getVoicemasterChannels,
} from '@/lib/settings/voicemaster'
import { fetchGuildChannels, fetchGuildRoles, fetchGuildMember } from '@/lib/cluster'

const KNOWN_RESOURCES = new Set([
  'system',
  'boost',
  'goodbye',
  'channels',
  'autorole',
  'roles',
  'me',
  'logging',
  'tickets',
  'voicemaster',
  'voicemaster_channels',
])

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!(await hasGuildAdmin(session.accessToken, id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const include = (req.nextUrl.searchParams.get('include') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => KNOWN_RESOURCES.has(s))

  if (include.length === 0) {
    return NextResponse.json(
      { error: 'No valid resources specified' },
      { status: 400 }
    )
  }

  const results: Record<string, unknown> = {}

  await Promise.all(
    include.map(async (resource) => {
      switch (resource) {
        case 'system': {
          try {
            results.system = { messages: await listWelcomeMessages(id) }
          } catch {
            results.system = { messages: [], unavailable: true }
          }
          return
        }
        case 'boost': {
          try {
            results.boost = { messages: await listBoostMessages(id) }
          } catch {
            results.boost = { messages: [], unavailable: true }
          }
          return
        }
        case 'goodbye': {
          try {
            results.goodbye = { messages: await listGoodbyeMessages(id) }
          } catch {
            results.goodbye = { messages: [], unavailable: true }
          }
          return
        }
        case 'channels': {
          try {
            const channels = await fetchGuildChannels(id)
            results.channels = [...channels].sort(
              (a, b) => a.position - b.position
            )
          } catch {
            results.channels = []
          }
          return
        }
        case 'autorole': {
          try {
            results.autorole = await getAutoroleSettings(id)
          } catch {
            results.autorole = null
          }
          return
        }
        case 'roles': {
          try {
            const roles = await fetchGuildRoles(id)
            results.roles = roles
              .filter(
                (r) =>
                  !r.is_default &&
                  !r.is_bot_managed &&
                  !r.is_premium_subscriber &&
                  !r.is_integration
              )
              .sort((a, b) => b.position - a.position)
          } catch {
            results.roles = []
          }
          return
        }
        case 'me': {
          try {
            const member = await fetchGuildMember(id, session.userId)
            results.me = member ?? null
          } catch {
            results.me = null
          }
          return
        }
        case 'logging': {
          try {
            results.logging = await getLoggingSettings(id)
          } catch {
            results.logging = null
          }
          return
        }
        case 'tickets': {
          try {
            results.tickets = await getTicketSettings(id)
          } catch {
            results.tickets = null
          }
          return
        }
        case 'voicemaster': {
          try {
            results.voicemaster = {
              configuration: await getVoicemasterConfiguration(id),
            }
          } catch {
            results.voicemaster = { configuration: null }
          }
          return
        }
        case 'voicemaster_channels': {
          try {
            results.voicemaster_channels = {
              channels: await getVoicemasterChannels(id),
            }
          } catch {
            results.voicemaster_channels = { channels: [] }
          }
          return
        }
      }
    })
  )

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'private, max-age=5, stale-while-revalidate=30' },
  })
}
