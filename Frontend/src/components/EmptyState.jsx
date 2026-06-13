const EmptyState = ({ title = 'Nothing here yet', description, icon: Icon, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center dark:border-slate-700">
    {Icon && (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </span>
    )}
    <div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
