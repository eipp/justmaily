"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNav = UserNav;
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/atoms/button");
const dropdown_menu_1 = require("@/components/ui/atoms/dropdown-menu");
const avatar_1 = require("@/components/ui/atoms/avatar");
function UserNav() {
    return (<dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenuTrigger asChild>
        <button_1.Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <avatar_1.Avatar className="h-8 w-8">
            <avatar_1.AvatarImage src="/avatars/01.png" alt="@username"/>
            <avatar_1.AvatarFallback>SC</avatar_1.AvatarFallback>
          </avatar_1.Avatar>
        </button_1.Button>
      </dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent className="w-56" align="end" forceMount>
        <dropdown_menu_1.DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">username</p>
            <p className="text-xs leading-none text-muted-foreground">
              m@example.com
            </p>
          </div>
        </dropdown_menu_1.DropdownMenuLabel>
        <dropdown_menu_1.DropdownMenuSeparator />
        <dropdown_menu_1.DropdownMenuGroup>
          <dropdown_menu_1.DropdownMenuItem>
            <lucide_react_1.User className="mr-2 h-4 w-4"/>
            <span>Profile</span>
            <dropdown_menu_1.DropdownMenuShortcut>⇧⌘P</dropdown_menu_1.DropdownMenuShortcut>
          </dropdown_menu_1.DropdownMenuItem>
          <dropdown_menu_1.DropdownMenuItem>
            <lucide_react_1.CreditCard className="mr-2 h-4 w-4"/>
            <span>Billing</span>
            <dropdown_menu_1.DropdownMenuShortcut>⌘B</dropdown_menu_1.DropdownMenuShortcut>
          </dropdown_menu_1.DropdownMenuItem>
          <dropdown_menu_1.DropdownMenuItem>
            <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
            <span>Settings</span>
            <dropdown_menu_1.DropdownMenuShortcut>⌘S</dropdown_menu_1.DropdownMenuShortcut>
          </dropdown_menu_1.DropdownMenuItem>
        </dropdown_menu_1.DropdownMenuGroup>
        <dropdown_menu_1.DropdownMenuSeparator />
        <dropdown_menu_1.DropdownMenuItem>
          <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
          <span>Log out</span>
          <dropdown_menu_1.DropdownMenuShortcut>⇧⌘Q</dropdown_menu_1.DropdownMenuShortcut>
        </dropdown_menu_1.DropdownMenuItem>
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>);
}
