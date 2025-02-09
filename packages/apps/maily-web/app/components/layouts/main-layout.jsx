"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainLayout = MainLayout;
const React = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const nextjs_1 = require("@clerk/nextjs");
const navigation_2 = require("next/navigation");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/atoms/button");
const store_1 = require("@/store");
function MainLayout({ children }) {
    const pathname = (0, navigation_1.usePathname)();
    const [isMounted, setIsMounted] = React.useState(false);
    const { signOut } = (0, nextjs_1.useClerk)();
    const router = (0, navigation_2.useRouter)();
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const { user } = (0, store_1.useStore)();
    React.useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) {
        return null;
    }
    const routes = [
        {
            label: 'Dashboard',
            icon: lucide_react_1.LayoutDashboard,
            href: '/dashboard',
            color: 'text-sky-500',
        },
        {
            label: 'Campaigns',
            icon: lucide_react_1.Mail,
            href: '/campaigns',
            color: 'text-violet-500',
        },
        {
            label: 'Subscribers',
            icon: lucide_react_1.Users,
            color: 'text-pink-700',
            href: '/subscribers',
        },
        {
            label: 'Analytics',
            icon: lucide_react_1.BarChart,
            color: 'text-orange-700',
            href: '/analytics',
        },
        {
            label: 'Settings',
            icon: lucide_react_1.Settings,
            href: '/settings',
        },
    ];
    const onNavigate = (url, mobile = false) => {
        if (mobile) {
            setSidebarOpen(false);
        }
        router.push(url);
    };
    return (<div className="h-full relative">
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <div className="h-full border-r flex flex-col bg-background">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <h1 className="text-2xl font-bold">Maily</h1>
            </div>
            <div className="space-y-1">
              {routes.map((route) => (<button_1.Button key={route.href} variant={pathname === route.href ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => onNavigate(route.href)}>
                  <route.icon className={(0, utils_1.cn)('h-5 w-5 mr-3', route.color)}/>
                  {route.label}
                </button_1.Button>))}
            </div>
          </div>
          <div className="mt-auto p-6">
            <button_1.Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
              <lucide_react_1.LogOut className="h-5 w-5 mr-3"/>
              Logout
            </button_1.Button>
          </div>
        </div>
      </div>
      <main className="md:pl-72 h-full">
        <div className="h-full overflow-auto">{children}</div>
      </main>
    </div>);
}
