import React from 'react';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default ThemeProvider; 