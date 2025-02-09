import React from 'react';

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({ leftPanel, centerPanel, rightPanel }) => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r p-4">
        {leftPanel}
      </div>
      <div className="w-1/2 p-4">
        {centerPanel}
      </div>
      <div className="w-1/4 border-l p-4">
        {rightPanel}
      </div>
    </div>
  );
};

export default ThreePanelLayout; 