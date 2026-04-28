import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const revalidate = 60

export async function GET() {
  try {
    const [topRes, totalRes, allTimeRes, allTimeCmdsRes] = await Promise.all([
      pool.query(
        `SELECT command_name, category, COUNT(*)::int AS count
         FROM invoke_history.commands
         WHERE "timestamp" >= NOW() - INTERVAL '24 hours'
           AND category NOT IN ('Developer', 'Jishaku')
         GROUP BY command_name, category
         ORDER BY count DESC
         LIMIT 5`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM invoke_history.commands
         WHERE "timestamp" >= NOW() - INTERVAL '24 hours'`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM invoke_history.commands`
      ),
      pool.query(
        `SELECT command_name, category, COUNT(*)::int AS count
         FROM invoke_history.commands
         WHERE category NOT IN ('Developer', 'Jishaku')
         GROUP BY command_name, category
         ORDER BY count DESC
         LIMIT 5`
      ),
    ])
    return NextResponse.json({
      commands: topRes.rows,
      total: totalRes.rows[0]?.count ?? 0,
      allTime: allTimeRes.rows[0]?.count ?? 0,
      allTimeCommands: allTimeCmdsRes.rows,
    })
  } catch {
    return NextResponse.json({ commands: [], total: 0 }, { status: 500 })
  }
}
