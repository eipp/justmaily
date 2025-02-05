import React, { useState } from 'react';

interface DropdownMenuProps {
  options: string[];
  onSelect?: (option: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('');

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={toggleMenu} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}>
        {selected || 'Select an option'}
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, border: '1px solid #ddd', borderRadius: '0.25rem', backgroundColor: '#fff', zIndex: 1000 }}>
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DropdownMenuTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => <button {...props} />;
export const DropdownMenuContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
export const DropdownMenuLabel: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
export const DropdownMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => <div {...props} />;
export const DropdownMenuSeparator: React.FC = () => <hr />;

export { DropdownMenu };
export default DropdownMenu; 