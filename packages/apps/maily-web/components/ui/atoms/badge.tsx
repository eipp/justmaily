import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Badge = ({ children, variant = 'primary' }: BadgeProps) => {
  const style = {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: variant === 'primary' ? '#0070f3' : '#aaa',
    color: '#fff',
    fontSize: '0.75rem'
  };
  return <span style={style}>{children}</span>;
}; 