"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopNav = TopNav;
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/atoms/button");
const input_1 = require("@/components/ui/atoms/input");
const user_nav_1 = require("@/components/layouts/user-nav");
function TopNav() {
    return (<header className="flex h-14 items-center gap-4 border-b bg-muted/10 px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
          <input_1.Input placeholder="Search..." className="w-full pl-8"/>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button_1.Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <lucide_react_1.Bell className="h-4 w-4"/>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"/>
        </button_1.Button>
        <user_nav_1.UserNav />
      </div>
    </header>);
}
