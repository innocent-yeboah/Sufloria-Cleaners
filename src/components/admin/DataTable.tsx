import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
};

export default function DataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-navy/8 bg-white shadow-soft">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-navy text-white">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-dark/60"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={rowKey(row)}
                className={index % 2 === 0 ? "bg-white" : "bg-light/50"}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-top text-dark/85 ${col.className || ""}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
