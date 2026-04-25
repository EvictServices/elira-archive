export interface NavItem {
  title: string
  href: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const docsNav: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/getting-started/introduction' },
    ],
  },
  {
    title: 'AntiNuke',
    items: [
      { title: 'Setup', href: '/docs/antinuke/setup' },
    ],
  },
]
