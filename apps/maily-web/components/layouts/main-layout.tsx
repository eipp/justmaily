import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '1rem' }}>
      {children}
    </div>
  );
};

export default MainLayout; 