'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { MainLayout } from '@/components/layouts/main-layout'
import { Button } from '@/components/ui/atoms/button'
import { cn } from '@/lib/utils'

interface AnalyticsLayoutProps {
  children: React.ReactNode
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: 'Overview',
      href: '/analytics',
    },
    {
      label: 'Campaigns',
      href: '/analytics/campaigns',
    },
    {
      label: 'Subscribers',
      href: '/analytics/subscribers',
    },
    {
      label: 'Growth',
      href: '/analytics/growth',
    },
    {
      label: 'Engagement',
      href: '/analytics/engagement',
    },
  ]

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={pathname === route.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'justify-start',
                    pathname === route.href && 'bg-muted font-medium'
                  )}
                  asChild
                >
                  <a href={route.href}>{route.label}</a>
                </Button>
              ))}
            </nav>
          </aside>
          <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
      </div>
    </MainLayout>
  )
} 