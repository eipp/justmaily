'use client'

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'

import { Button } from '@/components/ui/atoms/button'
import { Input } from '@/components/ui/atoms/input'
import { UserNav } from '@/components/layouts/user-nav'

export function TopNav() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/10 px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-full pl-8"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <UserNav />
      </div>
    </header>
  )
} 