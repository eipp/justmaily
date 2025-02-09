import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
}

const Progress: React.FC<ProgressProps> = ({ value, max = 100 }) => {
  const percentage = (value / max) * 100;
  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
      <div style={{ width: `${percentage}%`, backgroundColor: '#0070f3', height: '1rem', borderRadius: '4px' }} />
    </div>
  );
};

export default Progress;
export { Progress }; 