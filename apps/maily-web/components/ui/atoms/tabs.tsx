"use client";

import React, { useState } from 'react';

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

export const TabsList = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const TabsTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>;
export const TabsContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>; 