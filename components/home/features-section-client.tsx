'use client'

import { useState } from 'react'
import type { VoicemasterDemoMember } from '@/lib/marketing/voicemaster-demo'

type ModTab = 'antinuke' | 'logging' | 'invoke' | 'automod'

const MOD_TABS: { id: ModTab; num: string; label: string }[] = [
  { id: 'antinuke', num: '01', label: 'Antinuke' },
  { id: 'logging', num: '02', label: 'Logging' },
  { id: 'invoke', num: '03', label: 'Invoke' },
  { id: 'automod', num: '04', label: 'Automod' },
]

const MOD_COPY: Record<
  ModTab,
  {
    title: string
    body: string
    stat: string
    events: { time: string; code: string; msg: string }[]
  }
> = {
  antinuke: {
    title: 'Antinuke',
    body: 'Trusted admins, whitelists, and per-module limits. Mass actions get reversed before they become permanent.',
    stat: '12 modules',
    events: [
      { time: '14:02:18', code: 'halted', msg: 'channel_delete ×14' },
      { time: '14:02:19', code: 'halted', msg: 'role_grant → @unknown' },
      { time: '14:02:21', code: 'halted', msg: 'webhook_spam #general' },
      { time: '14:02:24', code: 'halted', msg: 'role_rename flood' },
    ],
  },
  logging: {
    title: 'Logging',
    body: 'Mirror joins, edits, purges, and mod actions into dedicated channels with per-event routing.',
    stat: '8 events',
    events: [
      { time: '09:41:03', code: 'logged', msg: 'purge 42 messages' },
      { time: '09:41:07', code: 'logged', msg: 'timeout 7d @member' },
      { time: '09:41:12', code: 'logged', msg: 'role_update Moderator' },
      { time: '09:41:18', code: 'logged', msg: 'voice_join Stage Hall' },
    ],
  },
  invoke: {
    title: 'Invoke',
    body: 'Fire scripted embeds on ban, kick, timeout, and more — same format every time, zero copy-paste.',
    stat: '6 hooks',
    events: [
      { time: '22:15:01', code: 'sent', msg: 'template ban → #mod-log' },
      { time: '22:15:04', code: 'sent', msg: 'template kick @user' },
      { time: '22:15:09', code: 'sent', msg: 'workflow softban' },
      { time: '22:15:11', code: 'sent', msg: 'warn step 2' },
    ],
  },
  automod: {
    title: 'Automod',
    body: 'Per-channel disables, role ignores, and restrictions — configure once, enforced instantly.',
    stat: 'live rules',
    events: [
      { time: '11:08:44', code: 'denied', msg: 'music #announcements' },
      { time: '11:08:46', code: 'denied', msg: 'mention_mass ×5' },
      { time: '11:08:49', code: 'denied', msg: 'invite cooldown' },
      { time: '11:08:52', code: 'denied', msg: 'cmd ignore_list' },
    ],
  },
}

const VOICE_ACTIONS = [
  { id: 'lock', label: 'Lock', hint: 'Only people you allow can enter the channel.' },
  { id: 'limit', label: 'Cap', hint: 'Set a max headcount for the room.' },
  { id: 'rename', label: 'Rename', hint: 'Change the channel name on the fly.' },
  { id: 'bitrate', label: 'Bitrate', hint: 'Adjust audio quality in kbps.' },
  { id: 'claim', label: 'Claim', hint: 'Take ownership if the owner left.' },
  { id: 'ghost', label: 'Ghost', hint: 'Hide the channel from the public list.' },
] as const

const WAVE_BAR_COUNT = 32

type AuditCategory = 'channels' | 'messages' | 'roles' | 'members' | 'moderation'

const AUDIT_CATEGORIES: { id: AuditCategory; num: string; label: string; count: string }[] = [
  { id: 'channels', num: '01', label: 'Channels', count: '6 routes' },
  { id: 'messages', num: '02', label: 'Messages', count: '5 routes' },
  { id: 'roles', num: '03', label: 'Roles', count: '4 routes' },
  { id: 'members', num: '04', label: 'Members', count: '7 routes' },
  { id: 'moderation', num: '05', label: 'Moderation', count: '8 routes' },
]

const AUDIT_COPY: Record<AuditCategory, { title: string; body: string; route: string }> = {
  channels: {
    title: 'Channels',
    body: 'Creates, edits, deletes, and pins — each wired to its own log channel.',
    route: '#log-channels',
  },
  messages: {
    title: 'Messages',
    body: 'Edits, deletes, and bulk purges captured with before/after context.',
    route: '#log-messages',
  },
  roles: {
    title: 'Roles',
    body: 'Role grants, revokes, and permission changes with moderator attribution.',
    route: '#log-roles',
  },
  members: {
    title: 'Members',
    body: 'Joins, leaves, nicknames, avatars, and boosts in one timeline.',
    route: '#log-members',
  },
  moderation: {
    title: 'Moderation',
    body: 'Bans, kicks, timeouts, and warnings land where your staff expects them.',
    route: '#log-mod',
  },
}

type AuditEvent = {
  id: string
  time: string
  action: string
  actor: string
  target?: string
  detail: string
}

const AUDIT_EVENTS: Record<AuditCategory, AuditEvent[]> = {
  channels: [
    { id: 'ch1', time: '18:04:11', action: 'channel_delete', actor: '@nova', target: '#off-topic', detail: 'Category: Community' },
    { id: 'ch2', time: '18:04:09', action: 'channel_create', actor: '@nova', target: '#staff-chat', detail: 'Type: text · Private' },
    { id: 'ch3', time: '17:58:42', action: 'channel_update', actor: '@iri', target: '#announcements', detail: 'slowmode 0 → 10s' },
    { id: 'ch4', time: '17:41:03', action: 'channel_delete', actor: '@mod', target: '#temp-vc', detail: 'Type: voice' },
    { id: 'ch5', time: '16:22:18', action: 'channel_pins', actor: '@mercy', target: '#rules', detail: 'Pin added · 1 message' },
  ],
  messages: [
    { id: 'ms1', time: '19:12:07', action: 'message_delete', actor: '@member', target: '#general', detail: 'Attachment removed · 1 image' },
    { id: 'ms2', time: '19:11:54', action: 'message_edit', actor: '@member', target: '#general', detail: '"hello everyone" → "hello everyone :)"' },
    { id: 'ms3', time: '19:08:31', action: 'message_bulk', actor: '@mod', target: '#spam', detail: '42 messages purged' },
    { id: 'ms4', time: '18:55:02', action: 'message_delete', actor: 'Automod', target: '#lounge', detail: 'Blocked phrase · invite link' },
    { id: 'ms5', time: '18:44:19', action: 'message_edit', actor: '@staff', target: '#mod-chat', detail: 'Embed field updated' },
  ],
  roles: [
    { id: 'rl1', time: '20:01:33', action: 'role_create', actor: '@owner', target: 'Event Host', detail: 'Color #5865F2 · hoist off' },
    { id: 'rl2', time: '20:01:28', action: 'role_update', actor: '@owner', target: 'Moderator', detail: 'perms + ManageMessages' },
    { id: 'rl3', time: '19:47:12', action: 'role_delete', actor: '@nova', target: 'Trial Mod', detail: '12 members reassigned' },
    { id: 'rl4', time: '19:30:05', action: 'role_grant', actor: '@iri', target: '@member', detail: 'Role: Verified' },
    { id: 'rl5', time: '19:29:58', action: 'role_revoke', actor: '@iri', target: '@member', detail: 'Role: Muted' },
  ],
  members: [
    { id: 'mb1', time: '21:15:44', action: 'member_join', actor: '@newuser', detail: 'Account age: 142 days · invite: vanity' },
    { id: 'mb2', time: '21:10:02', action: 'member_leave', actor: '@guest', detail: 'Was in server 3h 12m' },
    { id: 'mb3', time: '20:58:19', action: 'nickname_change', actor: '@member', detail: '"coolguy" → "Cool Guy"' },
    { id: 'mb4', time: '20:44:33', action: 'avatar_change', actor: '@member', detail: 'Profile picture updated' },
    { id: 'mb5', time: '20:30:11', action: 'boost', actor: '@supporter', detail: 'Server boost · Level 2' },
  ],
  moderation: [
    { id: 'md1', time: '22:03:18', action: 'ban', actor: '@mod', target: '@troll', detail: 'Reason: raid · delete 1d' },
    { id: 'md2', time: '22:01:04', action: 'timeout', actor: '@mod', target: '@member', detail: 'Duration: 1h · spam' },
    { id: 'md3', time: '21:55:47', action: 'kick', actor: '@mod', target: '@guest', detail: 'Reason: unverified' },
    { id: 'md4', time: '21:48:22', action: 'warn', actor: '@mod', target: '@member', detail: 'Strike 2/3 · language' },
    { id: 'md5', time: '21:40:09', action: 'unban', actor: '@owner', target: '@appeal', detail: 'Appeal approved' },
  ],
}

function channelLabel(owner: VoicemasterDemoMember): string {
  const short = owner.displayName.split(/\s+/)[0] || owner.displayName
  return `${short}'s lounge`
}

type Props = {
  voiceMembers: VoicemasterDemoMember[]
}

export default function FeaturesSectionClient({ voiceMembers }: Props) {
  const [modTab, setModTab] = useState<ModTab>('antinuke')
  const [voiceAction, setVoiceAction] = useState<string>('lock')
  const [auditCategory, setAuditCategory] = useState<AuditCategory>('channels')
  const mod = MOD_COPY[modTab]
  const voice = VOICE_ACTIONS.find((a) => a.id === voiceAction) ?? VOICE_ACTIONS[0]
  const auditEvents = AUDIT_EVENTS[auditCategory]
  const audit = AUDIT_COPY[auditCategory]

  const owner = voiceMembers[0]
  const connectedCount = voiceMembers.length
  const channelName = owner ? channelLabel(owner) : 'voice lounge'

  return (
    <section className="feat" aria-labelledby="feat-heading">
      <p id="feat-heading" className="sr-only">
        Product features
      </p>

      <article className="feat-block" data-reveal>
        <header className="feat-head">
          <span className="feat-index" aria-hidden>
            01
          </span>
          <div className="feat-head-text">
            <h2 className="feat-title">Server protection, wired together</h2>
            <p className="feat-lead">
              Antinuke, logs, invoke scripts, and command rules in one stack — pick a module to see how
              it reads back.
            </p>
          </div>
        </header>

        <div className="feat-console">
          <nav className="feat-rail" role="tablist" aria-label="Protection modules">
            {MOD_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={modTab === t.id}
                className={`feat-rail-btn${modTab === t.id ? ' is-active' : ''}`}
                onClick={() => setModTab(t.id)}
              >
                <span className="feat-rail-num">{t.num}</span>
                <span className="feat-rail-label">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="feat-console-main" role="tabpanel" key={modTab}>
            <div className="feat-console-top">
              <div>
                <h3 className="feat-console-title">{mod.title}</h3>
                <p className="feat-console-desc">{mod.body}</p>
              </div>
              <span className="feat-console-stat">{mod.stat}</span>
            </div>
            <ol className="feat-log" aria-label="Sample event stream">
              {mod.events.map((ev, i) => (
                <li
                  key={`${modTab}-${ev.time}`}
                  className="feat-log-line"
                  style={{ animationDelay: `${0.06 + i * 0.07}s` }}
                >
                  <span className="feat-log-time">{ev.time}</span>
                  <span className={`feat-log-code feat-log-code--${ev.code}`}>{ev.code}</span>
                  <span className="feat-log-msg">{ev.msg}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>

      <article className="feat-block feat-block--voice" data-reveal data-delay="1">
        <header className="feat-head feat-head--end">
          <div className="feat-head-text">
            <h2 className="feat-title">VoiceMaster, member-run rooms</h2>
            <p className="feat-lead">
              Join-to-create channels with owner tools built in. No ticket, no mod ping — just tap a control.
            </p>
          </div>
          <span className="feat-index" aria-hidden>
            02
          </span>
        </header>

        <div className="feat-deck">
          <div className="feat-deck-visual">
            <div className="feat-wave" aria-hidden>
              {Array.from({ length: WAVE_BAR_COUNT }, (_, i) => (
                <span
                  key={i}
                  className="feat-wave-bar"
                  style={{
                    animationDelay: `${((i * 0.11) % 1.4).toFixed(2)}s`,
                    animationDuration: `${(0.65 + (i % 7) * 0.09).toFixed(2)}s`,
                  }}
                />
              ))}
            </div>
            <div className="feat-deck-channel">
              <span className="feat-deck-live" />
              <span className="feat-deck-channel-name">{channelName}</span>
              <span className="feat-deck-channel-meta">
                {connectedCount} connected
              </span>
            </div>
            <div className="feat-deck-avatars" aria-hidden>
              {voiceMembers.map((member, i) => (
                <img
                  key={member.id}
                  src={member.avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="feat-deck-avatar"
                  style={{ zIndex: voiceMembers.length - i }}
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <ul className="feat-deck-roster">
              {voiceMembers.map((member, i) => (
                <li key={member.id} className="feat-deck-roster-row">
                  <img
                    src={member.avatarUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="feat-deck-roster-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <span className="feat-deck-roster-name">{member.displayName}</span>
                  {i === 0 && <span className="feat-deck-roster-badge">owner</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="feat-deck-actions">
            <p className="feat-deck-actions-label">Owner toolkit</p>
            <div className="feat-chips" role="group" aria-label="Channel controls">
              {VOICE_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`feat-chip${voiceAction === a.id ? ' is-active' : ''}`}
                  aria-pressed={voiceAction === a.id}
                  onClick={() => setVoiceAction(a.id)}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="feat-deck-note">
              <strong>{voice.label}</strong> — {voice.hint}
            </p>
          </div>
        </div>
      </article>

      <article className="feat-block feat-block--audit" data-reveal data-delay="2">
        <header className="feat-head">
          <span className="feat-index" aria-hidden>
            03
          </span>
          <div className="feat-head-text">
            <h2 className="feat-title">Audit logging, every surface covered</h2>
            <p className="feat-lead">
              Route channel deletes, message edits, role changes, joins, and mod actions to the right log
              channel — toggle each event on its own.
            </p>
          </div>
        </header>

        <div className="feat-tape">
          <div className="feat-tape-routes">
            <p className="feat-tape-routes-label">Event routes</p>
            <nav className="feat-tape-track" role="tablist" aria-label="Log categories">
              {AUDIT_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={auditCategory === cat.id}
                  className={`feat-tape-node feat-tape-node--${cat.id}${auditCategory === cat.id ? ' is-active' : ''}`}
                  onClick={() => setAuditCategory(cat.id)}
                >
                  <span className="feat-tape-node-rail" aria-hidden>
                    {i < AUDIT_CATEGORIES.length - 1 && <span className="feat-tape-node-line" />}
                    <span className="feat-tape-node-dot" />
                  </span>
                  <span className="feat-tape-node-text">
                    <span className="feat-tape-node-num">{cat.num}</span>
                    <span className="feat-tape-node-label">{cat.label}</span>
                    <span className="feat-tape-node-meta">{cat.count}</span>
                  </span>
                </button>
              ))}
            </nav>
            <div className={`feat-tape-sink feat-tape-sink--${auditCategory}`}>
              <span className="feat-tape-sink-ring" aria-hidden />
              <span className="feat-tape-sink-label">delivering to</span>
              <span className="feat-tape-sink-channel">{audit.route}</span>
            </div>
          </div>

          <div className="feat-tape-stream" role="tabpanel" key={auditCategory}>
            <div className="feat-tape-scan" aria-hidden />
            <div className="feat-tape-stream-head">
              <div>
                <h3 className="feat-tape-stream-title">{audit.title}</h3>
                <p className="feat-tape-stream-desc">{audit.body}</p>
              </div>
            </div>
            <ul className="feat-tape-events" aria-label={`${audit.title} log preview`}>
              {auditEvents.map((ev, i) => (
                <li
                  key={ev.id}
                  className={`feat-tape-event feat-tape-event--${auditCategory}${i === 0 ? ' is-fresh' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <span className="feat-tape-event-time">{ev.time}</span>
                  <span className="feat-tape-event-code">{ev.action}</span>
                  <span className="feat-tape-event-main">
                    <span className="feat-tape-event-actor">{ev.actor}</span>
                    {ev.target && (
                      <>
                        <span className="feat-tape-event-arrow">→</span>
                        <span className="feat-tape-event-target">{ev.target}</span>
                      </>
                    )}
                  </span>
                  <span className="feat-tape-event-detail">{ev.detail}</span>
                </li>
              ))}
            </ul>
            <span className="feat-tape-cursor" aria-hidden />
          </div>
        </div>
      </article>
    </section>
  )
}