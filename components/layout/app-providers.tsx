'use client'

import { DashboardGuildBreadcrumbProvider } from '@/components/dashboard/breadcrumb-context'
import { GuildSettingsMobileNavProvider } from '@/components/dashboard/mobile-nav-context'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GuildSettingsMobileNavProvider>
      <DashboardGuildBreadcrumbProvider>{children}</DashboardGuildBreadcrumbProvider>
    </GuildSettingsMobileNavProvider>
  )
}
