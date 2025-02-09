import React from 'react';

interface DialogProps {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ children }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20%',
      left: '20%',
      width: '60%',
      padding: '2rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    }}>
      {children}
    </div>
  );
};

export default Dialog;
export { Dialog };

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2>{children}</h2>
);

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
); 