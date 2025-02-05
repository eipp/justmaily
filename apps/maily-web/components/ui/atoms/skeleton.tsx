import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '1rem' }) => {
  return (
    <div style={{ width, height, backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
  );
};

export default Skeleton;
export { Skeleton }; 