import React from 'react';

export { default as Table } from '../table';

export const TableCell = (props: React.HTMLAttributes<HTMLTableCellElement>) => {
  return <td {...props} />;
};

export { TableCell }; 