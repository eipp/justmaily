import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = (props) => {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '0.25rem',
        minHeight: '100px'
      }}
    />
  );
};

export default Textarea; 