import React from 'react';
import ThreePanelLayout from '@/components/ThreePanelLayout';

export default function HomePage() {
  return (
    <ThreePanelLayout
      leftPanel={<div style={{ padding: '1rem' }}>Navigation Panel (e.g., sidebar with links)</div>}
      centerPanel={<div style={{ padding: '1rem' }}>Main Dashboard (e.g., AI interactions and key metrics)</div>}
      rightPanel={<div style={{ padding: '1rem' }}>Notification/Details Panel (e.g., alerts and notifications)</div>}
    />
  );
}
