import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid guild ID' }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `SELECT user_id, xp, level, total_xp
       FROM level.member
       WHERE guild_id = $1
       ORDER BY total_xp DESC
       LIMIT 100`,
      [id]
    )

    return NextResponse.json({ members: result.rows })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
