import type { ReactNode } from 'react';

interface DataTableProps {
  columns: { label: string; key: string }[];
  rows: Record<string, ReactNode>[];
  className?: string;
}

export function DataTable({ columns, rows, className = '' }: DataTableProps) {
  return (
    <div className={`table-shell ${className}`}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
