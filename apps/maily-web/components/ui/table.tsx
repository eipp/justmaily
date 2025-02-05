import React from 'react';

interface TableProps {
  children?: React.ReactNode;
}

export const Table = ({ children }: TableProps) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    {children}
  </table>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead>{children}</thead>
);

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr>{children}</tr>
);

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th>{children}</th>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td>{children}</td>
);

export default Table; 