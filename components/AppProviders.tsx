'use client'

import { GuildSettingsMobileNavProvider } from '@/components/GuildSettingsMobileNavContext'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <GuildSettingsMobileNavProvider>{children}</GuildSettingsMobileNavProvider>
}
