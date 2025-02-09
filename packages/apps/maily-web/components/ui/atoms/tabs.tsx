"use client";

import React, { useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: string[];
  initialActiveTab?: string;
  onSelectTab?: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, initialActiveTab, onSelectTab }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || tabs[0]);
  
  const handleClick = (tab: string) => {
    setActiveTab(tab);
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {tabs.map(tab => (
        <button
          key={tab}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '0.25rem',
            backgroundColor: tab === activeTab ? '#0070f3' : '#fff',
            color: tab === activeTab ? '#fff' : '#000',
          }}
          onClick={() => handleClick(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface MyTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, MyTabsTriggerProps>(
  ({ children, value, className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface MyTabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, MyTabsContentProps>(
  ({ children, value, className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      value={value}
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName; 