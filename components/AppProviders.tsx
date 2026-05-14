'use client'

import { DashboardGuildBreadcrumbProvider } from '@/components/DashboardGuildBreadcrumbContext'
import { GuildSettingsMobileNavProvider } from '@/components/GuildSettingsMobileNavContext'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GuildSettingsMobileNavProvider>
      <DashboardGuildBreadcrumbProvider>{children}</DashboardGuildBreadcrumbProvider>
    </GuildSettingsMobileNavProvider>
  )
}
