import React from 'react';

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value = '', onChange }) => {
  // This is a placeholder rich text editor component.
  return (
    <textarea
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      style={{ width: '100%', height: '200px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
    />
  );
};

export default Editor;
export { Editor }; 