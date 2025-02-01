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
exports.default = AnalyticsLayout;
const React = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const main_layout_1 = require("@/components/layouts/main-layout");
const button_1 = require("@/components/ui/atoms/button");
const utils_1 = require("@/lib/utils");
function AnalyticsLayout({ children }) {
    const pathname = (0, navigation_1.usePathname)();
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
    ];
    return (<main_layout_1.MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              {routes.map((route) => (<button_1.Button key={route.href} variant={pathname === route.href ? 'secondary' : 'ghost'} className={(0, utils_1.cn)('justify-start', pathname === route.href && 'bg-muted font-medium')} asChild>
                  <a href={route.href}>{route.label}</a>
                </button_1.Button>))}
            </nav>
          </aside>
          <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
      </div>
    </main_layout_1.MainLayout>);
}
