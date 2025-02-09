'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectMemory } from '@/lib/hooks/use-project-memory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import {
  SearchIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  KeyboardIcon,
  BellIcon
} from 'lucide-react'
import { useSupabase } from '@/lib/providers/supabase'

export function TopNavigation() {
  const router = useRouter()
  const { currentProject } = useProjectMemory()
  const { supabase, user } = useSupabase()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-800">
      {/* Project Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">
          {currentProject?.name || 'Select a Project'}
        </h1>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center space-x-4">
        {/* Global Search */}
        <Button
          variant="outline"
          className="w-72"
          onClick={() => setIsSearchOpen(true)}
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          <span className="text-sm text-gray-500">Search...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <span>⌘</span>K
          </kbd>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5" />
        </Button>

        {/* Help */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircleIcon className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Help & Resources</DialogTitle>
              <DialogDescription>
                Get help with JustMaily or learn more about its features.
              </DialogDescription>
            </DialogHeader>
            {/* Help content */}
          </DialogContent>
        </Dialog>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.user_metadata?.full_name}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Command Menu */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Projects">
            {/* Project search results */}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Campaigns">
            {/* Campaign search results */}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Contacts">
            {/* Contact search results */}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <KeyboardIcon className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
} 