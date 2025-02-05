import React from 'react';

interface TableProps {
  children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      {children}
    </table>
  );
};

export default Table; 