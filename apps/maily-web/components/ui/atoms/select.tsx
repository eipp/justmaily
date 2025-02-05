import React from 'react';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} />
);

export const SelectTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button {...props}>Select</button>
);

export const SelectValue: React.FC = () => <span>Select value</span>;

export const SelectContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export const SelectItem: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export default Select; 