export type LogTag = 'halt' | 'ok' | 'log' | 'deny' | 'sent'

export type HeroBentoIcon =
  | 'shield'
  | 'voice'
  | 'mod'
  | 'ticket'
  | 'gift'
  | 'star'
  | 'bell'
  | 'roles'
  | 'gem'
  | 'users'
  | 'terminal'

export type HeroBentoCard =
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      pill?: string
      body: { type: 'log'; events: { tag: LogTag; label: string; msg: string }[] }
    }
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      body: { type: 'wave'; desc: string }
    }
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      body: { type: 'meter'; stat: string; fill: number }
    }
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      pill?: string
      body: {
        type: 'thread'
        primary: string
        secondary: string
        hasReply?: boolean
      }
    }
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      body: { type: 'stat'; value: string }
    }
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      body: {
        type: 'giveaway'
        frames: { entries: number; ends: string; fill: number }[]
      }
    }
  | {
      id: string
      title: string
      icon: HeroBentoIcon
      body: { type: 'chips'; items: string[] }
    }

export type HeroBentoSet = {
  id: string
  detail: string
  detailStrong: string
  cards: [HeroBentoCard, HeroBentoCard, HeroBentoCard, HeroBentoCard]
}

export const HERO_BENTO_SETS: HeroBentoSet[] = [
  {
    id: 'core',
    detailStrong: 'Core stack',
    detail: 'protection, voice, moderation, and support intake in one install.',
    cards: [
      {
        id: 'antinuke',
        title: 'Antinuke',
        icon: 'shield',
        body: {
          type: 'log',
          events: [
            { tag: 'halt', label: 'halted', msg: 'channel_delete ×14' },
            { tag: 'halt', label: 'halted', msg: 'role_grant → @unknown' },
            { tag: 'ok', label: 'reverted', msg: 'webhook_spam #general' },
            { tag: 'halt', label: 'halted', msg: 'ban wave blocked' },
            { tag: 'ok', label: 'reverted', msg: 'perms snapshot restored' },
          ],
        },
      },
      {
        id: 'voicemaster',
        title: 'Voicemaster',
        icon: 'voice',
        body: { type: 'wave', desc: 'Join-to-create · Lock · Claim · Limits' },
      },
      {
        id: 'moderation',
        title: 'Moderation',
        icon: 'mod',
        body: { type: 'meter', stat: 'Invoke · Automod · Logging', fill: 72 },
      },
      {
        id: 'tickets',
        title: 'Tickets',
        icon: 'ticket',
        pill: 'Open',
        body: {
          type: 'thread',
          primary: 'Need help with channel perms',
          secondary: 'Waiting for staff…',
        },
      },
    ],
  },
  {
    id: 'community',
    detailStrong: 'Community tools',
    detail: 'giveaways, starboard, highlights, and self-serve roles — no extra bots.',
    cards: [
      {
        id: 'giveaways',
        title: 'Giveaways',
        icon: 'gift',
        body: {
          type: 'giveaway',
          frames: [
            { entries: 48, ends: '3h 12m', fill: 62 },
            { entries: 51, ends: '3h 08m', fill: 68 },
            { entries: 54, ends: '3h 04m', fill: 74 },
            { entries: 58, ends: '2h 58m', fill: 81 },
          ],
        },
      },
      {
        id: 'starboard',
        title: 'Starboard',
        icon: 'star',
        body: {
          type: 'log',
          events: [
            { tag: 'log', label: 'posted', msg: '#highlights ← 24 ★' },
            { tag: 'log', label: 'posted', msg: 'meme monday → board' },
            { tag: 'log', label: 'posted', msg: 'threshold 15 ★ met' },
          ],
        },
      },
      {
        id: 'highlights',
        title: 'Highlights',
        icon: 'bell',
        pill: 'DM',
        body: {
          type: 'thread',
          primary: 'Keyword “release” in #announcements',
          secondary: 'Sent to your inbox',
          hasReply: true,
        },
      },
      {
        id: 'roles',
        title: 'Reaction roles',
        icon: 'roles',
        body: {
          type: 'chips',
          items: ['@Announcements', '@Colors', '@Pings', '+2 menus'],
        },
      },
    ],
  },
  {
    id: 'staff',
    detailStrong: 'Staff workflows',
    detail: 'logging, automod, fake permissions, and invoke scripts for your team.',
    cards: [
      {
        id: 'logging',
        title: 'Logging',
        icon: 'mod',
        body: {
          type: 'log',
          events: [
            { tag: 'log', label: 'logged', msg: 'purge 42 #general' },
            { tag: 'log', label: 'logged', msg: 'timeout 7d @member' },
            { tag: 'log', label: 'logged', msg: 'role_update Mod' },
            { tag: 'log', label: 'logged', msg: 'voice_join Stage' },
          ],
        },
      },
      {
        id: 'automod',
        title: 'Automod',
        icon: 'shield',
        body: { type: 'meter', stat: 'Live rules · role ignores', fill: 81 },
      },
      {
        id: 'fakeperms',
        title: 'Fake permissions',
        icon: 'shield',
        body: { type: 'chips', items: ['Ban', 'Mute', 'Manage channels', 'No dangerous roles'] },
      },
      {
        id: 'invoke',
        title: 'Invoke',
        icon: 'terminal',
        body: {
          type: 'log',
          events: [
            { tag: 'sent', label: 'sent', msg: 'template ban → #mod-log' },
            { tag: 'sent', label: 'sent', msg: 'workflow softban' },
            { tag: 'sent', label: 'sent', msg: 'warn step 2' },
          ],
        },
      },
    ],
  },
  {
    id: 'growth',
    detailStrong: 'Growth & perks',
    detail: 'booster roles, welcome flows, rewards, and command flexibility.',
    cards: [
      {
        id: 'booster',
        title: 'Booster roles',
        icon: 'gem',
        body: { type: 'chips', items: ['Custom name', 'Hoisted', 'Color pick', '2 slots'] },
      },
      {
        id: 'welcome',
        title: 'Welcome flows',
        icon: 'users',
        pill: 'Live',
        body: {
          type: 'thread',
          primary: 'Welcome @member — rules in #info',
          secondary: 'Auto-role: Member',
          hasReply: true,
        },
      },
      {
        id: 'rewards',
        title: 'Rewards',
        icon: 'gift',
        body: { type: 'meter', stat: 'Server tag · vanity rep', fill: 58 },
      },
      {
        id: 'commands',
        title: 'Custom & server prefix',
        icon: 'terminal',
        body: { type: 'stat', value: 'Server ;evict · custom ;p · per-user' },
      },
    ],
  },
]

export const HERO_BENTO_CYCLE_MS = 5600
