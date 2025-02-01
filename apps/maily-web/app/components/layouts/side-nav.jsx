"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideNav = SideNav;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/atoms/button");
const navItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: lucide_react_1.LayoutDashboard,
    },
    {
        title: 'Campaigns',
        href: '/dashboard/campaigns',
        icon: lucide_react_1.Mail,
    },
    {
        title: 'Team',
        href: '/dashboard/team',
        icon: lucide_react_1.Users,
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: lucide_react_1.Settings,
    },
];
function SideNav() {
    const pathname = (0, navigation_1.usePathname)();
    return (<div className="flex h-full w-[200px] flex-col border-r bg-muted/10">
      <div className="flex h-14 items-center border-b px-4">
        <link_1.default href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Maily</span>
        </link_1.default>
      </div>
      <div className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (<button_1.Button key={item.href} variant="ghost" className={(0, utils_1.cn)('w-full justify-start', pathname === item.href && 'bg-muted')} asChild>
            <link_1.default href={item.href}>
              <item.icon className="mr-2 h-4 w-4"/>
              {item.title}
            </link_1.default>
          </button_1.Button>))}
      </div>
    </div>);
}
