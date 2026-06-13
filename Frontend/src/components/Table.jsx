export const Table = ({ columns, children, className = '' }) => (
  <div className={`overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 ${className}`}>
    <table className="w-full min-w-[640px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
      <thead className="bg-slate-50 dark:bg-slate-900/60">
        <tr>
          {columns.map((col) => (
            <th key={col.key || col} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {col.label || col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">{children}</tbody>
    </table>
  </div>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 align-middle text-slate-700 dark:text-slate-200 ${className}`}>{children}</td>
);

export const Tr = ({ children, className = '' }) => (
  <tr className={`transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${className}`}>{children}</tr>
);

export default Table;
