import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { isAntinukeAdmin } from '@/lib/settings/antinuke'
import { fetchResolvedUsers } from '@/lib/cluster'

const SNOWFLAKE_RE = /^\d{17,20}$/

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: guildId } = await params

  if (!(await isAntinukeAdmin(guildId, session.userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ids = (body as { ids?: unknown }).ids
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids must be an array' }, { status: 400 })
  }

  const filtered = ids.filter(
    (v): v is string => typeof v === 'string' && SNOWFLAKE_RE.test(v.trim())
  )

  try {
    const users = await fetchResolvedUsers(filtered)
    const usersMap: Record<string, (typeof users)[number]> = {}
    for (const u of users) {
      usersMap[u.user_id] = u
    }
    return NextResponse.json({ users: usersMap })
  } catch {
    return NextResponse.json(
      { error: 'Could not resolve users from the bot' },
      { status: 502 }
    )
  }
}
