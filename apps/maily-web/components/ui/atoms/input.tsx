import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      style={{
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '0.25rem',
      }}
    />
  );
};

export default Input; 