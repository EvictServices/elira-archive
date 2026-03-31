import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT command_name, category, COUNT(*)::int AS count
       FROM invoke_history.commands
       WHERE "timestamp" >= NOW() - INTERVAL '24 hours'
         AND category NOT IN ('Developer', 'Jishaku')
       GROUP BY command_name, category
       ORDER BY count DESC
       LIMIT 10`
    )
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
