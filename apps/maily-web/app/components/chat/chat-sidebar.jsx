"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSidebar = ChatSidebar;
const react_1 = require("react");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const navigation = [
    {
        name: "Dashboard",
        icon: lucide_react_1.LayoutDashboard,
    },
    {
        name: "Campaigns",
        icon: lucide_react_1.Inbox,
    },
    {
        name: "Contacts",
        icon: lucide_react_1.Users,
    },
    {
        name: "Templates",
        icon: lucide_react_1.FileText,
    },
    {
        name: "Analytics",
        icon: lucide_react_1.BarChart,
    },
    {
        name: "Settings",
        icon: lucide_react_1.Settings,
    },
];
function ChatSidebar() {
    const [activeTab, setActiveTab] = (0, react_1.useState)("dashboard");
    return (<div className="flex h-full flex-col border-r">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Maily</h2>
      </div>
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1" orientation="vertical">
        <tabs_1.TabsList className="flex h-full flex-col gap-2 rounded-none border-r bg-background p-2">
          {navigation.map((item) => (<tabs_1.TabsTrigger key={item.name.toLowerCase()} value={item.name.toLowerCase()} className="flex w-full items-center gap-3 justify-start px-3">
              <item.icon className="h-5 w-5"/>
              <span>{item.name}</span>
            </tabs_1.TabsTrigger>))}
        </tabs_1.TabsList>
        <div className="flex-1 p-4">
          {navigation.map((item) => (<tabs_1.TabsContent key={item.name.toLowerCase()} value={item.name.toLowerCase()} className="h-full">
              <h3 className="text-lg font-medium">{item.name}</h3>
              {/* Add content for each tab */}
            </tabs_1.TabsContent>))}
        </div>
      </tabs_1.Tabs>
    </div>);
}
