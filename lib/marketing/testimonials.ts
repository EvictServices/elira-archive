export type Testimonial = {
  id: string
  quote: string
  /** Discord display name */
  displayName: string
  /** Discord username (without @) */
  username: string
  /** Role in the server (e.g. Owner, Admin) */
  role: string
  guildName: string
  guildIconUrl: string | null
  userAvatarUrl: string | null
}

export const TESTIMONIALS_PER_VIEW = 5
export const TESTIMONIAL_CYCLE_MS = 7200

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      'We dropped three bots after switching to Evict. Antinuke and VoiceMaster alone paid for the migration in a week.',
    displayName: 'Maya',
    username: 'mayavc',
    role: 'Server Owner',
    guildName: 'Lunar Arcade',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '2',
    quote:
      'Invoke scripts and logging are finally in one place. My mods stopped asking which bot to use for bans.',
    displayName: 'Jordan',
    username: 'jordank',
    role: 'Head Moderator',
    guildName: 'Northline RP',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '3',
    quote:
      'Tickets, starboard, and reaction roles without stacking extras — our members noticed the cleaner setup immediately.',
    displayName: 'Sage',
    username: 'sageops',
    role: 'Community Director',
    guildName: 'Pixel Loft',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '4',
    quote:
      'Voice channels that owners can actually manage in-server. No more ping-fests when someone locks a room wrong.',
    displayName: 'Riley',
    username: 'rileyt',
    role: 'Admin',
    guildName: 'Echo Hangout',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '5',
    quote:
      'Fake permissions let us give helpers mod tools without handing out dangerous Discord roles. Huge for trust.',
    displayName: 'Alex',
    username: 'alexc',
    role: 'Co-Owner',
    guildName: 'Vault Society',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '6',
    quote:
      'The dashboard is fast enough that I configure logging and automod between meetings. It just stays out of the way.',
    displayName: 'Noah',
    username: 'noahdev',
    role: 'Server Manager',
    guildName: 'Studio 14',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '7',
    quote:
      'Automod and command ignore lists took ten minutes to set up. Our spam problem basically disappeared overnight.',
    displayName: 'Casey',
    username: 'caseyr',
    role: 'Moderator',
    guildName: 'Midnight Café',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '8',
    quote:
      'Booster roles and welcome flows in one bot meant we could finally drop the “utility” bot from our sidebar.',
    displayName: 'Taylor',
    username: 'taylorb',
    role: 'Owner',
    guildName: 'Bloom Social',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '9',
    quote:
      'Highlights and starboard keep our staff in the loop without watching every channel. Worth it for busy servers alone.',
    displayName: 'Quinn',
    username: 'quinnd',
    role: 'Community Lead',
    guildName: 'Orbit Creators',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
  {
    id: '10',
    quote:
      'We migrated from a stack of five bots. Members still ask if we added features — we actually removed bots.',
    displayName: 'Sam',
    username: 'samw',
    role: 'Administrator',
    guildName: 'District Zero',
    guildIconUrl: null,
    userAvatarUrl: null,
  },
]

export function testimonialPageCount(): number {
  return Math.ceil(TESTIMONIALS.length / TESTIMONIALS_PER_VIEW)
}

export function testimonialsForPage(page: number): Testimonial[] {
  const start = page * TESTIMONIALS_PER_VIEW
  return TESTIMONIALS.slice(start, start + TESTIMONIALS_PER_VIEW)
}
