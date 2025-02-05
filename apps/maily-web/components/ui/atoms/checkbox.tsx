import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox: React.FC<CheckboxProps> = (props) => {
  return (
    <input type="checkbox" {...props} style={{ width: '1rem', height: '1rem' }} />
  );
};

export default Checkbox; 