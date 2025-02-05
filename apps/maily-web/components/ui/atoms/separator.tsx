import React from 'react';

const Separator: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <hr className={`border-t my-4 ${className}`} />;
};

export default Separator; 