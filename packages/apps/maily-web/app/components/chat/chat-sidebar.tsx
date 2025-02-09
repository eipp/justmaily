"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  FileText,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Campaigns",
    icon: Inbox,
  },
  {
    name: "Contacts",
    icon: Users,
  },
  {
    name: "Templates",
    icon: FileText,
  },
  {
    name: "Analytics",
    icon: BarChart,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

export function ChatSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Maily</h2>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1"
        orientation="vertical"
      >
        <TabsList className="flex h-full flex-col gap-2 rounded-none border-r bg-background p-2">
          {navigation.map((item) => (
            <TabsTrigger
              key={item.name.toLowerCase()}
              value={item.name.toLowerCase()}
              className="flex w-full items-center gap-3 justify-start px-3"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-1 p-4">
          {navigation.map((item) => (
            <TabsContent
              key={item.name.toLowerCase()}
              value={item.name.toLowerCase()}
              className="h-full"
            >
              <h3 className="text-lg font-medium">{item.name}</h3>
              {/* Add content for each tab */}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
} 