import { DataColumn } from "../types/labTypes";

interface DataTableProps<T extends object> {
  caption: string;
  columns: DataColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}

function formatValue(value: unknown, precision?: number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(precision ?? 2) : "0.00";
  }
  return String(value ?? "");
}

export function DataTable<T extends object>({
  caption,
  columns,
  rows,
  emptyMessage = "No data collected yet.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">{caption}</h3>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full min-w-[540px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-white">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="border-b border-slate-200 px-4 py-3 font-bold text-slate-700">
                  {column.label}
                  {column.unit ? <span className="font-medium text-slate-500"> ({column.unit})</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-slate-50/60" : "bg-white"}>
                  {columns.map((column) => (
                    <td key={String(column.key)} className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatValue(row[column.key], column.precision)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
