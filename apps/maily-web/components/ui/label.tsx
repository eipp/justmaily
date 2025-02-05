import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = (props) => {
  return (
    <label
      {...props}
      style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
    />
  );
};

export default Label;
export { Label }; 