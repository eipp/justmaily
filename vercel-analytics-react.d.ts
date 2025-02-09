import React from 'react';

declare module '@vercel/analytics/react' {
  export const Analytics: React.ComponentType<any>;
  export type AnalyticsProps = any;
} 