export interface NavItem {
  title: string
  href: string
  items?: NavItem[]
}

export interface NavGroup {
  title: string
  icon?: string
  items: NavItem[]
}

export const docsNav: NavGroup[] = [
  {
    title: 'Getting Started',
    icon: 'book',
    items: [
      { title: 'Introduction', href: '/docs/getting-started/introduction' },
    ],
  },
  {
    title: 'AntiNuke',
    icon: 'shield',
    items: [
      {
        title: 'Setup',
        href: '/docs/antinuke/setup',
        items: [
          { title: 'Ban', href: '/docs/antinuke/ban' },
          { title: 'Kick', href: '/docs/antinuke/kick' },
          { title: 'Webhook', href: '/docs/antinuke/webhook' },
          { title: 'Channel', href: '/docs/antinuke/channel' },
          { title: 'Emoji', href: '/docs/antinuke/emoji' },
          { title: 'Role', href: '/docs/antinuke/role' },
          { title: 'Bot', href: '/docs/antinuke/bot' },
        ],
      },
    ],
  },
  {
    title: 'Fake Permissions',
    icon: 'hammer',
    items: [
      { title: 'Setup', href: '/docs/fakepermissions/setup' },
    ],
  },
]
