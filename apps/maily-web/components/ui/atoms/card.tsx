import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

export const Card = ({ children }: CardProps) => (
  <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '0.5rem' }}>
    {children}
  </div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const CardTitle = ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>;
export const CardDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
export const CardContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const CardFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

export default Card; 