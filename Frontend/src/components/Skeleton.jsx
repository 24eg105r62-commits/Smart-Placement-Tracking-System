export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="glass-card p-5">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="mt-3 h-7 w-16" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-3">
        {Array.from({ length: cols }).map((__, c) => (
          <Skeleton key={c} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
