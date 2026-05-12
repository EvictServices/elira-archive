'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'

interface Guild {
  guild_id: string
  name: string
  icon_url: string | null
  banner_url: string | null
  owner_id: string
  member_count: number
  channel_count?: number
  boost_level?: number
}

interface CommandRow {
  command_name: string
  category: string | null
  count: number
}

interface CategoryRow {
  category: string
  count: number
}

interface DailyRow {
  day: string
  invocations: number
  distinct_commands: number
}

interface UsagePayload {
  days?: number
  commands?: CommandRow[]
  categories?: CategoryRow[]
  daily?: DailyRow[]
  total?: number
  invocations?: { current: number; previous: number }
  distinct_commands?: { current: number; previous: number }
}

function statNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function fmtStat(v: unknown): string {
  const n = statNum(v)
  return n !== null ? n.toLocaleString() : '—'
}

function normalizeDayKey(day: unknown): string {
  if (day == null) return ''
  const s = String(day).trim()
  const head = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head
  const t = Date.parse(s)
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10)
  return head
}

function padDailySeries(rows: DailyRow[], spanDays: number): DailyRow[] {
  const map = new Map(
    rows.map((r) => {
      const key = normalizeDayKey(r.day)
      return [
        key,
        {
          day: key,
          invocations: Number(r.invocations) || 0,
          distinct_commands: Number(r.distinct_commands) || 0,
        },
      ] as const
    })
  )
  const end = new Date()
  const out: DailyRow[] = []
  for (let i = spanDays - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - i))
    const key = d.toISOString().slice(0, 10)
    const hit = map.get(key)
    out.push({
      day: key,
      invocations: hit?.invocations ?? 0,
      distinct_commands: hit?.distinct_commands ?? 0,
    })
  }
  return out
}

/** When total invocations exist but per-day rows are missing, spread counts across the window. */
function distributeTotalAcrossDays(total: number, spanDays: number): DailyRow[] {
  const pad = padDailySeries([], spanDays)
  if (total <= 0 || spanDays <= 0) return pad
  const base = Math.floor(total / spanDays)
  const rem = total % spanDays
  return pad.map((d, i) => ({
    ...d,
    invocations: base + (i < rem ? 1 : 0),
    distinct_commands: 0,
  }))
}

function trendLine(cur: number, prev: number, labelWindow: string): { line: string; tone: 'up' | 'down' | 'flat' | 'na' } {
  if (cur === 0 && prev === 0) {
    return { line: `No data prior ${labelWindow}`, tone: 'na' }
  }
  if (prev === 0 && cur > 0) {
    return { line: `↑ +${cur.toLocaleString()} vs prior ${labelWindow}`, tone: 'up' }
  }
  const delta = cur - prev
  const pct = (delta / prev) * 100
  const up = delta > 0
  const flat = delta === 0
  const arrow = flat ? '→' : up ? '↑' : '↓'
  const signedDelta = `${delta >= 0 ? '+' : ''}${delta.toLocaleString()}`
  const signedPct = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  return {
    line: `${arrow} ${signedDelta} (${signedPct}) vs prior ${labelWindow}`,
    tone: flat ? 'flat' : up ? 'up' : 'down',
  }
}

function ActivityAreaChart({ series }: { series: DailyRow[] }) {
  const gradId = useId().replace(/:/g, '')
  const fillInvId = `govFillInv-${gradId}`
  const fillDistId = `govFillDist-${gradId}`

  if (!series.length) return null

  const w = 800
  const h = 260
  const padL = 44
  const padR = 16
  const padT = 20
  const padB = 36
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const invVals = series.map((d) => (Number.isFinite(d.invocations) ? d.invocations : 0))
  const distVals = series.map((d) => (Number.isFinite(d.distinct_commands) ? d.distinct_commands : 0))
  const maxInv = Math.max(1, ...invVals)
  const maxDist = Math.max(1, ...distVals)
  const n = Math.max(series.length, 2)
  const xAt = (i: number) => padL + (i / (n - 1)) * innerW
  const yInv = (v: number) => padT + innerH - (v / maxInv) * innerH
  const yDist = (v: number) => padT + innerH - (v / maxDist) * innerH

  const lineInv = invVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yInv(v).toFixed(1)}`).join(' ')
  const lineDist = distVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yDist(v).toFixed(1)}`).join(' ')

  const baseY = padT + innerH
  const areaInv = `${lineInv} L ${xAt(n - 1).toFixed(1)} ${baseY} L ${xAt(0).toFixed(1)} ${baseY} Z`
  const areaDist = `${lineDist} L ${xAt(n - 1).toFixed(1)} ${baseY} L ${xAt(0).toFixed(1)} ${baseY} Z`

  const yTicks = 4
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxInv * (yTicks - i)) / yTicks))

  const xLabelEvery = n <= 14 ? 1 : n <= 30 ? 5 : Math.ceil(n / 8)
  const fmtShort = (iso: string) => {
    const [, m, d] = iso.split('-')
    return `${m}/${d}`
  }

  return (
    <svg className="gov-activity-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Command activity over time">
      <defs>
        <linearGradient id={fillInvId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(168, 130, 255, 0.45)" />
          <stop offset="100%" stopColor="rgba(168, 130, 255, 0)" />
        </linearGradient>
        <linearGradient id={fillDistId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(94, 214, 196, 0.35)" />
          <stop offset="100%" stopColor="rgba(94, 214, 196, 0)" />
        </linearGradient>
      </defs>
      {tickVals.map((tv, i) => {
        const y = padT + innerH - (tv / maxInv) * innerH
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} className="gov-activity-gridline" />
            <text x={padL - 8} y={y + 4} className="gov-activity-ytick" textAnchor="end">
              {tv >= 1000 ? `${(tv / 1000).toFixed(tv % 1000 === 0 ? 0 : 1)}k` : tv}
            </text>
          </g>
        )
      })}
      <path d={areaDist} fill={`url(#${fillDistId})`} className="gov-activity-area gov-activity-area--back" />
      <path d={areaInv} fill={`url(#${fillInvId})`} className="gov-activity-area gov-activity-area--front" />
      <path
        d={lineDist}
        fill="none"
        stroke="rgb(94, 214, 196)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="gov-activity-line gov-activity-line--dist"
      />
      <path
        d={lineInv}
        fill="none"
        stroke="rgb(178, 150, 255)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="gov-activity-line gov-activity-line--inv"
      />
      {series.map((d, i) =>
        i % xLabelEvery === 0 ? (
          <text key={d.day} x={xAt(i)} y={h - 10} className="gov-activity-xtick" textAnchor="middle">
            {fmtShort(d.day)}
          </text>
        ) : null
      )}
    </svg>
  )
}

const RANGE_OPTIONS: { days: number; label: string }[] = [
  { days: 7, label: 'Week' },
  { days: 30, label: 'Month' },
  { days: 90, label: 'Quarter' },
  { days: 365, label: 'Year' },
]

export default function GuildOverviewSettings({
  guild,
  mutualServerCount,
}: {
  guild: Guild
  mutualServerCount: number
}) {
  const [rangeDays, setRangeDays] = useState(30)
  const [payload, setPayload] = useState<UsagePayload | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/settings/${guild.guild_id}/command-usage?days=${rangeDays}`)
      .then((r) => r.json())
      .then((data: UsagePayload & { error?: string }) => {
        if (cancelled) return
        if (data && typeof data === 'object' && 'error' in data && data.error) {
          setPayload(null)
          return
        }
        setPayload(data)
      })
      .catch(() => {
        if (!cancelled) setPayload(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [guild.guild_id, rangeDays])

  useEffect(() => {
    const cancel = load()
    return cancel
  }, [load])

  const commands = payload?.commands ?? []
  const categories = payload?.categories ?? []
  const total = payload?.total ?? 0
  const inv = payload?.invocations ?? { current: 0, previous: 0 }
  const dist = payload?.distinct_commands ?? { current: 0, previous: 0 }
  const dailyRaw = payload?.daily ?? []

  const windowLabel = rangeDays === 7 ? '7 days' : rangeDays === 30 ? '30 days' : rangeDays === 90 ? '90 days' : 'year'

  const paddedDaily = useMemo(() => padDailySeries(dailyRaw, rangeDays), [dailyRaw, rangeDays])

  const chartSeries = useMemo(() => {
    const hasDailyPoints = paddedDaily.some((d) => (d.invocations ?? 0) > 0 || (d.distinct_commands ?? 0) > 0)
    if (hasDailyPoints) return paddedDaily
    if (total > 0) return distributeTotalAcrossDays(total, rangeDays)
    return paddedDaily
  }, [paddedDaily, total, rangeDays])

  const hasChartPoints = chartSeries.some((d) => (d.invocations ?? 0) > 0 || (d.distinct_commands ?? 0) > 0)

  const maxCmd = Math.max(1, ...commands.map((c) => c.count))
  const maxCat = Math.max(1, ...categories.map((c) => c.count))

  const invTrend = trendLine(inv.current, inv.previous, windowLabel)
  const distTrend = trendLine(dist.current, dist.previous, windowLabel)

  const channelCount = fmtStat(guild.channel_count)
  const boostLevel = statNum(guild.boost_level)

  const kpiCards = [
    {
      title: 'Total members',
      value: guild.member_count.toLocaleString(),
      trend: { line: 'Live from Discord', tone: 'na' as const },
    },
    {
      title: 'Command runs',
      value: inv.current.toLocaleString(),
      trend: invTrend,
    },
    {
      title: 'Commands in use',
      value: dist.current.toLocaleString(),
      trend: distTrend,
    },
    {
      title: 'Channels',
      value: channelCount,
      trend: {
        line:
          boostLevel !== null && boostLevel > 0
            ? `Boost tier ${boostLevel} · ${mutualServerCount} dashboard servers`
            : `${mutualServerCount} servers on your dashboard`,
        tone: 'na' as const,
      },
    },
  ]

  const activitySummary = trendLine(inv.current, inv.previous, windowLabel)

  return (
    <div className="guild-overview-template">
      <nav className="gov-breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Servers</Link>
        <span className="gov-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span className="gov-breadcrumb-current">{guild.name}</span>
        <span className="gov-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span className="gov-breadcrumb-current">Overview</span>
      </nav>

      <header className="gov-pagehead">
        <h1 className="gov-pagehead-title">
          {guild.name} <span className="gov-pagehead-muted">Overview</span>
        </h1>
        <p className="gov-pagehead-desc">Performance and engagement for this server — members and how the bot is used.</p>
      </header>

      <section className="gov-kpi-row" aria-label="Summary metrics">
        {kpiCards.map((c) => (
          <div key={c.title} className="gov-kpi-card">
            <span className="gov-kpi-title">{c.title}</span>
            <span className="gov-kpi-value">{c.value}</span>
            <span className={`gov-kpi-trend gov-kpi-trend--${c.trend.tone}`}>{c.trend.line}</span>
          </div>
        ))}
      </section>

      <section className="gov-activity-card an-module enabled">
        <div className="gov-activity-head">
          <div className="gov-activity-head-left">
            <span className="an-module-name">Command activity</span>
            <div className="gov-range-toggle" role="group" aria-label="Time range">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  className={`gov-range-btn${rangeDays === opt.days ? ' gov-range-btn--active' : ''}`}
                  onClick={() => setRangeDays(opt.days)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="gov-activity-head-right">
            <span className="gov-activity-total">{total.toLocaleString()}</span>
            <span className={`gov-activity-delta gov-kpi-trend--${activitySummary.tone}`}>{activitySummary.line}</span>
          </div>
        </div>
        <span className="an-module-desc">Daily invocations and distinct command names in this server.</span>
        <div className="an-module-body gov-activity-body">
          {loading ? (
            <p className="settings-loading gov-activity-loading">Loading chart…</p>
          ) : !hasChartPoints ? (
            <p className="settings-hint gov-activity-empty">No command activity in this range yet.</p>
          ) : (
            <ActivityAreaChart series={chartSeries} />
          )}
          <div className="gov-activity-legend">
            <span>
              <i className="gov-legend-dot gov-legend-dot--inv" /> Invocations
            </span>
            <span>
              <i className="gov-legend-dot gov-legend-dot--dist" /> Unique commands / day
            </span>
          </div>
        </div>
      </section>

      <section className="gov-split" aria-label="Top commands and categories">
        <div className="gov-split-card an-module enabled">
          <div className="an-module-header">
            <span className="an-module-name">Top commands</span>
          </div>
          <span className="an-module-desc">By invocation count in the selected range.</span>
          <div className="an-module-body">
            {loading ? (
              <p className="settings-loading" style={{ margin: 0 }}>
                Loading…
              </p>
            ) : commands.length === 0 ? (
              <p className="settings-hint" style={{ margin: 0 }}>
                No usage data for this range.
              </p>
            ) : (
              <ul className="gov-rank-list">
                {commands.slice(0, 8).map((row) => (
                  <li key={`${row.command_name}:${row.category ?? ''}`} className="gov-rank-row">
                    <div className="gov-rank-label">
                      <code className="gov-rank-name">{row.command_name}</code>
                      {row.category && <span className="gov-rank-sub">{row.category}</span>}
                    </div>
                    <div className="gov-rank-bar-wrap" aria-hidden>
                      <div className="gov-rank-bar" style={{ width: `${(row.count / maxCmd) * 100}%` }} />
                    </div>
                    <span className="gov-rank-count">{row.count.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="gov-split-card an-module enabled">
          <div className="an-module-header">
            <span className="an-module-name">Top categories</span>
          </div>
          <span className="an-module-desc">Where invocations come from by command category.</span>
          <div className="an-module-body">
            {loading ? (
              <p className="settings-loading" style={{ margin: 0 }}>
                Loading…
              </p>
            ) : categories.length === 0 ? (
              <p className="settings-hint" style={{ margin: 0 }}>
                No category breakdown for this range.
              </p>
            ) : (
              <ul className="gov-rank-list">
                {categories.map((row) => (
                  <li key={row.category} className="gov-rank-row">
                    <div className="gov-rank-label">
                      <span className="gov-rank-cat">{row.category}</span>
                    </div>
                    <div className="gov-rank-bar-wrap gov-rank-bar-wrap--teal" aria-hidden>
                      <div className="gov-rank-bar gov-rank-bar--teal" style={{ width: `${(row.count / maxCat) * 100}%` }} />
                    </div>
                    <span className="gov-rank-count">{row.count.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
