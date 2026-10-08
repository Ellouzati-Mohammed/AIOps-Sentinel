import type { ReactNode } from "react";

interface DataTableProps {
  children: ReactNode;
  pagination?: ReactNode;
}

export function DataTable({
  children,
  pagination,
}: DataTableProps) {
  return (
    <div className="data-table-container">
      <div className="table-shell">
        {children}
      </div>

      {pagination && (
        <div className="pagination">
          {pagination}
        </div>
      )}
    </div>
  );
}