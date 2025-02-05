import React from 'react';

interface DataTableProps {
  data?: any[];
}

const DataTable: React.FC<DataTableProps> = ({ data = [] }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Column 1</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Column 2</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.col1}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.col2}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
export { DataTable }; 