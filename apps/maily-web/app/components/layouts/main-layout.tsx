'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  Users,
  Settings,
  BarChart,
  LogOut,
} from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/atoms/button'
import { ScrollArea } from '@/components/ui/atoms/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/atoms/sheet'
import { useStore } from '@/store'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = React.useState(false)
  const { signOut } = useClerk()
  const router = useRouter()
  const [isSidebarOpen, setSidebarOpen] = React.useState(true)
  const { user } = useStore()

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-sky-500',
    },
    {
      label: 'Campaigns',
      icon: Mail,
      href: '/campaigns',
      color: 'text-violet-500',
    },
    {
      label: 'Subscribers',
      icon: Users,
      color: 'text-pink-700',
      href: '/subscribers',
    },
    {
      label: 'Analytics',
      icon: BarChart,
      color: 'text-orange-700',
      href: '/analytics',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ]

  const onNavigate = (url: string, mobile: boolean = false) => {
    if (mobile) {
      setSidebarOpen(false)
    }
    router.push(url)
  }

  return (
    <div className="h-full relative">
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <div className="h-full border-r flex flex-col bg-background">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <h1 className="text-2xl font-bold">Maily</h1>
            </div>
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={pathname === route.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onNavigate(route.href)}
                >
                  <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                  {route.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-auto p-6">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <main className="md:pl-72 h-full">
        <div className="h-full overflow-auto">{children}</div>
      </main>
    </div>
  )
} 