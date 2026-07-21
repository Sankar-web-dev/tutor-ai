'use client'

import { usePathname } from 'next/navigation'
import { SidebarComponent } from '@/components/sidebar/sidebar-component'
import { ReactNode } from 'react'
import type { BreadcrumbItems, SidebarGroup } from '@/components/ui/types'

interface ConditionalLayoutProps {
  children: ReactNode
  logo: ReactNode
  companyName: string
  navigationItems: SidebarGroup[]
  headerUserNav: ReactNode
  breadcrumbItems: BreadcrumbItems
}

export function ConditionalLayout({
  children,
  logo,
  companyName,
  navigationItems,
  headerUserNav,
  breadcrumbItems
}: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/landing'

  if (isLandingPage) {
    return <>{children}</>
  }

  return (
    <SidebarComponent
      logo={logo}
      companyName={companyName}
      navigationItems={navigationItems}
      headerUserNav={headerUserNav}
      breadcrumbItems={breadcrumbItems}
    >
      {children}
    </SidebarComponent>
  )
}
